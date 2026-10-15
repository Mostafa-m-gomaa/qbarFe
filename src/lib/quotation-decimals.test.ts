import { describe, expect, it } from 'vitest';

import { sanitizeAsciiNumericInput } from './quotation-decimals';

describe('sanitizeAsciiNumericInput', () => {
  it('keeps ASCII digits and one decimal point', () => {
    expect(sanitizeAsciiNumericInput('12.34')).toBe('12.34');
    expect(sanitizeAsciiNumericInput('abc12.34xyz')).toBe('12.34');
  });

  it('blocks Arabic-Indic and Persian digits', () => {
    expect(sanitizeAsciiNumericInput('١٢٣')).toBe('');
    expect(sanitizeAsciiNumericInput('۱۲۳')).toBe('');
    expect(sanitizeAsciiNumericInput('5٦7')).toBe('57');
  });

  it('caps fraction digits when requested', () => {
    expect(sanitizeAsciiNumericInput('1.234567', 4)).toBe('1.2345');
  });
});
