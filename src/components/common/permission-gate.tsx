import type { ReactNode } from 'react';

import { hasAllPermissions, hasAnyPermission } from '@/lib/permissions';
import { useAuthStore } from '@/stores/auth/auth.store';

interface PermissionGateProps {
  /** Single permission key, or a list interpreted per `mode`. */
  permission: string | string[];
  /** `any` (default): at least one key; `all`: every key. */
  mode?: 'any' | 'all';
  /** Rendered when the check fails. */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Conditionally renders children based on the current user's permissions.
 * UX gating only — the backend remains the authority.
 */
export function PermissionGate({
  permission,
  mode = 'any',
  fallback = null,
  children,
}: PermissionGateProps) {
  const permissions = useAuthStore((state) => state.permissions);
  const keys = Array.isArray(permission) ? permission : [permission];
  const allowed =
    mode === 'all' ? hasAllPermissions(permissions, keys) : hasAnyPermission(permissions, keys);

  return <>{allowed ? children : fallback}</>;
}
