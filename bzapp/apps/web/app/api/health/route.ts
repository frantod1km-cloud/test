import { prisma } from '@bzapp/db';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: 'ok', db: 'connected', ts: new Date().toISOString() });
  } catch (e) {
    return Response.json({ status: 'error', db: 'disconnected' }, { status: 503 });
  }
}
