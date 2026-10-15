/**
 * Permission-key helpers. Frontend permission checks are UX gating only —
 * the backend remains the authoritative security boundary.
 */

/** True when `permissions` contains the given key. */
export function hasPermission(permissions: readonly string[], key: string): boolean {
  return permissions.includes(key);
}

/** True when `permissions` contains at least one of the given keys. */
export function hasAnyPermission(permissions: readonly string[], keys: readonly string[]): boolean {
  return keys.some((key) => permissions.includes(key));
}

/** True when `permissions` contains all of the given keys. */
export function hasAllPermissions(permissions: readonly string[], keys: readonly string[]): boolean {
  return keys.every((key) => permissions.includes(key));
}
