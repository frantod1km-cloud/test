# 08 — UI / UX

## Principios

1. **Densidad útil.** Stripe + Linear: información rica sin sentirse abarrotado.
2. **Dark-first.** El modo oscuro es el default. Light está soportado y es bonito, pero el branding y las capturas de marketing son dark.
3. **Latencia percibida ≈ 0.** Optimistic UI, skeletons, transiciones < 150 ms.
4. **Teclado primero.** Toda acción frecuente tiene shortcut. `Cmd/Ctrl+K` abre command palette.
5. **Mobile-aware, no mobile-first.** El uso primario es desktop/tablet. Móvil para residentes y aprobaciones rápidas.

## Sistema de diseño

### Tokens base

```css
:root {
  --bg-0: #0a0a0c;        /* fondo más oscuro */
  --bg-1: #111114;        /* surface base */
  --bg-2: #17171c;        /* card */
  --bg-3: #1f1f26;        /* hover */
  --border: #26262e;
  --border-strong: #34343f;
  --text-1: #ededf0;
  --text-2: #a1a1aa;
  --text-3: #71717a;
  --accent: #5b8cff;       /* per-tenant override */
  --accent-strong: #2e5fff;
  --success: #22c55e;
  --warn: #f59e0b;
  --danger: #ef4444;
  --radius: 10px;
  --shadow-1: 0 1px 0 rgba(255,255,255,0.04), 0 8px 30px rgba(0,0,0,0.35);
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
}
```

El `--accent` se sobreescribe en runtime con el branding de la organización vía CSS variables inyectadas en `<html style>`.

### Tipografía

- **Inter** variable. Tracking ligeramente cerrado (`-0.011em`) en titulares.
- Escala: 12 / 13 / 14 / 16 / 18 / 22 / 28 / 36 / 48.
- 14 px es el cuerpo base. 13 px en tablas.

### Componentes base (`packages/ui`)

shadcn/ui como punto de partida, con overrides:

- `Button` (variants: primary, secondary, ghost, danger; sizes: sm, md, lg)
- `Input`, `Textarea`, `Select`, `Combobox`, `DatePicker`, `TimeRangePicker`
- `Card`, `Sheet`, `Dialog`, `Drawer`, `Popover`, `Tooltip`
- `Table` (con virtualización vía TanStack Table + react-virtual)
- `DataGrid` (versión avanzada con columnas resizable y persistencia de prefs)
- `Tabs`, `Breadcrumbs`, `Stepper`
- `Toast` (Sonner)
- `EmptyState`, `ErrorState`
- `KbdHint` (renderiza `⌘K`)
- `Avatar`, `Badge`, `Pill`, `KPICard`, `Sparkline`
- `Drawer` con animación de Spring (framer-motion)

### Glass / textura

Glassmorphism muy sutil — solo en el sidebar y en modals sobre escenas con foto:

```css
.glass {
  background: color-mix(in oklab, var(--bg-2) 78%, transparent);
  backdrop-filter: blur(18px) saturate(140%);
  border: 1px solid var(--border);
}
```

No usar en cards de contenido — distrae y golpea performance en tablets de garita.

### Microanimaciones

- Sidebar nav item: highlight slide 120 ms.
- Card hover: lift 1 px + border más fuerte, 80 ms.
- Modal: scale 0.97 → 1 + fade, 150 ms cubic-bezier(0.16, 1, 0.3, 1).
- Tabla row tap: flash de 60 ms accent al 8 %.
- No animaciones en el cockpit del guardia. Cero. Velocidad pura.

## Layout

### Shell autenticado

```
┌────────────────────────────────────────────────────┐
│ Top bar: org switcher · search · user menu         │
├──────────┬─────────────────────────────────────────┤
│ Sidebar  │ Page content                            │
│  Logo    │                                         │
│  Nav     │                                         │
│  ...     │                                         │
│  Plan    │                                         │
└──────────┴─────────────────────────────────────────┘
```

Sidebar 240 px, colapsable a 64 px (icon-only). Persistencia en localStorage.

### Sidebar — secciones

- **Operación**
  - Dashboard
  - Cockpit (atajo `G`)
  - Accesos
  - Alertas
- **Personas**
  - Residentes
  - Unidades
  - Vehículos
  - Visitantes
- **Configuración**
  - Autorizaciones
  - Accesos (puntos)
  - Guardias y turnos
  - Integraciones
- **Admin**
  - Miembros
  - Roles
  - Branding
  - API & Webhooks
  - Audit log
- **Billing**

Solo se muestran las secciones permitidas por las abilities del usuario.

## Pantallas clave

### Landing pública (`/`)

