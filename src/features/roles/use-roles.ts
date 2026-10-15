import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { listRoles } from '@/api/roles/roles.api';
import type { Role } from '@/api/roles/roles.types';
import { queryKeys } from '@/constants/query-keys';

export function useRoles() {
  return useQuery({
    queryKey: queryKeys.roles.all,
    queryFn: () => listRoles(),
    staleTime: 5 * 60_000,
  });
}

/** Returns an id → role lookup map (empty until loaded). */
export function useRoleMap(): Map<string, Role> {
  const { data } = useRoles();
  return useMemo(() => {
    const map = new Map<string, Role>();
    for (const role of data ?? []) map.set(role.id, role);
    return map;
  }, [data]);
}
