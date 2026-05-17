/**
 * Inngest serve endpoint.
 *
 * When Inngest is properly installed:
 * import { serve } from 'inngest/next';
 * import { inngest } from '@/lib/inngest/client';
 * import * as functions from '@/lib/inngest/functions';
 * export const { GET, POST, PUT } = serve({ client: inngest, functions: Object.values(functions) });
 *
 * For now, placeholder:
 */

export async function GET() {
  return Response.json({ status: 'inngest_stub', message: 'Install inngest package to activate.' });
}

export async function POST() {
  return Response.json({ ok: true });
}
