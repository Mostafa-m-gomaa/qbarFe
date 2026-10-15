import type {
  ListOpportunitiesParams,
  OpportunityLifecycle,
  OpportunityStatus,
  OpportunityType,
} from '@/api/opportunities/opportunities.types';

export const OPPORTUNITIES_FILTER_ALL = 'all' as const;

export type OpportunityTypeFilter = OpportunityType | typeof OPPORTUNITIES_FILTER_ALL;
export type OpportunityStatusFilter = OpportunityStatus | typeof OPPORTUNITIES_FILTER_ALL;
export type OpportunityLifecycleFilter = OpportunityLifecycle | typeof OPPORTUNITIES_FILTER_ALL;

export interface OpportunitiesListFilterInput {
  page: number;
  limit: number;
  q: string;
  contractorId: string | null;
  type: OpportunityTypeFilter;
  status: OpportunityStatusFilter;
  salesOwnerId: string | null;
  lifecycle: OpportunityLifecycleFilter;
}

export function opportunitiesListFiltersToParams(
  filters: OpportunitiesListFilterInput,
): ListOpportunitiesParams {
  return {
    page: filters.page,
    limit: filters.limit,
    ...(filters.q.trim() ? { q: filters.q.trim() } : {}),
    ...(filters.contractorId ? { contractorId: filters.contractorId } : {}),
    ...(filters.type === OPPORTUNITIES_FILTER_ALL ? {} : { type: filters.type }),
    ...(filters.status === OPPORTUNITIES_FILTER_ALL ? {} : { status: filters.status }),
    ...(filters.salesOwnerId ? { salesOwnerId: filters.salesOwnerId } : {}),
    ...(filters.lifecycle === OPPORTUNITIES_FILTER_ALL ? {} : { lifecycle: filters.lifecycle }),
  };
}
