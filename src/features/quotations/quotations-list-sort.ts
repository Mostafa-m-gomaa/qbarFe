import type { Quotation } from '@/api/quotations/quotations.types';

import { dedupeQuotations, resolveListRevision } from './quotation-revision.utils';
import type {
  QuotationsDateSortOrder,
  QuotationsTotalSort,
} from './quotations-list-params';
import { QUOTATIONS_FILTER_ALL } from './quotations-list-params';

export function quotationListGrandTotalMinor(q: Quotation): number {
  if (typeof q.valueMinor === 'number' && Number.isFinite(q.valueMinor)) {
    return q.valueMinor;
  }
  return resolveListRevision(q).totals.grandAmountMinor;
}

export function quotationListCreatedAtMs(q: Quotation): number {
  const t = Date.parse(q.createdAt);
  return Number.isFinite(t) ? t : 0;
}

export function sortQuotationsForList(
  quotations: Quotation[],
  options: {
    dateSortOrder: QuotationsDateSortOrder;
    totalSort: QuotationsTotalSort;
  },
): Quotation[] {
  const rows = dedupeQuotations(quotations);
  const copy = [...rows];

  const compare =
    options.totalSort !== QUOTATIONS_FILTER_ALL
      ? (a: Quotation, b: Quotation) => {
          const diff = quotationListGrandTotalMinor(a) - quotationListGrandTotalMinor(b);
          if (diff !== 0) return options.totalSort === 'asc' ? diff : -diff;
          return quotationListCreatedAtMs(b) - quotationListCreatedAtMs(a);
        }
      : (a: Quotation, b: Quotation) => {
          const diff = quotationListCreatedAtMs(a) - quotationListCreatedAtMs(b);
          return options.dateSortOrder === 'asc' ? diff : -diff;
        };

  copy.sort(compare);
  return copy;
}
