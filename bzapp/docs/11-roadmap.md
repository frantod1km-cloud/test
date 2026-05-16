# 11 — Roadmap de implementación

Estimaciones para un equipo de **2 backend + 2 frontend + 1 DevOps + 1 PM/diseño**. Ajustar pro-rata. Los rangos asumen velocidad razonable, no heroica.

## Fase 0 — Foundation (1-2 semanas)

**Objetivo:** scaffolding listo, DX óptima, primer deploy a staging vacío.

- [ ] Monorepo con pnpm + turbo, todos los paquetes esqueleto
- [ ] Prisma schema base, migraciones, seed mínimo (planes + roles + permisos)
- [ ] Docker compose dev (Postgres, Redis, MinIO, Mailpit)
- [ ] CI: lint + typecheck + tests + build
- [ ] Deploy staging en Railway (api + web + worker)
- [ ] Auth básica: register / login / refresh / verify email
- [ ] Tenant middleware + ALS + Prisma middleware + RLS policies en migración inicial
- [ ] Sentry + logs estructurados
- [ ] Sistema de diseño base en `packages/ui` (colores, tipografía, Button, Input, Card)

**Salida:** desarrollador nuevo clona, `pnpm install && pnpm db:up && pnpm dev` y tiene la stack corriendo en 5 min.

## Fase 1 — MVP (4-6 semanas)

**Objetivo:** una organización puede operar el control de accesos end-to-end.

### Backend
- [ ] Onboarding completo (crear org, branding, miembros, plan trial)
- [ ] CRUD: Person, Unit, Resident, Vehicle, AccessPoint, Authorization
- [ ] Endpoint `/access/check` y `/access/events` con outcomes
- [ ] WebSocket feed (`org:{id}:access`)
- [ ] Audit log + interceptor genérico
- [ ] Roles y permisos seed + CASL + PolicyGuard
- [ ] Plan limits guard (max_users, max_residents)

### Frontend
- [ ] Landing pública mínima (hero + features + pricing + signup)
- [ ] Auth screens (login, register, verify, forgot)
- [ ] Onboarding wizard (5 pasos con autosave)
- [ ] Shell autenticado (sidebar + topbar + tenant gate)
- [ ] Dashboard con KPIs (no necesariamente live aún)
- [ ] Cockpit del guardia con HID scanner + parser DNI AR funcionando
- [ ] CRUD Residentes / Unidades / Vehículos / Autorizaciones
- [ ] Lista de accesos (DataGrid + filtros)
- [ ] Settings: general, branding, miembros, roles, access points
- [ ] Command palette
- [ ] Toasts, empty states, errores

### Infra
- [ ] Cloudflare front + R2 storage
- [ ] Backups Postgres habilitados
- [ ] Health checks + autorestart

**Demo aceptable:** un cliente real puede registrarse, configurar su barrio, invitar a un guardia, y operar la garita escaneando DNIs.

## Fase 2 — Beta (3-4 semanas)

**Objetivo:** SaaS comercializable. Cobra dinero.

- [ ] Integración MercadoPago completa (preapproval + webhooks + invoice + dunning)
- [ ] Panel de billing (UI organización + UI super admin)
- [ ] Plan upgrade / downgrade / cancel
- [ ] Generación de invoice PDF
- [ ] Super admin: organizaciones, planes, métricas globales, impersonate
- [ ] Feature flags (defaults + overrides por org)
- [ ] Alertas: panic, blacklist match, overstay; WS push al dashboard
- [ ] Notificaciones por email (Resend) + WhatsApp Cloud
- [ ] Importación CSV (residentes, unidades, vehículos)
- [ ] Reportes básicos + export CSV
- [ ] OCR patentes (PlateRecognizer integration)
- [ ] QR de autorización + envío por email/WA
- [ ] MFA TOTP opcional

**Demo aceptable:** 5-10 clientes pagando. Onboarding self-serve sin intervención del equipo.

## Fase 3 — GA (3-4 semanas)

**Objetivo:** producción enterprise-ready.

- [ ] AFIP facturación electrónica (Argentina)
- [ ] API pública + API keys + webhooks salientes firmados
- [ ] SDK público en `packages/sdk` publicado a npm
- [ ] Cámara IP + ALPR push para barreras
- [ ] Integraciones con cámaras Hikvision / Dahua (eventos)
- [ ] Integraciones con barreras (Nice, Faac) vía API o relays
- [ ] Modo offline en cockpit (PWA + IndexedDB)
- [ ] Reportes avanzados con filtros guardados
- [ ] Roles custom configurables por org (si plan lo permite)
- [ ] SSO SAML / OIDC (Google Workspace, Microsoft) — para plan Enterprise
- [ ] Migración a AWS (ECS, RDS, ElastiCache)
- [ ] Pentesting + remediation
- [ ] Documentación pública API (Mintlify o ReadMe)
- [ ] Status page

**Demo aceptable:** 50+ clientes, primer caso enterprise con SSO y API.

## Fase 4 — Scale (continuo)

- [ ] Multi-región (replicación cross-region, geo routing)
- [ ] DB por tenant opcional (clientes enterprise grandes)
- [ ] SOC 2 Type I audit
- [ ] Marketplace de integraciones
- [ ] Mobile app nativa para residentes (React Native)
- [ ] Reconocimiento facial opcional
- [ ] Análisis de comportamiento (anomalías, predicción de picos)
- [ ] White-label completo (revendedores)
- [ ] Expansión a otros países (timezone, moneda, idioma, pasarelas locales)

## Riesgos y mitigaciones

| Riesgo | Mitigación |
| --- | --- |
| Fuga cross-tenant | Tres capas (middleware + Prisma + RLS) + tests automatizados que intentan exfiltrar |
| MP rechaza webhook por firma mal validada | Suite de tests con payloads reales firmados; alerting si WebhookEvent acumula sin procesar |
| Cockpit lento en tablets viejas | Performance budget enforced en CI; pruebas en hardware target real |
| Pistolas scanner con formatos exóticos | Corpus de fixtures + fallback de input manual + soporte WebSerial |
| Concurrencia en transiciones de subscription | Locks advisory + tests de race condition |
| Inflación AR / cambio | Precios en USD internamente, conversión a ARS para cobro vía MP |
| Compliance datos personales (Ley 25.326 AR) | DPO designado, política de retención, mecanismo de export/borrado, encriptación |

## Definición de "Done"

Para cada feature:

1. Especificación escrita (issue o doc).
2. Tests unitarios > 80 % en services y use cases.
3. Tests E2E del happy path.
4. Documentación API actualizada.
5. Migración + rollback path.
6. Logs y métricas relevantes.
7. Demo en staging.
8. Review de seguridad (checklist OWASP).