- Hero full-bleed dark con product mockup. CTA: "Crear mi barrio gratis".
- Bento grid con features (control de accesos, billing, reportes, scanner DNI, API).
- Logos de clientes (cuando los haya). Placeholder hasta entonces.
- Pricing comparativo con cards. Toggle mensual/anual.
- FAQ.
- Footer con compliance, contacto, términos.

### Onboarding wizard (`/onboarding/*`)

5 pasos. Cada paso autosave a `Organization.onboarding_state` para reanudar:

1. **Tu organización** — nombre, tipo, país, timezone.
2. **Branding** — logo (drag-drop), colores (con preview en vivo del dashboard).
3. **Estructura** — define puntos de acceso, importa unidades por CSV opcional.
4. **Equipo** — invita admins y guardias (skip allowed).
5. **Plan** — selecciona, ingresa medio de pago si trial = 0, finaliza.

### Dashboard

Grid responsivo:

- 4 KPICards arriba: Accesos hoy, Visitantes activos, Alertas abiertas, Residentes activos.
- 2 columnas:
  - **Live feed** (lista virtual de últimos 50 eventos, WS).
  - **Sparklines** de 7d para cada KPI.
- Mapa simple de access points con status (verde/rojo).
- "Tareas pendientes" — invitaciones sin aceptar, autorizaciones por aprobar, dunning, etc.

### Cockpit del guardia (`/cockpit`)

Layout dedicado full-screen. Sin sidebar. Diseño robusto para tablet horizontal.

```
┌────────────────────────────────────────────────────┐
│ Punto de acceso ▾  ·  Turno: Pérez (08:00-16:00)   │
├────────────────────────────┬───────────────────────┤
│                            │  Foto                 │
│  Estado: ESPERANDO         │                       │
│  Pasá el DNI por el lector │                       │
│                            │  Pérez, Juan Alberto  │
│                            │  DNI 12.345.678       │
│                            │  Lote A-32 — Residente│
│                            │  [GRANTED]            │
│  ─────────────────────     │                       │
│  Últimos 5 escaneos        │  [Notificar residente]│
│  ...                       │  [Marcar entrada]     │
└────────────────────────────┴───────────────────────┘
```

- Estados visuales muy diferenciados: idle (gris), match-resident (verde), match-authorized (verde), review (ámbar), denied (rojo).
- Sonido distintivo en cada estado.
- Acción primaria con teclado: `Enter` confirma, `D` deniega, `R` review/contactar.
- Persistencia local del último estado por si recarga la página.

### Lista de accesos

DataGrid con filtros: rango temporal, punto de acceso, outcome, método. Export CSV. Detalle en drawer lateral.

### Residentes

Tabla + búsqueda fuzzy + tags por unidad. Click → drawer con foto, datos, autorizaciones emitidas, accesos recientes, vehículos asociados.

### Autorizaciones

Vista calendario + vista lista. Crear con wizard rápido: persona/QR genérico → vehículo opcional → vigencia → recurrencia → notas → enviar.

### Billing

- Card grande con plan actual + uso (barras animadas vs límites).
- "Próximo cobro" en mono.
- Tabla de invoices con badge de estado + descarga PDF.
- Botón "Cambiar plan" → drawer con comparativa.

### Super admin (`/admin`)

Layout propio (banner morado arriba: "Modo plataforma — registrado en audit").

- **Organizaciones**: tabla con MRR, plan, status, MAUs. Acciones: ver, impersonate (modal con razón obligatoria), suspender, cambiar plan.
- **Métricas globales**: MRR, churn, retention, organizaciones por plan, conversion trial→paid.
- **Planes y precios**: editor.
- **Feature flags**: tabla con default y overrides por org.
- **Webhooks de MP**: inbox con replay manual.
- **Tickets de soporte**: integración Intercom (fase 3).

## Command palette (`Cmd/Ctrl+K`)

- Acciones globales: "Nuevo residente", "Nueva autorización", "Ir al cockpit".
- Búsqueda cross-resource (residentes, vehículos, accesos por DNI/patente).
- Atajos a settings.
- "?" muestra todos los shortcuts.

## Accesibilidad

- Contraste mínimo 4.5:1 en texto, 3:1 en componentes interactivos.
- Focus rings visibles en todos los componentes interactivos.
- Atajos de teclado documentados y respetan `prefers-reduced-motion`.
- Screen reader labels en iconos.
- Cockpit del guardia tiene modo "alto contraste" + tipografía más grande (toggle en su settings).

## Internacionalización

- Strings en `next-intl`. Default `es-AR`. EN como segundo idioma.
- Fechas/horarios siempre en la timezone de la organización.
- Números con separadores locales.
- Moneda según `Plan.currency` y `Organization.country` (ARS default).
