import { describe, expect, it } from 'vitest';

import { directoryActionsFor } from './directory-actions';

describe('directoryActionsFor', () => {
  it('active entries can be deactivated or archived, not activated', () => {
    expect(directoryActionsFor('active')).toEqual({
      canActivateFrom: false,
      canDeactivateFrom: true,
      canArchiveFrom: true,
    });
  });

  it('inactive entries can be activated or archived, not deactivated', () => {
    expect(directoryActionsFor('inactive')).toEqual({
      canActivateFrom: true,
      canDeactivateFrom: false,
      canArchiveFrom: true,
    });
  });

  it('archived entries can only be activated (restored)', () => {
    expect(directoryActionsFor('archived')).toEqual({
      canActivateFrom: true,
      canDeactivateFrom: false,
      canArchiveFrom: false,
    });
  });
});
