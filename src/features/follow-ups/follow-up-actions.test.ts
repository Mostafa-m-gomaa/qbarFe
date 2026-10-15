import { describe, expect, it } from 'vitest';

import type { FollowUp } from '@/api/follow-ups/follow-ups.types';

import { followUpActions } from './follow-up-actions';

const base: FollowUp = {
  id: 'fu1',
  opportunityId: 'opp1',
  quotationId: null,
  title: 'Call',
  type: 'Call',
  assignedToId: 'user-assignee',
  dueAt: '2030-01-01T09:00:00.000Z',
  dueState: 'upcoming',
  status: 'open',
  notes: '',
  outcome: null,
  completedAt: null,
  revision: 0,
  createdBy: 'u1',
  updatedBy: 'u1',
  createdAt: '',
  updatedAt: '',
  opportunity: {
    id: 'opp1',
    name: 'Tower retrofit',
    description: null,
    type: 'In Hand',
    status: 'Open',
    salesOwnerId: 'user-owner',
  },
  quotation: null,
  assignedToUser: null,
  createdByUser: null,
};

describe('followUpActions', () => {
  it('allows edit/complete for assignee with permissions', () => {
    const a = followUpActions(base, {
      currentUserId: 'user-assignee',
      canUpdate: true,
      canComplete: true,
      canCancel: true,
    });
    expect(a.canEdit).toBe(true);
    expect(a.canComplete).toBe(true);
    expect(a.canCancel).toBe(true);
  });

  it('allows mutations for opportunity sales owner', () => {
    const a = followUpActions(base, {
      currentUserId: 'user-owner',
      canUpdate: true,
      canComplete: true,
      canCancel: false,
    });
    expect(a.canEdit).toBe(true);
    expect(a.canCancel).toBe(false);
  });

  it('denies mutations for read_all manager who is not owner or assignee', () => {
    const a = followUpActions(base, {
      currentUserId: 'user-manager',
      canUpdate: true,
      canComplete: true,
      canCancel: true,
    });
    expect(a.canEdit).toBe(false);
    expect(a.canComplete).toBe(false);
    expect(a.canCancel).toBe(false);
  });

  it('blocks actions when not open', () => {
    const a = followUpActions({ ...base, status: 'completed' }, {
      currentUserId: 'user-assignee',
      canUpdate: true,
      canComplete: true,
      canCancel: true,
    });
    expect(a.canEdit).toBe(false);
  });
});
