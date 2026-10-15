import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { PermissionDenied } from '@/components/feedback/status-views';
import { hasAnyPermission, hasPermission } from '@/lib/permissions';
import { useAuthStore } from '@/stores/auth/auth.store';

/** Gates the protected area: unauthenticated users are redirected to /login. */
export function ProtectedRoute() {
  const status = useAuthStore((state) => state.status);
  const location = useLocation();

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

/**
 * Route-level permission guard. Accepts a single key or an array (ANY-OF).
 * Renders a denied view when none of the required keys are present.
 */
export function RequirePermission({
  permission,
  children,
}: {
  permission: string | string[];
  children: ReactNode;
}) {
  const permissions = useAuthStore((state) => state.permissions);
  const allowed = Array.isArray(permission)
    ? hasAnyPermission(permissions, permission)
    : hasPermission(permissions, permission);
  if (!allowed) {
    return <PermissionDenied />;
  }
  return <>{children}</>;
}
