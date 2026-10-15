import { describe, expect, it } from 'vitest';

import { pendingProductionMetersFromWarnings } from './project-close-warnings';

describe('pendingProductionMetersFromWarnings', () => {
  it('returns meters for pending_production warning', () => {
    expect(
      pendingProductionMetersFromWarnings([{ code: 'pending_production', quantityScaled: 250_000 }]),
    ).toBe('25');
  });

  it('returns null when no matching warning', () => {
    expect(pendingProductionMetersFromWarnings([{ code: 'other' }])).toBeNull();
    expect(pendingProductionMetersFromWarnings(undefined)).toBeNull();
  });
});
