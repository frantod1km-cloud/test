import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // --- Plans ---
  const plans = [
    {
      code: 'starter',
      name: 'Starter',
      description: 'Para barrios o edificios chicos. Hasta 100 residentes.',
      priceMonthlyCents: 15000,
      priceYearlyCents: 150000,
      trialDays: 14,
      limits: { max_users: 5, max_residents: 100, max_accesses_month: 5000, max_access_points: 2 },
      features: { whatsapp: false, api_access: false, custom_branding: false },
      sortOrder: 1,
    },
    {
      code: 'growth',
      name: 'Growth',
      description: 'Para countries medianos. Hasta 500 residentes.',
      priceMonthlyCents: 45000,
      priceYearlyCents: 450000,
      trialDays: 14,
      limits: { max_users: 20, max_residents: 500, max_accesses_month: 20000, max_access_points: 5 },
      features: { whatsapp: true, api_access: false, custom_branding: true },
      sortOrder: 2,
    },
    {
      code: 'pro',
      name: 'Pro',
      description: 'Para countries grandes y parques industriales.',
      priceMonthlyCents: 90000,
      priceYearlyCents: 900000,
      trialDays: 14,
      limits: { max_users: 50, max_residents: 2000, max_accesses_month: 100000, max_access_points: 20 },
      features: { whatsapp: true, api_access: true, custom_branding: true },
      sortOrder: 3,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { code: plan.code },
      update: plan,
      create: plan,
    });
  }
  console.log(`  ✓ ${plans.length} plans seeded`);

  // --- System Roles ---
  const roles = [
    { code: 'org.owner', name: 'Owner', description: 'Dueño de la organización', permissions: ['*'] },
    { code: 'org.admin', name: 'Administrador', description: 'Admin delegado', permissions: ['organization:settings:*', 'members:*', 'residents:*', 'access:*', 'reports:*'] },
    { code: 'security.manager', name: 'Jefe de Seguridad', description: 'Gestiona guardias y accesos', permissions: ['access:*', 'guards:*', 'alerts:*', 'reports:read', 'residents:read'] },
    { code: 'guard', name: 'Guardia', description: 'Operador de garita', permissions: ['access:create', 'access:read', 'alerts:create', 'residents:read', 'authorizations:read', 'vehicles:read'] },
    { code: 'resident', name: 'Residente', description: 'Residente con acceso limitado', permissions: ['residents:read:own', 'authorizations:*:own', 'vehicles:*:own', 'access:read:own'] },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { organizationId_code: { organizationId: null as any, code: role.code } },
      update: { name: role.name, description: role.description, permissions: role.permissions },
      create: { ...role, isSystem: true, organizationId: null },
    });
  }
  console.log(`  ✓ ${roles.length} system roles seeded`);

  console.log('Done!');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
