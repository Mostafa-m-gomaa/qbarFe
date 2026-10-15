import type { OpportunityType } from '@/api/opportunities/opportunities.types';
import type {
  ListQuotationsParams,
  QuotationCommercialStatus,
  QuotationStatus,
} from '@/api/quotations/quotations.types';

export const QUOTATIONS_FILTER_ALL = 'all' as const;

export type QuotationStatusFilter = QuotationStatus | typeof QUOTATIONS_FILTER_ALL;
export type QuotationCommercialStatusFilter =
  | QuotationCommercialStatus
  | typeof QUOTATIONS_FILTER_ALL;
export type QuotationOpportunityTypeFilter = OpportunityType | typeof QUOTATIONS_FILTER_ALL;

export type QuotationsDateSortOrder = 'asc' | 'desc';
export type QuotationsTotalSort = typeof QUOTATIONS_FILTER_ALL | 'asc' | 'desc';

export const QUOTATIONS_DEFAULT_DATE_SORT: QuotationsDateSortOrder = 'desc';

export interface QuotationsListFilterInput {
  page: number;
  limit: number;
  contractorId: string | null;
  opportunityId: string | null;
  status: QuotationStatusFilter;
  commercialStatus: QuotationCommercialStatusFilter;
  currencyCode: string | null;
  q: string;
  createdFrom: string;
  createdTo: string;
  salesOwnerId: string | null;
  opportunityType: QuotationOpportunityTypeFilter;
  dateSortOrder: QuotationsDateSortOrder;
  totalSort: QuotationsTotalSort;
}

export function quotationsListFiltersToParams(
  filters: QuotationsListFilterInput,
): ListQuotationsParams {
  const sortParams: Pick<ListQuotationsParams, 'sortBy' | 'sortOrder'> =
    filters.totalSort !== QUOTATIONS_FILTER_ALL
      ? { sortBy: 'grandTotal', sortOrder: filters.totalSort }
      : { sortBy: 'createdAt', sortOrder: filters.dateSortOrder };

  return {
    page: filters.page,
    limit: filters.limit,
    ...(filters.contractorId ? { contractorId: filters.contractorId } : {}),
    ...(filters.opportunityId ? { opportunityId: filters.opportunityId } : {}),
    ...(filters.status === QUOTATIONS_FILTER_ALL ? {} : { status: filters.status }),
    ...(filters.commercialStatus === QUOTATIONS_FILTER_ALL
      ? {}
      : { commercialStatus: filters.commercialStatus }),
    ...(filters.currencyCode ? { currencyCode: filters.currencyCode } : {}),
    ...(filters.q.trim() ? { q: filters.q.trim() } : {}),
    ...(filters.createdFrom ? { createdFrom: filters.createdFrom } : {}),
    ...(filters.createdTo ? { createdTo: filters.createdTo } : {}),
    ...(filters.salesOwnerId ? { salesOwnerId: filters.salesOwnerId } : {}),
    ...(filters.opportunityType === QUOTATIONS_FILTER_ALL
      ? {}
      : { type: filters.opportunityType }),
    ...sortParams,
  };
}
