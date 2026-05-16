# 12 — Deployment a Vercel

Pasos concretos para llevar BZAPP de cero a producción en Vercel.

## Pre-requisitos

- Cuenta Vercel (Team plan recomendado, USD 20/mes).
- Cuenta Neon, Upstash, Inngest, Resend, MercadoPago.
- Dominio (`bzapp.io` o el que uses).
- GitHub repo conectado.

## Paso 1 — Cuentas externas

### Neon

1. Crear proyecto `bzapp` en región `aws-sa-east-1`.
2. Branches: `main` (prod), `staging`, `dev`.
3. Activar **PITR** en `main` (7 días).
4. Activar la **integración con Vercel** (auto-creación de branch por PR).
5. Copiar `DATABASE_URL` (endpoint pooled) y `DATABASE_URL_UNPOOLED` (direct).

### Upstash

1. Crear database Redis `bzapp-prod` (Global edge).
2. Copiar `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`.

### Inngest

1. Crear app `bzapp` en Inngest cloud.
2. Crear ambientes `Production` y `Branch (preview)`.
3. Copiar `INNGEST_EVENT_KEY` y `INNGEST_SIGNING_KEY`.
4. Configurar el endpoint en `https://bzapp.io/api/inngest` (se registra automáticamente al primer deploy).

### Resend

1. Verificar dominio `bzapp.io` (DKIM, SPF, DMARC records).
2. Crear API key.
3. Configurar webhook a `https://bzapp.io/api/webhooks/resend` para tracking de delivery.

### MercadoPago

1. Crear aplicación en developers.mercadopago.com.
2. Generar `Access Token` de producción y de sandbox.
3. Configurar webhook a `https://bzapp.io/api/webhooks/mercadopago` con eventos `subscription_preapproval`, `subscription_authorized_payment`, `payment`.
4. Copiar el secret de firma.

## Paso 2 — Vercel project

```bash
# Desde la raíz del repo
pnpm i -g vercel
vercel link
```

En el dashboard de Vercel:

1. **Root Directory**: `apps/web` (si usás monorepo). Si no, raíz.
2. **Framework Preset**: Next.js.
3. **Build Command**: `pnpm turbo run build --filter=@bzapp/web` (monorepo) o `pnpm build` (single).
4. **Install Command**: `pnpm install --frozen-lockfile`.
5. **Output Directory**: default.
6. **Node version**: 20.x.

## Paso 3 — Variables de entorno

En **Settings → Environment Variables**, agregar (separar production/preview/development donde corresponda):

```
# DB
DATABASE_URL                       (Production, Preview, Development)
DATABASE_URL_UNPOOLED              (Production, Preview, Development)

# Auth secrets (rotables)
JWT_SECRET
JWT_REFRESH_SECRET
ENCRYPTION_KEY
ENCRYPTION_HASH_KEY

# Upstash
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN

# Inngest
INNGEST_EVENT_KEY
INNGEST_SIGNING_KEY

# MercadoPago
MP_ACCESS_TOKEN                    (Production only — el real)
MP_ACCESS_TOKEN                    (Preview/Development — sandbox token)
MP_WEBHOOK_SECRET

# Resend
RESEND_API_KEY
EMAIL_FROM

# Storage
BLOB_READ_WRITE_TOKEN              (si usás Vercel Blob)

# WhatsApp Cloud (cuando se active)
WA_PHONE_NUMBER_ID
WA_ACCESS_TOKEN
WA_VERIFY_TOKEN

# Observability
SENTRY_DSN
SENTRY_AUTH_TOKEN
AXIOM_TOKEN
AXIOM_DATASET

# Public (NEXT_PUBLIC_*)
NEXT_PUBLIC_APP_URL                # https://bzapp.io
NEXT_PUBLIC_SENTRY_DSN
NEXT_PUBLIC_ABLY_PUBLIC_KEY        # fase 2
```

Para que el equipo pueda pullear:

```bash
vercel env pull apps/web/.env.local
```

## Paso 4 — Migraciones Prisma en deploy

Vercel build no puede correr migraciones contra prod por defecto. Dos enfoques:

### Opción A (recomendada): GitHub Action pre-deploy

```yaml
# .github/workflows/db-migrate-prod.yml
name: Migrate prod DB
on:
  push:
    branches: [main]
    paths:
      - 'packages/db/prisma/**'
jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @bzapp/db prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.NEON_PROD_UNPOOLED_URL }}
```

El workflow corre antes de que Vercel termine el build, así el código nuevo nunca se sirve contra un schema viejo.

### Opción B: Vercel Build Command

```jsonc
// package.json
"scripts": {
  "build": "prisma migrate deploy && next build"
}
```

