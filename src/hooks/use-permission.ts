import { hasAllPermissions, hasAnyPermission, hasPermission } from '@/lib/permissions';
import { useAuthStore } from '@/stores/auth/auth.store';

/** Returns whether the current user has the given permission key (UX gating only). */
export function usePermission(key: string): boolean {
  const permissions = useAuthStore((state) => state.permissions);
  return hasPermission(permissions, key);
}

/** Returns whether the current user has at least one of the given permission keys. */
export function useAnyPermission(keys: readonly string[]): boolean {
  const permissions = useAuthStore((state) => state.permissions);
  return hasAnyPermission(permissions, keys);
}

/** Returns whether the current user has all of the given permission keys. */
export function useAllPermissions(keys: readonly string[]): boolean {
  const permissions = useAuthStore((state) => state.permissions);
  return hasAllPermissions(permissions, keys);
}
