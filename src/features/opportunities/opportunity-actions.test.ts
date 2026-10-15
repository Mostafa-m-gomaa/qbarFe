import { describe, expect, it } from 'vitest';

import type { CreateOpportunityRequest } from '@/api/opportunities/opportunities.types';

import { opportunityActions } from './opportunity-actions';
import { opportunityFormSchema } from './opportunity.schema';
import { opportunityDisplayName } from './opportunity-label';

const allPerms = { canStage: true, canArchive: true };

describe('opportunityActions', () => {
  it('allows Close Tender only for active Tender + Open', () => {
    expect(
      opportunityActions({ type: 'Tender', status: 'Open', lifecycle: 'active' }, allPerms)
        .canCloseTender,
    ).toBe(true);
    expect(
      opportunityActions({ type: 'In Hand', status: 'Open', lifecycle: 'active' }, allPerms)
        .canCloseTender,
    ).toBe(false);
  });

  it('allows Won and Lost only for active In Hand + Open', () => {
    const openInHand = opportunityActions(
      { type: 'In Hand', status: 'Open', lifecycle: 'active' },
      allPerms,
    );
    expect(openInHand.canWin).toBe(true);
    expect(openInHand.canLose).toBe(true);

    expect(
      opportunityActions({ type: 'Tender', status: 'Open', lifecycle: 'active' }, allPerms).canWin,
    ).toBe(false);
  });

  it('allows Reopen only for Won or Lost', () => {
    expect(
      opportunityActions({ type: 'In Hand', status: 'Won', lifecycle: 'active' }, allPerms)
        .canReopen,
    ).toBe(true);
    expect(
      opportunityActions({ type: 'In Hand', status: 'Open', lifecycle: 'active' }, allPerms)
        .canReopen,
    ).toBe(false);
  });
});

describe('opportunityFormSchema', () => {
  it('requires name and type on create', () => {
    expect(
      opportunityFormSchema.safeParse({
        name: 'New tender',
        description: '',
        type: 'Tender',
        salesOwnerId: '',
      }).success,
    ).toBe(true);

    const createBody: CreateOpportunityRequest = {
      name: 'Deal',
      type: 'In Hand',
      salesOwnerId: 'user-1',
    };
    expect(createBody).not.toHaveProperty('contractorId');
  });
});

describe('opportunityDisplayName', () => {
  it('prefers name over type/status', () => {
    expect(
      opportunityDisplayName({ name: '  Alpha  ', type: 'Tender', status: 'Open' }),
    ).toBe('Alpha');
  });
});
