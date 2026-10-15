import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as opportunitiesApi from '@/api/opportunities/opportunities.api';
import type {
  CreateOpportunityRequest,
  ListOpportunitiesParams,
  MarkLostRequest,
  UpdateOpportunityRequest,
} from '@/api/opportunities/opportunities.types';
import { queryKeys } from '@/constants/query-keys';

export function useOpportunities(params: ListOpportunitiesParams = {}, enabled = true) {
  return useQuery({
    queryKey: queryKeys.opportunities.list(params),
    queryFn: () => opportunitiesApi.listOpportunities(params),
    enabled,
  });
}

export function useOpportunity(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.opportunities.detail(id ?? ''),
    queryFn: () => opportunitiesApi.getOpportunity(id as string),
    enabled: Boolean(id),
  });
}

function useOpportunityInvalidation() {
  const qc = useQueryClient();
  return (id: string) => {
    void qc.invalidateQueries({ queryKey: queryKeys.opportunities.detail(id) });
    void qc.invalidateQueries({ queryKey: queryKeys.opportunities.all });
  };
}

export function useCreateOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateOpportunityRequest) => opportunitiesApi.createOpportunity(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.opportunities.all });
    },
  });
}

export function useUpdateOpportunity() {
  const invalidate = useOpportunityInvalidation();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateOpportunityRequest }) =>
      opportunitiesApi.updateOpportunity(id, body),
    onSuccess: (opp) => invalidate(opp.id),
  });
}

export function useCloseOpportunity() {
  const invalidate = useOpportunityInvalidation();
  return useMutation({
    mutationFn: (id: string) => opportunitiesApi.closeOpportunity(id),
    onSuccess: (opp) => invalidate(opp.id),
  });
}

export function useMarkOpportunityWon() {
  const invalidate = useOpportunityInvalidation();
  return useMutation({
    mutationFn: (id: string) => opportunitiesApi.markOpportunityWon(id),
    onSuccess: (opp) => invalidate(opp.id),
  });
}

export function useMarkOpportunityLost() {
  const invalidate = useOpportunityInvalidation();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: MarkLostRequest }) =>
      opportunitiesApi.markOpportunityLost(id, body),
    onSuccess: (opp) => invalidate(opp.id),
  });
}

export function useReopenOpportunity() {
  const invalidate = useOpportunityInvalidation();
  return useMutation({
    mutationFn: (id: string) => opportunitiesApi.reopenOpportunity(id),
    onSuccess: (opp) => invalidate(opp.id),
  });
}

export function useArchiveOpportunity() {
  const invalidate = useOpportunityInvalidation();
  return useMutation({
    mutationFn: (id: string) => opportunitiesApi.archiveOpportunity(id),
    onSuccess: (opp) => invalidate(opp.id),
  });
}
