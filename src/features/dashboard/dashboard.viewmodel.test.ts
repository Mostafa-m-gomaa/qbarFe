import { describe, expect, it } from 'vitest';

import type { DashboardResponse } from '@/api/dashboard/dashboard.types';
import type { User } from '@/api/users/users.types';

import { toDashboardViewModel } from './dashboard.viewmodel';

function makeUser(id: string, name: string): User {
  return {
    id,
    name,
    email: `${id}@example.com`,
    roleIds: [],
    isActive: true,
    lastLoginAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

const base: DashboardResponse = {
  asOf: '2026-09-23',
  baseCurrencyCode: 'EGP',
  summary: {
    visibleProjects: 3,
    openInHand: { count: 2, valueBaseAmountMinor: 500000 },
    overdueFollowUps: 1,
    winRatePercent: 50,
    wonCount: 2,
    lostCount: 2,
    issuedQuotations: { count: 4, valueBaseAmountMinor: 900000 },
  },
  activityLast30BySalesperson: [
    { userId: 'u1', count: 3 },
    { userId: 'u2', count: 7 },
  ],
  pipelineByStage: [
    { key: 'Lead', count: 0 },
    { key: 'PO', count: 2 },
  ],
  attention: { overdue: 1, staleProjects: 0, draftQuotesOlderThan7d: 0, negativeMarginQuotes: null },
  next7Days: [],
};

describe('toDashboardViewModel', () => {
  it('maps pipeline points with labels', () => {
    const vm = toDashboardViewModel(base, new Map());
    expect(vm.pipeline).toHaveLength(2);
    expect(vm.pipeline[1]).toMatchObject({ stage: 'PO', label: 'PO', count: 2 });
    expect(vm.hasPipeline).toBe(true);
  });

  it('resolves salesperson names and sorts by count desc', () => {
    const userMap = new Map<string, User>([
      ['u1', makeUser('u1', 'Alice')],
      ['u2', makeUser('u2', 'Bob')],
    ]);
    const vm = toDashboardViewModel(base, userMap);
    expect(vm.activityBySalesperson[0]).toMatchObject({ name: 'Bob', count: 7 });
    expect(vm.activityBySalesperson[1]).toMatchObject({ name: 'Alice', count: 3 });
    expect(vm.hasActivity).toBe(true);
  });

  it('falls back to a short id when the user is unknown', () => {
    const vm = toDashboardViewModel(base, new Map());
    expect(vm.activityBySalesperson.every((a) => a.name.startsWith('#'))).toBe(true);
  });

  it('flags empty pipeline when all counts are zero', () => {
    const vm = toDashboardViewModel(
      { ...base, pipelineByStage: [{ key: 'Lead', count: 0 }] },
      new Map(),
    );
    expect(vm.hasPipeline).toBe(false);
  });
});
