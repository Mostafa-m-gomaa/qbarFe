import { describe, expect, it } from 'vitest';

import { formatMoney } from './money';

describe('formatMoney', () => {
  it('formats using the currency minorUnits (2 decimals)', () => {
    const result = formatMoney({ amountMinor: 10050, currencyCode: 'USD', minorUnits: 2 });
    expect(result).toContain('100.50');
  });

  it('does not assume 2 decimals — respects minorUnits = 0', () => {
    const result = formatMoney({ amountMinor: 100, currencyCode: 'JPY', minorUnits: 0 });
    expect(result).toContain('100');
    expect(result).not.toContain('.00');
  });

  it('respects minorUnits = 3', () => {
    const result = formatMoney({ amountMinor: 12345, currencyCode: 'BHD', minorUnits: 3 });
    expect(result).toContain('12.345');
  });

  it('falls back to raw integer + code when minorUnits is unknown', () => {
    const result = formatMoney({ amountMinor: 10050, currencyCode: 'EGP', minorUnits: null });
    expect(result).toContain('EGP');
    expect(result).toContain('10,050');
  });
});