Más simple pero acopla deploy + migración. Si la migración tarda mucho, el deploy entero falla por timeout.

**Recomendación**: Opción A para `main`, Opción B para previews (preview branches Neon son baratos y descartables).

## Paso 5 — Dominios

1. En Vercel Settings → Domains, agregar:
   - `bzapp.io` (apex)
   - `www.bzapp.io` (redirect)
   - `*.bzapp.io` (wildcard para multi-tenant)
2. Configurar DNS en Cloudflare:
   - `A bzapp.io → 76.76.21.21`
   - `CNAME *.bzapp.io → cname.vercel-dns.com`
   - `CNAME www.bzapp.io → cname.vercel-dns.com`
3. Activar HTTPS (auto).
4. En `middleware.ts`, resolver subdomain → tenant:

```ts
// apps/web/middleware.ts
export function middleware(req: NextRequest) {
  const host = req.headers.get('host') ?? '';
  const sub = host.split('.')[0];
  if (sub && sub !== 'www' && sub !== 'bzapp') {
    req.nextUrl.searchParams.set('__tenant_slug', sub);
  }
  // ... resto
}
```

## Paso 6 — Cron jobs

Definidos en `vercel.json` (ver [09](09-infrastructure.md)). Activos solo en production. Cada cron handler debe:

1. Verificar el header `Authorization: Bearer ${CRON_SECRET}` (Vercel lo agrega automáticamente).
2. Emitir un evento Inngest y devolver 200 rápido.

```ts
// app/api/cron/billing-dunning/route.ts
export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  await inngest.send({ name: 'billing/dunning.tick' });
  return Response.json({ ok: true });
}
```

## Paso 7 — Observabilidad

1. **Sentry**: integración Vercel oficial — Settings → Integrations → Sentry.
2. **Log Drain** a Axiom: Settings → Log Drains → New → Axiom.
3. **Speed Insights**: activar en Settings → Speed Insights.
4. **Web Analytics**: activar en Settings → Web Analytics.

## Paso 8 — Seguridad

1. **Vercel Firewall**: activar (Pro+), reglas básicas anti-abuse.
2. **Deployment Protection**: previews protegidos con SSO o password.
3. **Environment access**: solo el equipo core ve secrets de producción.
4. **Rotación de secrets**: rotación trimestral de JWT_SECRET y MP_ACCESS_TOKEN (con grace period — JWT_SECRET_PREVIOUS soportado en validación).

## Checklist pre-launch a producción

- [ ] Dominio configurado y propagado.
- [ ] DNS records para email (DKIM/SPF/DMARC) válidos en Resend.
- [ ] Neon PITR activo.
- [ ] MercadoPago en modo producción (no sandbox).
- [ ] Webhook MP recibe correctamente (test con `curl` firmado).
- [ ] Inngest registró todas las funciones (visible en dashboard).
- [ ] Sentry recibe errores (forzar un error de prueba).
- [ ] Axiom recibe logs.
- [ ] Health endpoint `/api/health` devuelve 200.
- [ ] Cron jobs visibles en Vercel Crons.
- [ ] Plan de rollback documentado (Vercel "Promote" + Neon branch revert).
- [ ] Backup logical inicial generado.
- [ ] Pentest mínimo OWASP top 10 realizado.
- [ ] Status page configurada (BetterStack o similar).

## Rollback procedure

1. **Solo código**: Vercel → Deployments → Previous → "Promote to Production". 30 segundos.
2. **Con migración rota**:
   - Vercel rollback (paso 1).
   - Neon → Branch `main` → Restore to point-in-time (antes de la migración).
   - O bien crear branch desde snapshot pre-migration y switch DATABASE_URL via env.
3. **Webhook MP en estado inconsistente**: usar Inngest dashboard → replay del último evento procesado correctamente.

## Costos operativos detallados (estimados, fase 1-2)

| Item | Provider | Plan | USD/mes |
| --- | --- | --- | --- |
| Hosting + functions + bandwidth | Vercel | Pro Team | 20 + uso (~10-30) |
| Postgres | Neon | Launch | 19 |
| Redis | Upstash | PAYG | 0-10 |
| Background jobs | Inngest | Starter | 0-20 |
| Object storage | Vercel Blob | uso | 5-15 |
| Email | Resend | Pro | 20 |
| Errores | Sentry | Team | 26 |
| Logs | Axiom | uso | 0-25 |
| **Total estimado** | | | **~100-180 USD** |

A medida que el volumen crece (más de 100 organizaciones activas):

- Vercel function execution puede subir a USD 50-100/mes.
- Inngest puede subir a USD 50-100/mes.
- Considerar migrar storage a R2 (egress gratis).
- Considerar Neon Scale plan (USD 69+, mejor compute autoscaling).
