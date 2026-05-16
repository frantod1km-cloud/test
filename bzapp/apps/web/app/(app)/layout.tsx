import { redirect } from 'next/navigation';
import { getSession } from '@/lib/server/auth';
import Link from 'next/link';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border bg-bg-1 flex flex-col">
        <div className="px-4 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-accent flex items-center justify-center text-white font-bold text-xs">
              BZ
            </div>
            <span className="font-semibold text-sm">BZAPP</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavItem href="/dashboard" label="Dashboard" />
          <NavItem href="/access" label="Accesos" />
          <NavItem href="/residents" label="Residentes" />
          <NavItem href="/vehicles" label="Vehiculos" />
          <NavItem href="/authorizations" label="Autorizaciones" />
          <NavItem href="/alerts" label="Alertas" />

          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-medium text-text-3 uppercase tracking-wider">Config</p>
          </div>
          <NavItem href="/settings" label="Configuracion" />
        </nav>

        <div className="px-4 py-4 border-t border-border text-xs text-text-3">
          Plan Trial &middot; 14 dias
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-bg-0">
        <header className="h-14 border-b border-border px-6 flex items-center justify-between">
          <div />
          <form action="/api/v1/auth/logout" method="POST">
            <button type="submit" className="text-sm text-text-2 hover:text-text-1 transition-colors">
              Salir
            </button>
          </form>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 rounded text-sm text-text-2 hover:text-text-1 hover:bg-bg-3 transition-colors"
    >
      {label}
    </Link>
  );
}
