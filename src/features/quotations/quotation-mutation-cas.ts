import type { QueryClient } from '@tanstack/react-query';

import type { Quotation } from '@/api/quotations/quotations.types';
import { queryKeys } from '@/constants/query-keys';

import { draftRevision } from './quotation-revision.utils';

/** Draft revision version from the quotation detail cache (CAS token for mutations). */
export function getCachedDraftVersion(qc: QueryClient, quotationId: string): number {
  const q = qc.getQueryData<Quotation>(queryKeys.quotations.detail(quotationId));
  if (!q) return 0;
  const draft = draftRevision(q);
  return draft?.version ?? q.currentRevision.version;
}

/**
 * Replace stale `expectedRevisionVersion` on mutation args using the latest cache value.
 * Supports top-level CAS fields and nested `{ body: { expectedRevisionVersion } }` shapes.
 */
export function injectExpectedRevisionVersion<T>(args: T, version: number): T {
  if (args === undefined || args === null) {
    return args;
  }
  if (typeof args !== 'object') {
    return args;
  }

  const record = args as Record<string, unknown>;

  if ('expectedRevisionVersion' in record) {
    return { ...record, expectedRevisionVersion: version } as T;
  }

  if ('body' in record && record.body !== null && typeof record.body === 'object') {
    const body = record.body as Record<string, unknown>;
    if ('expectedRevisionVersion' in body) {
      return {
        ...record,
        body: { ...body, expectedRevisionVersion: version },
      } as T;
    }
  }

  return args;
}
