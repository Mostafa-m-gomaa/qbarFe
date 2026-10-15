import { get } from '@/api/client/axios-client';

import type { Role } from './roles.types';

/** GET /roles — returns a plain array (read-only in Phase 1). */
export function listRoles(): Promise<Role[]> {
  return get<Role[]>('/roles');
}
