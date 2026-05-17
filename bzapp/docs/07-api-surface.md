# 07 — API surface

REST sobre HTTPS. JSON. Versionado por prefijo: `/v1/...`. Realtime vía **SSE** (`/v1/access/feed`, `/v1/alerts/feed`) en fase 1, migrable a **Ably** en fase 2. Webhooks salientes firmados con HMAC.

Implementado como **route handlers de Next.js** (`app/api/v1/.../route.ts`) y **server actions**. No hay servidor backend separado — todo corre en Vercel Functions (Node runtime).

## Convenciones

- Recursos en plural, kebab-case si componen palabras.
- IDs en path: `/v1/residents/:id`.
- Listas con paginación cursor: `?cursor=...&limit=50&order=createdAt:desc`.
- Filtros con sintaxis tipada: `?filter[status]=active&filter[unit.id]=...`.
- Respuestas error en formato Problem+JSON (`application/problem+json`):

```json
{ "type": "https://docs.bzapp.io/errors/limit-exceeded",
  "title": "Plan limit exceeded", "status": 402,
  "detail": "max_residents=200 reached",
  "instance": "/v1/residents", "code": "PLAN_LIMIT_RESIDENTS" }
```

- Idempotency: `Idempotency-Key` requerido en POSTs que crean recursos cobrables o disparan acciones externas.
- Tenant resuelto del JWT. Headers de override (`X-Organization-Id`) solo para super admin con audit.

## Autenticación y onboarding

| Método | Path | Descripción |
| --- | --- | --- |
| POST | `/v1/auth/register` | Crea User + envía email de verificación |
| POST | `/v1/auth/login` | Email+password → access+refresh |
| POST | `/v1/auth/refresh` | Rota refresh, emite nuevo access |
| POST | `/v1/auth/logout` | Revoca refresh |
| POST | `/v1/auth/forgot-password` | Magic link |
| POST | `/v1/auth/reset-password` | Aplica nueva clave |
| POST | `/v1/auth/mfa/enroll` | Empieza enrolamiento TOTP |
| POST | `/v1/auth/mfa/verify` | Confirma código |
| POST | `/v1/onboarding/organizations` | Crea Organization (paso 1 wizard) |
| PATCH | `/v1/onboarding/organizations/:id` | Configura branding, accesos, etc. |
| POST | `/v1/onboarding/organizations/:id/complete` | Finaliza, redirige a dashboard |
| GET | `/v1/me` | Perfil + memberships |
| GET | `/v1/me/abilities` | Permisos para UI gating |
| POST | `/v1/me/switch-organization` | Devuelve token nuevo con otra org |

## Organizaciones

| Método | Path | Descripción |
| --- | --- | --- |
| GET | `/v1/organization` | Info de la org actual |
| PATCH | `/v1/organization` | Update general |
| GET / PATCH | `/v1/organization/branding` | Branding |
| GET / POST / PATCH / DELETE | `/v1/organization/members` | Manejo de miembros |
| GET / POST / PATCH / DELETE | `/v1/organization/roles` | Roles custom (si plan lo permite) |
| GET | `/v1/organization/audit-logs` | Audit log (paginado) |

## Residentes y unidades

| Método | Path | Descripción |
| --- | --- | --- |
| GET / POST | `/v1/units` | Lista / crea unidad |
| GET / PATCH / DELETE | `/v1/units/:id` | Detalle |
| GET / POST | `/v1/residents` | Lista / crea (asocia Person+Unit) |
| GET / PATCH / DELETE | `/v1/residents/:id` | Detalle |
| GET | `/v1/persons/search?q=...` | Búsqueda fuzzy por nombre o DNI |

## Vehículos

| Método | Path | Descripción |
| --- | --- | --- |
| GET / POST | `/v1/vehicles` | Lista / crea |
| GET / PATCH / DELETE | `/v1/vehicles/:id` | Detalle |
| GET | `/v1/vehicles/by-plate/:plate` | Lookup directo (uso interno y ALPR) |

## Autorizaciones

| Método | Path | Descripción |
| --- | --- | --- |
| GET | `/v1/authorizations` | Lista (filtro por status, fecha, residente) |
| POST | `/v1/authorizations` | Crea autorización (residente o admin) |
| GET | `/v1/authorizations/:id` | Detalle + QR url |
| PATCH | `/v1/authorizations/:id` | Update |
| POST | `/v1/authorizations/:id/revoke` | Revoca |
| POST | `/v1/authorizations/:id/resend-qr` | Reenvía QR por email/WA |

## Accesos (cockpit del guardia)

| Método | Path | Descripción |
| --- | --- | --- |
| POST | `/v1/access/check` | Pre-check de entrada. **No persiste**. Devuelve match + outcome sugerido. |
| POST | `/v1/access/events` | Persiste un AccessEvent (con outcome decidido por el guardia). |
| GET | `/v1/access/events` | Lista paginada con filtros. |
| GET | `/v1/access/events/:id` | Detalle. |
| GET | `/v1/access/feed` | Stream SSE del feed live (fallback de WS). |
| POST | `/v1/access/ocr-plate` | Sube imagen, devuelve patente decodificada. |
| POST | `/v1/access/scan/qr` | Valida QR de autorización. |

### Ejemplo `/v1/access/check`

```http
POST /v1/access/check
Content-Type: application/json
Authorization: Bearer <jwt>

{
  "accessPointId": "...",
  "scanMethod": "DNI_PDF417",
  "raw": "00000000@PEREZ@JUAN ALBERTO@M@01/01/1990@12345678@..."
}
```

