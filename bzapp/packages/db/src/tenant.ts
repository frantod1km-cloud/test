/**
 * Lista de modelos que tienen organization_id y deben filtrarse por tenant.
 */
export const TENANT_SCOPED_MODELS = new Set([
  'Organization', // special — se filtra por id, no por organizationId
  'Membership',
  'Subscription',
  'Role',
  'Person',
  'Unit',
  'Resident',
  'Vehicle',
  'AccessPoint',
  'Authorization',
  'AccessEvent',
  'Alert',
  'AuditLog',
]);

/**
 * Modelos globales que NO deben filtrarse por tenant.
 */
export const GLOBAL_MODELS = new Set(['User', 'RefreshToken', 'Plan']);
