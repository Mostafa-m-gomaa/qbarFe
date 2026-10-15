import { describe, expect, it } from 'vitest';

import { createQuotationSchema } from './create-quotation.schema';

describe('createQuotationSchema', () => {
  it('requires contractor and opportunity without projectId', () => {
    const result = createQuotationSchema.safeParse({
      contractorId: 'c1',
      opportunityId: 'o1',
      salesOwnerId: '',
      currencyCode: 'QAR',
      fxRateToBase: '1.00000000',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('projectId');
    }
  });
});
