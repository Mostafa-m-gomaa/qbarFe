import { describe, expect, it } from 'vitest';

import type { Quotation } from '@/api/quotations/quotations.types';

import { QUOTATIONS_FILTER_ALL } from './quotations-list-params';
import { sortQuotationsForList } from './quotations-list-sort';

function miniQuotation(
  id: string,
  createdAt: string,
  valueMinor: number,
): Quotation {
  return {
    id,
    ref: id,
    contractorId: 'c1',
    opportunityId: 'o1',
    salesOwnerId: 'u1',
    currencyCode: 'EGP',
    status: 'Draft',
    commercialStatus: 'Active',
    lifecycle: 'active',
    valueMinor,
    createdAt,
    updatedAt: createdAt,
    contractor: null,
    opportunity: null,
    salesOwnerUser: null,
    currentRevision: {
      rev: 0,
      version: 0,
      status: 'Draft',
      date: createdAt,
      currencyCode: 'EGP',
      currencyMinorUnits: 2,
      totals: { grandAmountMinor: valueMinor } as Quotation['currentRevision']['totals'],
    } as Quotation['currentRevision'],
    revisions: [],
    createdBy: 'u1',
    updatedBy: 'u1',
    createdByUser: null,
    updatedByUser: null,
    archivedAt: null,
    archivedBy: null,
  };
}

describe('sortQuotationsForList', () => {
  const items = [
    miniQuotation('a', '2026-10-12T09:00:00.000Z', 150480),
    miniQuotation('b', '2026-10-04T19:00:00.000Z', 15390000),
    miniQuotation('c', '2026-09-27T21:00:00.000Z', 0),
  ];

  it('sorts by createdAt descending by default', () => {
    const sorted = sortQuotationsForList(items, {
      dateSortOrder: 'desc',
      totalSort: QUOTATIONS_FILTER_ALL,
    });
    expect(sorted.map((q) => q.id)).toEqual(['a', 'b', 'c']);
  });

  it('sorts by createdAt ascending', () => {
    const sorted = sortQuotationsForList(items, {
      dateSortOrder: 'asc',
      totalSort: QUOTATIONS_FILTER_ALL,
    });
    expect(sorted.map((q) => q.id)).toEqual(['c', 'b', 'a']);
  });

  it('sorts by grand total descending', () => {
    const sorted = sortQuotationsForList(items, {
      dateSortOrder: 'desc',
      totalSort: 'desc',
    });
    expect(sorted.map((q) => q.id)).toEqual(['b', 'a', 'c']);
  });

  it('sorts by grand total ascending', () => {
    const sorted = sortQuotationsForList(items, {
      dateSortOrder: 'desc',
      totalSort: 'asc',
    });
    expect(sorted.map((q) => q.id)).toEqual(['c', 'a', 'b']);
  });
});
