import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@bzapp/db';
import {
  verifyPassword,
  hashToken,
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
} from '@/lib/server/auth';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { type: 'validation_error', title: 'Invalid input', status: 400, detail: 'Email and password required.' },
      { status: 400 },
    );
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      memberships: {
        where: { status: 'ACTIVE' },
        include: { organization: true, role: true },
        take: 1,
      },
    },
  });

  if (!user || !user.passwordHash) {
    return NextResponse.json(
      { type: 'unauthorized', title: 'Invalid credentials', status: 401, detail: 'Check email and password.' },
      { status: 401 },
    );
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { type: 'unauthorized', title: 'Invalid credentials', status: 401, detail: 'Check email and password.' },
      { status: 401 },
    );
  }

  // Get first active membership (or null)
  const membership = user.memberships[0] ?? null;
  const orgId = membership?.organizationId ?? null;
  const roles = membership?.role ? [membership.role.code] : [];

  const accessToken = await signAccessToken({
    sub: user.id,
    org: orgId,
    roles,
    super: user.isPlatformAdmin,
  });

  const refreshTokenRaw = await signRefreshToken(user.id);

  // Store refresh token
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshTokenRaw),
      expiresAt,
    },
  });

  // Update last login
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  await setAuthCookies(accessToken, refreshTokenRaw);

  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name },
    organization: membership
      ? { id: membership.organizationId, slug: membership.organization.slug, name: membership.organization.name }
      : null,
  });
}
