import { describe, expect, it } from 'vitest';

import { commercialStatusRequiresForm, COMMERCIAL_STATUS_VALUES } from './quotation-commercial.utils';

describe('quotation-commercial.utils', () => {
  it('lists all commercial statuses', () => {
    expect(COMMERCIAL_STATUS_VALUES).toHaveLength(7);
  });

  it('requires form for statuses with extra fields', () => {
    expect(commercialStatusRequiresForm('Lost')).toBe(true);
    expect(commercialStatusRequiresForm('Active')).toBe(false);
    expect(commercialStatusRequiresForm('Won')).toBe(false);
  });
});
