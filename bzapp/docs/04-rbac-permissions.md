# 04 — RBAC y permisos

## Modelo

Tres niveles:

1. **Platform-level** (super admin de BZAPP). Vive en `User.is_platform_admin = true` + roles `platform.*`.
2. **Organization-level** (dueño/admin/seguridad/guardia del barrio).
3. **Resource-level** (un residente solo ve su unidad, sus autorizaciones).

Permisos con formato `resource:action` o `resource:action:scope`. Ejemplos:

- `residents:read`
- `residents:write`
- `accesses:create`
- `billing:read:own`
- `billing:write` (sin scope = global de la org)
- `organization:settings:write`

## Roles predefinidos

### Plataforma

| Rol | Permisos |
| --- | --- |
| `platform.owner` | `platform:*` |
| `platform.support` | `platform:read`, `platform:impersonate`, `platform:tickets:*` |
| `platform.billing` | `platform:billing:*`, `platform:read` |

### Organización

| Rol | Descripción | Permisos clave |
| --- | --- | --- |
| `org.owner` | Creador, dueño de la cuenta | `organization:*`, `billing:*`, `members:*` |
| `org.admin` | Administrador delegado | `organization:settings:*`, `members:write`, `residents:*`, `access:*`, `reports:*`, sin `billing:write` |
| `security.manager` | Jefe de seguridad | `access:*`, `guards:*`, `alerts:*`, `reports:read`, `residents:read` |
| `guard` | Guardia operativo | `access:create`, `access:read`, `alerts:create`, `residents:read`, `authorizations:read`, `vehicles:read` |
| `resident` | Residente | `residents:read:own`, `authorizations:*:own`, `vehicles:*:own`, `access:read:own` |
| `resident.viewer` | Familiar sin permisos | `residents:read:own`, `access:read:own` |

Los permisos se definen en código (seed) y se persisten en `Permission`. Los roles también vienen sembrados pero pueden clonarse y editarse por organización si el plan lo habilita (`features.custom_roles`).

## Scopes (`:own`, `:unit`, `:org`)

El scope refina el alcance. Lo enforce el `PolicyGuard` usando **CASL**:

```ts
// apps/api/src/auth/abilities.ts
export function buildAbilityFor(user, membership) {
  const { can, build } = new AbilityBuilder(createMongoAbility);

  if (membership.roles.includes('org.owner')) {
    can('manage', 'all');
    return build();
  }

  if (membership.roles.includes('resident')) {
    can('read', 'Resident', { unitId: { $in: membership.unitIds } });
    can('manage', 'Authorization', { createdByUserId: user.id });
    can('manage', 'Vehicle', { ownerPersonId: membership.personId });
    can('read', 'AccessEvent', { personId: membership.personId });
  }

  // ... etc
  return build();
}
```

En controllers:

```ts
@UseGuards(JwtAuthGuard, PolicyGuard)
@CheckPolicies((ability) => ability.can('create', 'AccessEvent'))
@Post('events')
createEvent(@Body() dto: CreateAccessEventDto) { ... }
```

## JWT claims

```json
{
  "sub": "user-uuid",
  "org": "organization-uuid",
  "roles": ["security.manager"],
  "perms_v": 7,
  "super": false,
  "iat": 1715800000,
  "exp": 1715800900
}
```

`perms_v` es un version stamp de los permisos de la organización. Si cambia, el frontend hace re-fetch del set completo desde `/me/abilities`. Esto evita meter cientos de strings en el JWT.

## Onboarding y primer usuario

El usuario que crea una organización recibe `org.owner` automáticamente. Posteriores `org.admin` se invitan por email; reciben magic link de aceptación que crea su `Membership`.

## Aprobaciones críticas

Acciones destructivas o sensibles requieren **re-autenticación reciente** (last_password_check < 10 min) o **MFA challenge**:

- Borrar organización
- Exportar datos completos
- Generar API key con scope `:write`
- Cancelar suscripción
- Cambiar email del owner
- Impersonate desde plataforma

## Audit trail

Toda mutación pasa por un interceptor que escribe en `AuditLog`. El log incluye `before`/`after` (diff) para entidades whitelisted. No se loggean datos sensibles en claro — solo refs.

## Tokens de invitación y QR de visitante

- **Invitaciones a miembros:** JWT firmado, 7 días TTL, single-use, con `invitation_id` en payload.
- **QR de visita:** payload firmado HMAC con `authorization_id`, `expires_at`, `nonce`. Se valida server-side en el escaneo. No se confía nunca solo en el QR — siempre se hace lookup en DB.
