import { describe, expect, it } from 'vitest';

import { buildCommercialStatusPayload } from './commercial-status.schema';

describe('buildCommercialStatusPayload', () => {
  it('builds Lost payload', () => {
    expect(
      buildCommercialStatusPayload('Lost', {
        competitorName: 'Comp X',
        reasonLost: 'Price',
        details: 'Extra',
      }),
    ).toEqual({
      status: 'Lost',
      competitorName: 'Comp X',
      reasonLost: 'Price',
      details: 'Extra',
    });
  });

  it('builds ContractorChanged payload', () => {
    expect(
      buildCommercialStatusPayload('ContractorChanged', {
        newContractorId: '674abc',
        reasonNote: 'Moved entity',
      }),
    ).toEqual({
      status: 'ContractorChanged',
      newContractorId: '674abc',
      reasonNote: 'Moved entity',
    });
  });

  it('builds Active without extra fields', () => {
    expect(buildCommercialStatusPayload('Active', {})).toEqual({ status: 'Active' });
  });
});
