# 10 — Estructura del monorepo

Una sola Next.js app + paquetes compartidos en monorepo pnpm/turbo. Más simple que un Nest+Web separado, mismo rigor de capas.

```
bzapp/
├── apps/
│   └── web/                                  # Única app Next.js (web + API + admin)
│       ├── app/
│       │   ├── (marketing)/                  # Landing pública
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx
│       │   │   ├── pricing/page.tsx
│       │   │   └── legal/[slug]/page.tsx
│       │   ├── (auth)/
│       │   │   ├── login/page.tsx
│       │   │   ├── register/page.tsx
│       │   │   ├── forgot/page.tsx
│       │   │   └── verify/page.tsx
│       │   ├── (onboarding)/onboarding/
│       │   │   ├── layout.tsx
│       │   │   └── [step]/page.tsx
│       │   ├── (app)/                        # Shell autenticado tenant-scoped
│       │   │   ├── layout.tsx                # Sidebar + topbar + tenant gate
│       │   │   ├── dashboard/page.tsx
│       │   │   ├── cockpit/page.tsx          # Cockpit del guardia
│       │   │   ├── access/
│       │   │   │   ├── page.tsx
│       │   │   │   └── [id]/page.tsx
│       │   │   ├── residents/
│       │   │   ├── units/
│       │   │   ├── vehicles/
│       │   │   ├── authorizations/
│       │   │   ├── alerts/
│       │   │   ├── reports/
│       │   │   ├── settings/
│       │   │   │   ├── general/page.tsx
│       │   │   │   ├── branding/page.tsx
│       │   │   │   ├── members/page.tsx
│       │   │   │   ├── roles/page.tsx
│       │   │   │   ├── access-points/page.tsx
│       │   │   │   ├── integrations/page.tsx
│       │   │   │   ├── api-keys/page.tsx
│       │   │   │   ├── webhooks/page.tsx
│       │   │   │   └── billing/page.tsx
│       │   │   └── audit/page.tsx
│       │   ├── (admin)/admin/                # Super admin (gated)
│       │   │   ├── layout.tsx
│       │   │   ├── organizations/
│       │   │   ├── plans/
│       │   │   ├── feature-flags/
│       │   │   ├── webhooks-inbox/
│       │   │   └── metrics/
│       │   ├── api/
│       │   │   ├── v1/                       # API pública versionada
│       │   │   │   ├── auth/
│       │   │   │   │   ├── login/route.ts
│       │   │   │   │   ├── register/route.ts
│       │   │   │   │   ├── refresh/route.ts
│       │   │   │   │   ├── logout/route.ts
│       │   │   │   │   └── mfa/.../route.ts
│       │   │   │   ├── me/
│       │   │   │   │   ├── route.ts
│       │   │   │   │   ├── abilities/route.ts
│       │   │   │   │   └── switch-organization/route.ts
│       │   │   │   ├── onboarding/
│       │   │   │   ├── organization/
│       │   │   │   ├── members/
│       │   │   │   ├── persons/
│       │   │   │   ├── units/
│       │   │   │   ├── residents/
│       │   │   │   ├── vehicles/
│       │   │   │   ├── authorizations/
│       │   │   │   ├── access/
│       │   │   │   │   ├── check/route.ts
│       │   │   │   │   ├── events/route.ts
│       │   │   │   │   ├── feed/route.ts     # SSE
│       │   │   │   │   └── ocr-plate/route.ts
│       │   │   │   ├── alerts/
│       │   │   │   ├── reports/
│       │   │   │   ├── billing/
│       │   │   │   │   ├── subscription/route.ts
│       │   │   │   │   ├── invoices/
│       │   │   │   │   └── payment-methods/
│       │   │   │   ├── api-keys/
│       │   │   │   └── webhooks/
│       │   │   ├── webhooks/                 # Inbound de terceros
│       │   │   │   ├── mercadopago/route.ts
│       │   │   │   ├── resend/route.ts
│       │   │   │   └── whatsapp/route.ts
│       │   │   ├── inngest/route.ts          # Inngest serve handler
│       │   │   ├── cron/                     # Disparadores Vercel Cron
│       │   │   │   ├── billing-dunning/route.ts
│       │   │   │   ├── access-event-archive/route.ts
│       │   │   │   └── invitations-expire/route.ts
│       │   │   ├── realtime/
│       │   │   │   └── token/route.ts        # Fase 2 — Ably token req
│       │   │   └── health/route.ts
│       │   ├── layout.tsx                    # Root layout
│       │   ├── globals.css
│       │   └── opengraph-image.tsx
│       │
│       ├── components/                       # Componentes específicos de la app
│       │   ├── access-cockpit/
│       │   ├── dashboard/
│       │   ├── data-grid/
│       │   ├── command-palette/
│       │   ├── billing/
│       │   ├── branding-preview/
│       │   └── shell/
│       │
│       ├── lib/
│       │   ├── server/                       # SOLO server. import 'server-only'
│       │   │   ├── auth/
│       │   │   │   ├── session.ts            # Cookies, JWT verify
│       │   │   │   ├── password.ts           # argon2id
│       │   │   │   ├── jwt.ts                # JOSE
│       │   │   │   ├── refresh.ts            # Rotación de refresh tokens
│       │   │   │   ├── mfa.ts                # TOTP
│       │   │   │   ├── abilities.ts          # CASL
│       │   │   │   └── guards.ts             # requireAuth, requireTenant, requirePolicy
│       │   │   ├── tenant/
│       │   │   │   ├── context.ts            # AsyncLocalStorage
│       │   │   │   ├── resolve.ts            # JWT / subdomain / header
│       │   │   │   └── rls.ts                # SET LOCAL app.current_tenant
│       │   │   ├── services/                 # Lógica de dominio
│       │   │   │   ├── organizations.ts
│       │   │   │   ├── memberships.ts
│       │   │   │   ├── persons.ts
│       │   │   │   ├── residents.ts
│       │   │   │   ├── vehicles.ts
│       │   │   │   ├── authorizations.ts
│       │   │   │   ├── access-check.ts       # CORE: latencia crítica
│       │   │   │   ├── access-events.ts
│       │   │   │   ├── alerts.ts
│       │   │   │   ├── reports.ts
│       │   │   │   ├── billing.ts
│       │   │   │   ├── subscriptions.ts
│       │   │   │   ├── invoices.ts
│       │   │   │   └── plan-limits.ts
│       │   │   ├── repos/                    # Único lugar que toca prisma.*
│       │   │   │   ├── persons.repo.ts
│       │   │   │   ├── residents.repo.ts
│       │   │   │   ├── access-events.repo.ts
│       │   │   │   └── ...
│       │   │   ├── infra/                    # Adaptadores externos
│       │   │   │   ├── mercadopago/
│       │   │   │   │   ├── client.ts
│       │   │   │   │   ├── signature.ts
│       │   │   │   │   └── types.ts
│       │   │   │   ├── resend.ts
│       │   │   │   ├── whatsapp.ts
│       │   │   │   ├── blob.ts               # Vercel Blob / R2
│       │   │   │   ├── alpr.ts
│       │   │   │   ├── ably.ts               # Fase 2
│       │   │   │   ├── redis.ts              # Upstash
│       │   │   │   └── encryption.ts
│       │   │   ├── ratelimit.ts
│       │   │   ├── audit.ts                  # Helper para AuditLog
│       │   │   └── idempotency.ts
│       │   ├── inngest/
│       │   │   ├── client.ts
│       │   │   └── functions/
│       │   │       ├── process-mp-webhook.ts
│       │   │       ├── send-email.ts
│       │   │       ├── send-whatsapp.ts
│       │   │       ├── generate-invoice-pdf.ts
│       │   │       ├── ocr-plate.ts
│       │   │       ├── export-report.ts
│       │   │       ├── dispatch-outbound-webhook.ts
│       │   │       ├── dunning.ts
│       │   │       ├── archive-access-events.ts
│       │   │       └── ensure-partitions.ts
│       │   ├── client/                       # Client-only helpers
│       │   │   ├── api.ts                    # fetch helper
│       │   │   ├── use-tenant.ts
│       │   │   ├── use-ability.ts
│       │   │   ├── use-sse.ts
│       │   │   └── use-hid-scanner.ts        # re-export packages/scanner
│       │   ├── shared/                       # Iso (cliente + server)
│       │   │   ├── plate.ts                  # normalizePlate
│       │   │   ├── format.ts
│       │   │   └── errors.ts
│       │   └── env.ts                        # Zod validation de env
│       │
│       ├── middleware.ts                     # Auth gate, subdomain resolve, CSP
│       ├── instrumentation.ts                # Sentry / OTel init
│       ├── next.config.mjs
│       ├── vercel.json
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── db/                                   # Prisma
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── src/
│   │   │   ├── index.ts                      # PrismaClient + Neon adapter
│   │   │   ├── tenant-middleware.ts
│   │   │   ├── rls.ts
│   │   │   └── models.ts                     # TENANT_SCOPED_MODELS set
│   │   └── package.json
│   │
│   ├── ui/                                   # Componentes shadcn-derived
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── tokens/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── types/                                # Enums y tipos compartidos
│   │   ├── src/
│   │   │   ├── access.ts
│   │   │   ├── billing.ts
│   │   │   ├── auth.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── scanner/                              # Parsers + HID utilities
│   │   ├── src/
│   │   │   ├── parsers/
│   │   │   │   ├── dni-ar.ts
│   │   │   │   └── qr.ts
│   │   │   ├── hid/
│   │   │   │   └── use-hid-scanner.ts
│   │   │   └── alpr/
│   │   │       └── normalize-plate.ts
│   │   ├── __tests__/
│   │   └── package.json
│   │
│   └── config/
│       ├── eslint/
│       ├── tsconfig/
│       ├── tailwind/
│       └── package.json
│
├── docs/                                     # Esta carpeta
├── .github/workflows/
│   ├── ci.yml                                # lint + typecheck + test + build
│   └── e2e.yml                               # Playwright contra Vercel preview
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── .env.example
├── .editorconfig
├── .gitignore
└── README.md
```

