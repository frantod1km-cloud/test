# Mercado — Marketplace con Next.js + Supabase

## Stack
- **Next.js 14** (App Router)
- **Supabase** (base de datos + API)
- **Vercel** (deploy)

---

## 1. Configuración local

```bash
npm install
```

Creá el archivo `.env.local` (ya incluido como ejemplo en `.env.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon
```

> ⚠️ **Nunca uses la clave `secret` en el frontend.** Solo la clave `anon` va en `NEXT_PUBLIC_*`.

```bash
npm run dev
# Abrí http://localhost:3000
```

---

## 2. Tabla en Supabase

Ejecutá este SQL en **Supabase → SQL Editor**:

```sql
CREATE TABLE orders (
  id         BIGSERIAL PRIMARY KEY,
  customer   JSONB        NOT NULL,
  shipping   JSONB        NOT NULL,
  payment    JSONB        NOT NULL,  -- solo guarda los últimos 4 dígitos
  items      JSONB        NOT NULL,
  total      INTEGER      NOT NULL,
  status     TEXT         NOT NULL DEFAULT 'pending_review',
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Row Level Security (recomendado)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Solo el backend (service_role) puede leer/modificar órdenes
-- Los clientes solo pueden insertar
CREATE POLICY "insert_only" ON orders
  FOR INSERT WITH CHECK (true);
```

---

## 3. Deploy en Vercel

1. Subí el proyecto a GitHub
2. En Vercel → **New Project** → importá el repo
3. En **Environment Variables** agregá:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy** — Vercel detecta Next.js automáticamente

---

## Estructura del proyecto

```
marketplace/
├── app/
│   ├── layout.js          # Layout global + fuentes
│   ├── page.js            # Página principal
│   ├── globals.css        # Variables CSS globales
│   └── api/orders/
│       └── route.js       # API Route — guarda pedidos en Supabase
├── components/
│   ├── Marketplace.js     # Componente principal (estado global)
│   ├── Navbar.js
│   ├── ProductGrid.js
│   ├── Drawer.js          # Panel lateral (carrito/checkout)
│   ├── CartView.js
│   ├── Checkout.js        # Formulario de pago
│   └── Success.js
└── lib/
    ├── supabase.js        # Cliente de Supabase
    └── products.js        # Datos de productos (reemplazable por tabla Supabase)
```

---

## Seguridad de datos de pago

- Solo se almacenan los **últimos 4 dígitos** de la tarjeta
- El número completo nunca toca el servidor ni la base de datos
- Para producción real, considerá cifrar los datos o usar un procesador PCI-compliant
