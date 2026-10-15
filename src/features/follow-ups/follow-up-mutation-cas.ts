import type { QueryClient } from '@tanstack/react-query';

import type { FollowUp } from '@/api/follow-ups/follow-ups.types';
import { queryKeys } from '@/constants/query-keys';

export function getCachedFollowUpRevision(qc: QueryClient, id: string): number {
  const row = qc.getQueryData<FollowUp>(queryKeys.followUps.detail(id));
  return row?.revision ?? 0;
}

export function injectExpectedRevision<T extends Record<string, unknown>>(
  args: T,
  revision: number,
): T {
  return { ...args, expectedRevision: revision };
}
