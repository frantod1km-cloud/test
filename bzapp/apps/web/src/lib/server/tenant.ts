import { AsyncLocalStorage } from 'node:async_hooks';

export interface TenantContext {
  organizationId: string;
  userId: string;
  roles: string[];
  isSuperAdmin: boolean;
}

export const tenantStorage = new AsyncLocalStorage<TenantContext>();

export function getTenant(): TenantContext {
  const ctx = tenantStorage.getStore();
  if (!ctx) throw new Error('TenantContext missing — route not properly guarded');
  return ctx;
}

export function getTenantOrNull(): TenantContext | null {
  return tenantStorage.getStore() ?? null;
}
