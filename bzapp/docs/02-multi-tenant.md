# 02 — Multi-tenancy

## Estrategia elegida: shared DB, shared schema + `organization_id` + Postgres RLS

Tres opciones consideradas:

| Modelo | Pros | Contras | Veredicto |
| --- | --- | --- | --- |
| DB por tenant | Aislamiento máximo, fácil de exportar/borrar | Costo alto, migraciones N veces, pooling complejo | Diferido a clientes enterprise (fase 4) |
| Schema por tenant | Aislamiento bueno, una sola DB | Migraciones tediosas, límite práctico de ~1000 schemas | Descartado |
| Tabla compartida + `organization_id` | Barato, escala, simple | Riesgo de fuga si el filtro falla | **Elegido**, mitigado con RLS |

La columna `organization_id` está en **todas** las tablas de negocio. Aislamiento garantizado por **tres capas**:

1. **JWT scope:** el token incluye `organization_id`. El usuario no puede cambiarlo.
2. **Tenant middleware en NestJS:** resuelve el tenant del JWT (o del subdomain para rutas públicas) y lo guarda en un `AsyncLocalStorage`. Prisma middleware lo inyecta automáticamente en todas las queries.
3. **Postgres Row Level Security:** política `USING (organization_id = current_setting('app.current_tenant')::uuid)` activa en cada conexión. Si el código olvida filtrar, RLS bloquea igual.

## TenantContext

```ts
// apps/api/src/tenant/tenant.context.ts
import { AsyncLocalStorage } from 'node:async_hooks';

export type TenantContext = {
  organizationId: string;
  userId: string;
  roles: string[];
  permissions: string[];
  isSuperAdmin: boolean;
};

export const tenantStorage = new AsyncLocalStorage<TenantContext>();

export const getTenant = (): TenantContext => {
  const ctx = tenantStorage.getStore();
  if (!ctx) throw new Error('TenantContext missing — middleware not applied');
  return ctx;
};
```

El middleware lo carga al inicio de cada request:

```ts
// apps/api/src/tenant/tenant.middleware.ts
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const jwt = (req as any).user; // ya validado por guard
    const ctx: TenantContext = {
      organizationId: jwt.org,
      userId: jwt.sub,
      roles: jwt.roles,
      permissions: jwt.perms,
      isSuperAdmin: jwt.super === true,
    };
    tenantStorage.run(ctx, () => next());
  }
}
```

## Prisma middleware

Inyecta `organization_id` y aplica `SET LOCAL app.current_tenant`:

```ts
prisma.$use(async (params, next) => {
  const ctx = tenantStorage.getStore();
  if (!ctx) return next(params); // ej. tareas de sistema, super admin

  const tenantScoped = TENANT_SCOPED_MODELS.has(params.model ?? '');
  if (!tenantScoped) return next(params);

  if (params.action === 'create') {
    params.args.data.organizationId = ctx.organizationId;
  }
  if (['findMany', 'findFirst', 'update', 'updateMany', 'delete', 'deleteMany', 'count', 'aggregate'].includes(params.action)) {
    params.args.where = {
      ...(params.args.where ?? {}),
      organizationId: ctx.organizationId,
    };
  }
  return next(params);
});
```

`TENANT_SCOPED_MODELS` excluye: `Organization`, `Plan`, `User` (cuando la consulta es global de auth), `PlatformAuditLog`, `FeatureFlag` (global), `WebhookEvent` (raw inbox).

## Row Level Security

Para cada tabla tenant-scoped:

```sql
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON residents
  USING (organization_id = current_setting('app.current_tenant')::uuid)
  WITH CHECK (organization_id = current_setting('app.current_tenant')::uuid);
```

La aplicación abre la transacción con:

```sql
SET LOCAL app.current_tenant = '...uuid...';
```

Prisma soporta esto vía `$transaction` con un statement previo. El bypass para super admin se hace conectando con un rol `bzapp_admin` que tiene `BYPASSRLS`.

## Resolución de tenant

Tres rutas:

1. **Por JWT** (default después del login). El token tiene `org`.
2. **Por subdomain**: `{slug}.bzapp.io` resuelve a `Organization.slug`. Útil para landing customizada y onboarding.
3. **Por header `X-Organization-Id`** (solo super admin, auditado, requiere flag `impersonating`).

Si un usuario pertenece a varias organizaciones, el login devuelve la lista y el frontend pide al usuario seleccionar una antes de emitir el access token final.

## Impersonate (super admin)

- Solo roles `platform.support` y `platform.owner`.
- Endpoint `POST /admin/organizations/:id/impersonate` emite un token con `super=true` y `impersonating={organizationId, actorUserId, reason, expiresAt}`.
- Toda acción queda en `PlatformAuditLog` con `actor_user_id` (el del super admin) y `on_behalf_of_user_id` opcional.
- TTL máximo 1 h. No se permite cambiar billing ni eliminar datos sin re-confirmación.

## Cuotas y límites por plan

Cada plan tiene límites duros y blandos:

| Recurso | Tipo | Acción al exceder |
| --- | --- | --- |
| Usuarios activos | Hard | Bloquea creación, sugiere upgrade |
| Accesos / mes | Soft | Permite + factura sobreuso si el plan lo habilita |
| Residentes | Hard | Bloquea creación |
| Storage (MB) | Soft | Notifica al admin |
| Webhooks/min | Hard | Throttle 429 |

Implementado en un `LimitsGuard` que se activa antes de `create*` endpoints relevantes. Los contadores se cachean en Redis con TTL corto y se reconcilian desde Postgres cada hora.

## Borrado y export

- **Export GDPR-style** por organización: zip con CSVs de todas las tablas tenant-scoped, generado en background. Disponible para el `OrgOwner`.
- **Borrado**: soft delete (`deleted_at`) por default; hard delete a los 90 días vía job. El borrado total de una organización es una operación de super admin con doble confirmación.
