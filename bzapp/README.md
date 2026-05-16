# BZAPP — Plataforma SaaS de Control de Accesos

BZAPP es una plataforma multi-tenant de control de accesos para barrios privados, countries, urbanizaciones, edificios, clubes, parques industriales y oficinas corporativas. Este repositorio contiene el diseño técnico y el esquema de datos que sirven de base para la implementación.

**Plataforma de hosting**: Vercel. Una sola aplicación Next.js consolida web + API + admin. Backend distribuido en servicios serverless: **Neon** (Postgres), **Upstash** (Redis), **Inngest** (jobs), **Resend** (email), **Vercel Blob** (storage), **Ably** (realtime fase 2).

## Audiencia

Este documento está dirigido al equipo técnico que va a implementar BZAPP: backend, frontend, DevOps y producto. Asume familiaridad con arquitectura SaaS, Postgres, NestJS y Next.js.

## Estado

Diseño técnico — versión 1.0. No hay código de aplicación todavía. El siguiente paso es generar el scaffold del monorepo a partir de estas decisiones.

## Índice

| Doc | Contenido |
| --- | --- |
| [01 — Arquitectura general](docs/01-architecture.md) | Stack, monorepo, capas, objetivos no funcionales |
| [02 — Multi-tenancy](docs/02-multi-tenant.md) | Estrategia de aislamiento, middleware, RLS |
| [03 — Modelo de datos](docs/03-data-model.md) | Entidades, ER diagram, decisiones de diseño |
| [04 — RBAC y permisos](docs/04-rbac-permissions.md) | Roles, super admin, scopes |
| [05 — Billing](docs/05-billing.md) | MercadoPago, suscripciones, ciclo de vida |
| [06 — Scanner y accesos](docs/06-scanner-access.md) | PDF417 DNI, HID, OCR patentes, flujo guardia |
| [07 — API y eventos](docs/07-api-surface.md) | REST, WebSockets, webhooks |
| [08 — UI/UX](docs/08-ui-ux.md) | Sistema de diseño, pantallas clave |
| [09 — Infraestructura](docs/09-infrastructure.md) | Vercel + Neon + Upstash + Inngest + Resend, observabilidad |
| [10 — Estructura del monorepo](docs/10-folder-structure.md) | Layout de carpetas (single Next.js app) |
| [11 — Roadmap](docs/11-roadmap.md) | Fases de implementación |
| [12 — Deployment a Vercel](docs/12-vercel-deployment.md) | Pasos concretos de deploy, env vars, cron, rollback, costos |

## Esquema Prisma

El schema completo vive en [prisma/schema.prisma](prisma/schema.prisma). Es la fuente de verdad del modelo de datos y debe leerse junto con [docs/03-data-model.md](docs/03-data-model.md).

## Principios de diseño

1. **Multi-tenant real desde el día uno.** Aislamiento por `organization_id` con middleware y Row Level Security en Postgres.
2. **Latencia primero.** El uso crítico (escaneo de DNI en una garita) debe responder en menos de 200 ms p95. Todo el diseño optimiza ese caso.
3. **Seguro por defecto.** RBAC granular, audit log inmutable, scopes en JWT, encriptación at-rest y in-transit.
4. **Escalable horizontalmente.** Stateless API, sesión en Redis, jobs en cola, storage en S3.
5. **Configurable sin redeploy.** Feature flags, branding por organización, planes y precios editables por super admin.
