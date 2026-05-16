import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-accent flex items-center justify-center text-white font-bold text-sm">
            BZ
          </div>
          <span className="font-semibold text-lg">BZAPP</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-text-2 hover:text-text-1 transition-colors">
            Iniciar sesion
          </Link>
          <Link href="/register" className="btn-primary text-sm">
            Crear cuenta
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-3xl text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Control de accesos
            <br />
            <span className="text-accent">inteligente y moderno</span>
          </h1>
          <p className="text-xl text-text-2 mb-10 max-w-2xl mx-auto">
            La plataforma SaaS mas avanzada para barrios privados, countries, edificios, clubes y
            parques industriales. Scanner DNI, autorizaciones QR, reportes en tiempo real.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register" className="btn-primary px-8 py-3 text-base">
              Empezar gratis
            </Link>
            <Link href="#features" className="btn-secondary px-8 py-3 text-base">
              Ver features
            </Link>
          </div>
        </div>
      </main>

      {/* Features grid */}
      <section id="features" className="border-t border-border px-6 py-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Scanner DNI', desc: 'PDF417 argentino, QR, OCR patentes. Respuesta < 300ms.' },
            { title: 'Multi-tenant', desc: 'Cada barrio es independiente. Datos aislados, branding propio.' },
            { title: 'Tiempo real', desc: 'Feed de accesos en vivo. Alertas instantaneas.' },
            { title: 'Billing integrado', desc: 'Suscripciones con MercadoPago. Facturas automaticas.' },
            { title: 'Roles y permisos', desc: 'Owner, admin, jefe seguridad, guardia, residente.' },
            { title: 'API abierta', desc: 'REST + webhooks. Integrá con cámaras, barreras, CRM.' },
          ].map((f) => (
            <div key={f.title} className="card">
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-text-2">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-6 text-center text-sm text-text-3">
        BZAPP &copy; {new Date().getFullYear()}. Control de accesos premium.
      </footer>
    </div>
  );
}
