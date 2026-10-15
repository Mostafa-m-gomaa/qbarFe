import { describe, expect, it } from 'vitest';

import { hasAllPermissions, hasAnyPermission, hasPermission } from './permissions';

const perms = ['projects.read', 'quotations.read', 'quotations.view_cost'];

describe('permission helpers', () => {
  it('hasPermission checks a single key', () => {
    expect(hasPermission(perms, 'projects.read')).toBe(true);
    expect(hasPermission(perms, 'projects.create')).toBe(false);
  });

  it('hasAnyPermission is true when at least one key matches', () => {
    expect(hasAnyPermission(perms, ['projects.create', 'quotations.read'])).toBe(true);
    expect(hasAnyPermission(perms, ['a', 'b'])).toBe(false);
  });

  it('hasAllPermissions requires every key', () => {
    expect(hasAllPermissions(perms, ['projects.read', 'quotations.read'])).toBe(true);
    expect(hasAllPermissions(perms, ['projects.read', 'projects.create'])).toBe(false);
  });
});
