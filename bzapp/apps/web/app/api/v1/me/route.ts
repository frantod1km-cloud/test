import { NextResponse } from 'next/server';
import { prisma } from '@bzapp/db';
import { getSession } from '@/lib/server/auth';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { type: 'unauthorized', title: 'Not authenticated', status: 401, detail: 'Login required.' },
      { status: 401 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: {
      memberships: {
        where: { status: 'ACTIVE' },
        include: { organization: true, role: true },
      },
    },
  });

  if (!user) {
    return NextResponse.json(
      { type: 'not_found', title: 'User not found', status: 404, detail: 'User deleted.' },
      { status: 404 },
    );
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    isPlatformAdmin: user.isPlatformAdmin,
    memberships: user.memberships.map((m) => ({
      organizationId: m.organizationId,
      organizationName: m.organization.name,
      organizationSlug: m.organization.slug,
      role: m.role?.code ?? 'member',
      status: m.status,
    })),
  });
}
