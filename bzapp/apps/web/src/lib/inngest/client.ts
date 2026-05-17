/**
 * Inngest client stub.
 *
 * In production, install `inngest` package and configure:
 * import { Inngest } from 'inngest';
 * export const inngest = new Inngest({ id: 'bzapp' });
 *
 * For now this is a no-op placeholder.
 */

export const inngest = {
  createFunction: (..._args: any[]) => () => {},
  send: async (_event: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[inngest:stub] event sent:', _event?.name ?? _event);
    }
  },
};
