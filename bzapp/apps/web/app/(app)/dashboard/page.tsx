import { getSession } from '@/lib/server/auth';
import { prisma } from '@bzapp/db';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session || !session.org) redirect('/login');

  const [org, stats] = await Promise.all([
    prisma.organization.findUnique({ where: { id: session.org } }),
    Promise.all([
      prisma.person.count({ where: { organizationId: session.org } }),
      prisma.vehicle.count({ where: { organizationId: session.org } }),
      prisma.accessEvent.count({ where: { organizationId: session.org } }),
      prisma.alert.count({ where: { organizationId: session.org, resolvedAt: null } }),
    ]),
  ]);

  if (!org) redirect('/login');

  const [residents, vehicles, accesses, openAlerts] = stats;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{org.name}</h1>
        <p className="text-text-2 text-sm mt-1">
          {org.type} &middot; {org.status}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard title="Residentes" value={residents} />
        <KpiCard title="Vehiculos" value={vehicles} />
        <KpiCard title="Accesos totales" value={accesses} />
        <KpiCard title="Alertas abiertas" value={openAlerts} variant={openAlerts > 0 ? 'danger' : 'default'} />
      </div>

      {/* Placeholder sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-4">Ultimos accesos</h2>
          <p className="text-text-3 text-sm">No hay accesos registrados todavia. Conecta un scanner para empezar.</p>
        </div>
        <div className="card">
          <h2 className="font-semibold mb-4">Alertas recientes</h2>
          <p className="text-text-3 text-sm">Sin alertas. Todo tranquilo.</p>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  variant = 'default',
}: {
  title: string;
  value: number;
  variant?: 'default' | 'danger';
}) {
  return (
    <div className="card">
      <p className="text-sm text-text-2 mb-1">{title}</p>
      <p className={`text-3xl font-bold ${variant === 'danger' ? 'text-red-400' : 'text-text-1'}`}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}
