import { describe, expect, it } from 'vitest';

import {
  mergeAdditionalCostAtIndex,
  parseAdditionalCostRow,
} from './additional-costs-editor.utils';

describe('parseAdditionalCostRow', () => {
  it('rejects empty description', () => {
    expect(parseAdditionalCostRow('', '10')).toEqual({ ok: false, message: expect.any(String) });
  });

  it('accepts valid row', () => {
    expect(parseAdditionalCostRow('Freight', '12.50')).toEqual({
      ok: true,
      row: { description: 'Freight', amountMinor: 1250 },
    });
  });
});

describe('mergeAdditionalCostAtIndex', () => {
  it('updates one row and keeps others from forms when valid', () => {
    const costs = [
      { description: 'A', amountMinor: 100 },
      { description: 'B', amountMinor: 200 },
    ];
    const forms = [
      { description: 'A updated', amountText: '1.00' },
      { description: 'B', amountText: '2.00' },
    ];
    const merged = mergeAdditionalCostAtIndex(costs, forms, 0, {
      description: 'A saved',
      amountMinor: 150,
    });
    expect(merged).toEqual([
      { description: 'A saved', amountMinor: 150 },
      { description: 'B', amountMinor: 200 },
    ]);
  });
});
