import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import type { FollowUp } from '@/api/follow-ups/follow-ups.types';
import { queryKeys } from '@/constants/query-keys';

import { getCachedFollowUpRevision, injectExpectedRevision } from './follow-up-mutation-cas';

describe('follow-up CAS helpers', () => {
  it('reads revision from detail cache', () => {
    const qc = new QueryClient();
    qc.setQueryData(queryKeys.followUps.detail('fu1'), { id: 'fu1', revision: 4 } as FollowUp);
    expect(getCachedFollowUpRevision(qc, 'fu1')).toBe(4);
  });

  it('injects expectedRevision', () => {
    expect(injectExpectedRevision({ expectedRevision: 0, title: 'x' }, 3)).toEqual({
      expectedRevision: 3,
      title: 'x',
    });
  });
});
