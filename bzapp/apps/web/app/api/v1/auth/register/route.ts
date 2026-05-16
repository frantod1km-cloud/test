import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@bzapp/db';
import {
  hashPassword,
  hashToken,
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
} from '@/lib/server/auth';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  organizationName: z.string().min(2),
  organizationType: z.enum([
    'COUNTRY',
    'BUILDING',
    'INDUSTRIAL_PARK',
    'OFFICE',
    'CLUB',
    'NEIGHBORHOOD',
    'OTHER',
  ]),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { type: 'validation_error', title: 'Invalid input', status: 400, detail: parsed.error.message },
      { status: 400 },
    );
  }

  const { email, password, name, organizationName, organizationType } = parsed.data;

  // Check existing user
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { type: 'conflict', title: 'Email already registered', status: 409, detail: 'Use login instead.' },
      { status: 409 },
    );
  }

  // Get starter plan
  const plan = await prisma.plan.findFirst({ where: { code: 'starter', isActive: true } });
  if (!plan) {
    return NextResponse.json(
      { type: 'server_error', title: 'No plan available', status: 500, detail: 'Seed the database.' },
      { status: 500 },
    );
  }

  // Create user + organization + membership + subscription in transaction
  const slug = organizationName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48);

  const passwordHashed = await hashPassword(password);

  const result = await prisma.$transaction(async (tx: typeof prisma) => {
    const user = await tx.user.create({
      data: { email, passwordHash: passwordHashed, name },
    });

    const org = await tx.organization.create({
      data: {
        slug: `${slug}-${user.id.slice(0, 8)}`,
        name: organizationName,
        type: organizationType as any,
        status: 'TRIALING',
      },
    });

    // Find owner role
    const ownerRole = await tx.role.findFirst({ where: { code: 'org.owner', isSystem: true } });

    await tx.membership.create({
      data: {
        userId: user.id,
        organizationId: org.id,
        status: 'ACTIVE',
        roleId: ownerRole?.id ?? null,
        joinedAt: new Date(),
      },
    });

    const now = new Date();
    const trialEnd = new Date(now.getTime() + plan.trialDays * 24 * 60 * 60 * 1000);

    await tx.subscription.create({
      data: {
        organizationId: org.id,
        planId: plan.id,
        status: 'TRIALING',
        trialEndsAt: trialEnd,
        currentPeriodStart: now,
        currentPeriodEnd: trialEnd,
      },
    });

    return { user, org, ownerRole };
  });

  // Issue tokens
  const accessToken = await signAccessToken({
    sub: result.user.id,
    org: result.org.id,
    roles: result.ownerRole ? [result.ownerRole.code] : ['org.owner'],
    super: false,
  });

  const refreshTokenRaw = await signRefreshToken(result.user.id);

  // Store refresh token hash
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({
    data: {
      userId: result.user.id,
      tokenHash: hashToken(refreshTokenRaw),
      expiresAt,
    },
  });

  setAuthCookies(accessToken, refreshTokenRaw);

  return NextResponse.json(
    {
      user: { id: result.user.id, email: result.user.email, name: result.user.name },
      organization: { id: result.org.id, slug: result.org.slug, name: result.org.name },
    },
    { status: 201 },
  );
}