## Variante simplificada (sin monorepo)

Si preferís arrancar todo dentro de una sola app sin packages, los `packages/*` se convierten en carpetas dentro de `lib/`:

```
bzapp/
├── app/...
├── components/...
├── lib/
│   ├── db/                # Lo que era packages/db
│   ├── ui/                # Lo que era packages/ui
│   ├── scanner/           # Lo que era packages/scanner
│   ├── types/
│   └── server/, client/, shared/, inngest/, env.ts
├── prisma/
└── ...
```

Trade-off: empieza más rápido, pero migrar a monorepo después tiene fricción. **Recomendación**: si vas a tener más de 1 dev, arrancá con monorepo desde el día 1. Si vas a iterar solo durante el MVP, sin monorepo está bien.

## Scripts raíz (turbo)

```json
{
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test",
    "test:e2e": "turbo run test:e2e",
    "db:migrate": "pnpm --filter @bzapp/db prisma migrate dev",
    "db:deploy": "pnpm --filter @bzapp/db prisma migrate deploy",
    "db:seed": "pnpm --filter @bzapp/db tsx prisma/seed.ts",
    "db:studio": "pnpm --filter @bzapp/db prisma studio",
    "vercel:env": "vercel env pull apps/web/.env.local"
  }
}
```

## Reglas de import

- `apps/web` puede importar de cualquier `packages/*`.
- `packages/*` no importa de `apps/*`.
- `packages/db` no importa de `packages/ui`.
- `lib/server/**` lleva `import 'server-only'` arriba — falla en build si entra al bundle cliente.
- `lib/client/**` lleva `import 'client-only'` arriba — falla en build si se ejecuta en server.
- Aliases TS: `@bzapp/db`, `@bzapp/ui`, `@bzapp/types`, `@bzapp/scanner`, `@bzapp/config`, y `@/` para `apps/web/`.

## Convenciones de naming

- Archivos React: `kebab-case.tsx` para componentes, `use-foo.ts` para hooks.
- Route handlers: `app/api/.../route.ts`, server actions junto a la página o en `app/_actions/`.
- Services: `feature.service.ts`. Repos: `feature.repo.ts`. DTOs Zod: `feature.schema.ts`.
- Variables y funciones: camelCase. Tipos y clases: PascalCase. Constantes: SCREAMING_SNAKE.
- DB columnas: `snake_case` (Prisma mapea con `@map`).
