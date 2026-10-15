import { describe, expect, it } from 'vitest';

import type { ListActivitiesParams } from '@/api/activities/activities.types';

import { activityActions, activityDisplayStatus } from './activity-actions';
import { ACTIVITY_TYPE_OPTIONS, activityFormSchema } from './activity.schema';

const allPerms = { canUpdate: true, canComplete: true, canArchive: true };

describe('activityActions', () => {
  it('allows edit/complete/archive for an open active activity', () => {
    expect(activityActions({ completed: false, lifecycle: 'active' }, allPerms)).toEqual({
      canEdit: true,
      canComplete: true,
      canArchive: true,
    });
  });

  it('blocks edit and complete when completed', () => {
    expect(activityActions({ completed: true, lifecycle: 'active' }, allPerms)).toEqual({
      canEdit: false,
      canComplete: false,
      canArchive: true,
    });
  });

  it('blocks edit, complete, and archive when cancelled', () => {
    expect(activityActions({ completed: false, lifecycle: 'cancelled' }, allPerms)).toEqual({
      canEdit: false,
      canComplete: false,
      canArchive: false,
    });
  });
});

describe('activityDisplayStatus', () => {
  const now = new Date(2026, 8, 23); // Sep 23, 2026 local

  it('returns Cancelled / Completed before overdue checks', () => {
    expect(
      activityDisplayStatus(
        { completed: false, lifecycle: 'cancelled', nextFollowUpOn: '2020-01-01' },
        now,
      ),
    ).toBe('Cancelled');
    expect(
      activityDisplayStatus(
        { completed: true, lifecycle: 'active', nextFollowUpOn: '2020-01-01' },
        now,
      ),
    ).toBe('Completed');
  });

  it('marks open activities overdue when next follow-up is before today', () => {
    expect(
      activityDisplayStatus(
        { completed: false, lifecycle: 'active', nextFollowUpOn: '2026-09-22' },
        now,
      ),
    ).toBe('Overdue');
    expect(
      activityDisplayStatus(
        { completed: false, lifecycle: 'active', nextFollowUpOn: '2026-09-23' },
        now,
      ),
    ).toBe('Open');
  });
});

describe('activityFormSchema', () => {
  const valid = {
    projectId: 'p1',
    type: 'Call' as const,
    occurredOn: '2026-09-01',
    nextAction: 'Follow up',
    nextFollowUpOn: '2026-09-10',
    notes: '',
    assignedUserId: '',
  };

  it('requires project, type, dates, and next action', () => {
    expect(activityFormSchema.safeParse(valid).success).toBe(true);
    expect(activityFormSchema.safeParse({ ...valid, projectId: '' }).success).toBe(false);
    expect(activityFormSchema.safeParse({ ...valid, nextAction: '' }).success).toBe(false);
    expect(activityFormSchema.safeParse({ ...valid, occurredOn: '' }).success).toBe(false);
  });

  it('accepts only the approved activity types', () => {
    for (const type of ACTIVITY_TYPE_OPTIONS) {
      expect(activityFormSchema.safeParse({ ...valid, type }).success).toBe(true);
    }
    expect(activityFormSchema.safeParse({ ...valid, type: 'Meeting' }).success).toBe(false);
  });
});

describe('ListActivitiesParams completed filter', () => {
  it('uses string true/false for the backend completed query param', () => {
    const withCompleted: ListActivitiesParams = { completed: 'true' };
    const without: ListActivitiesParams = { completed: 'false' };
    expect(withCompleted.completed).toBe('true');
    expect(without.completed).toBe('false');

    // Empty filters should be omitted by callers (page builds params with spreads).
    const omitted: ListActivitiesParams = {};
    expect(omitted.completed).toBeUndefined();
  });
});
