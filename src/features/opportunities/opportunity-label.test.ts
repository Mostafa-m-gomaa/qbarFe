import { describe, expect, it } from 'vitest';

import type { Opportunity } from '@/api/opportunities/opportunities.types';

import { opportunityComboboxOption, opportunityDisplayName } from './opportunity-label';

const sample: Opportunity = {
  id: 'opp-1',
  name: 'Hospital busbar',
  description: 'Phase 2',
  type: 'Tender',
  status: 'Open',
  salesOwnerId: null,
  salesOwnerUser: null,
  lossReason: null,
  lossDetails: null,
  resultDate: null,
  lifecycle: 'active',
  createdBy: 'u1',
  updatedBy: 'u1',
  createdByUser: null,
  updatedByUser: null,
  createdAt: '',
  updatedAt: '',
};

describe('opportunityComboboxOption', () => {
  it('uses name as label and type/status as description', () => {
    expect(opportunityComboboxOption(sample)).toEqual({
      value: 'opp-1',
      label: 'Hospital busbar',
      description: 'Tender / Open',
    });
  });
});

describe('opportunityDisplayName', () => {
  it('falls back to type/status without name', () => {
    expect(opportunityDisplayName({ type: 'In Hand', status: 'Won' })).toBe('In Hand / Won');
  });
});