```json
{
  "person": {
    "id": "...",
    "fullName": "Juan Alberto Pérez",
    "documentNumber": "12345678",
    "photoUrl": "https://cdn.../...jpg"
  },
  "match": {
    "isResident": true,
    "units": [{ "id": "...", "code": "Lote A-32" }],
    "authorizations": [],
    "blocklistHits": []
  },
  "suggestedOutcome": "GRANTED",
  "warnings": []
}
```

## Alertas

| Método | Path | Descripción |
| --- | --- | --- |
| GET / POST | `/v1/alerts` | Lista / crea |
| PATCH | `/v1/alerts/:id/acknowledge` | Marca como atendida |
| PATCH | `/v1/alerts/:id/resolve` | Resuelve |

## Reportes

| Método | Path | Descripción |
| --- | --- | --- |
| GET | `/v1/reports/access-summary` | Resumen por rango (totales, denegados, picos) |
| GET | `/v1/reports/top-visitors` | Personas más frecuentes |
| GET | `/v1/reports/by-unit` | Accesos por unidad |
| POST | `/v1/reports/exports` | Solicita export CSV/PDF, devuelve job id |
| GET | `/v1/reports/exports/:id` | Polling del job |

## Billing

| Método | Path | Descripción |
| --- | --- | --- |
| GET | `/v1/billing/subscription` | Estado, plan, próximo cobro |
| POST | `/v1/billing/subscription/change-plan` | Inicia upgrade/downgrade |
| POST | `/v1/billing/subscription/cancel` | Cancela |
| GET | `/v1/billing/invoices` | Lista de facturas |
| GET | `/v1/billing/invoices/:id` | Detalle + URL PDF |
| GET / POST / DELETE | `/v1/billing/payment-methods` | Métodos de pago |

## API keys y webhooks (M2M)

| Método | Path | Descripción |
| --- | --- | --- |
| GET / POST / DELETE | `/v1/api-keys` | Manejo de API keys |
| GET / POST / PATCH / DELETE | `/v1/webhooks` | Endpoints webhook outbound |
| POST | `/v1/webhooks/:id/test` | Dispara un evento de prueba |

Auth por API key vía header `Authorization: Bearer bzk_live_...`. Las API keys pueden tener scopes (`access:read`, `residents:write`, etc.).

## Webhooks entrantes (de MP)

| Método | Path | Descripción |
| --- | --- | --- |
| POST | `/webhooks/mercadopago` | Notificaciones de MP. Firma verificada con secret. |

## Realtime (SSE, fase 1)

Endpoints SSE expuestos como route handlers Next.js con `runtime = 'nodejs'`:

| URL | Eventos |
| --- | --- |
| `GET /v1/access/feed` | `access.event.created`, `access.event.updated` |
| `GET /v1/alerts/feed` | `alert.created`, `alert.acknowledged`, `alert.resolved` |
| `GET /v1/dashboard/feed` | `kpis.updated` |
| `GET /v1/notifications/feed` | `notification.new` (scope user) |
| `GET /admin/platform/feed` | (super admin) `tenant.created`, `tenant.payment.failed`, etc. |

Cada conexión:
1. Valida JWT en cookies o header.
2. Resuelve tenant del JWT.
3. Suscribe al canal correspondiente en **Upstash Redis pub/sub**.
4. Streamea eventos como `event: <type>\ndata: <json>\n\n`.
5. Heartbeat (`: ping`) cada 25 s para mantener viva la conexión.

Cliente:

```ts
const es = new EventSource('/v1/access/feed', { withCredentials: true });
es.addEventListener('access.event.created', (e) => {
  const event = JSON.parse(e.data);
  feed.prepend(event);
});
es.onerror = () => { /* EventSource reconecta solo */ };
```

Vercel Function tiene un timeout máximo de 300 s para SSE — el cliente se reconecta automáticamente al cerrar.

## Realtime (Ably, fase 2)

Cuando se necesite bidireccional, presencia, o canales privados granulares:

| Método | Path | Descripción |
| --- | --- | --- |
| POST | `/v1/realtime/token` | Devuelve token Ably con `capability` scopeada a la org del usuario |

Canales propuestos (mismo nombre que SSE para consistencia):

- `org:{orgId}:access`
- `org:{orgId}:alerts`
- `presence:org:{orgId}:guards` (presencia de guardias activos)
- `commands:org:{orgId}:{accessPointId}` (comandos de garita)

## Webhooks salientes (a clientes que integran)

Eventos disparables:

- `access.event.created`
- `access.event.updated`
- `alert.created`
- `resident.created`
- `resident.updated`
- `authorization.created`
- `authorization.used`
- `invoice.paid`
- `subscription.updated`

Payload firmado:

```http
POST <customer-url>
X-BZAPP-Signature: t=1715800000,v1=hex(hmac_sha256(secret, t+'.'+body))
X-BZAPP-Event: access.event.created
Content-Type: application/json
```

Reintentos con backoff `1m, 5m, 30m, 2h, 12h` (5 intentos). Si todos fallan, se desactiva el endpoint y se notifica al admin.

## Rate limits

| Endpoint | Límite default |
| --- | --- |
| `/v1/auth/*` | 10 req/min/IP |
| `/v1/access/check` | 120 req/min/user |
| `/v1/access/events` | 120 req/min/access_point |
| Otros | 600 req/min/user |

Headers `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

## Versionado

- Nuevos campos opcionales no rompen — se agregan sin bump.
- Cambios breaking requieren `/v2/...`. Convivencia mínima de 6 meses con `/v1`.
- Deprecaciones anunciadas con header `Deprecation: true` y `Sunset: <date>`.
