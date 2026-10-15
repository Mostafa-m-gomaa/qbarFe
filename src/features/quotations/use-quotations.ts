import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { isApiError } from '@/api/client/api-error';
import * as quotationsApi from '@/api/quotations/quotations.api';
import type {
  AddItemRequest,
  AddRunRequest,
  ApplyStdRequest,
  CreateQuotationRequest,
  IssueQuotationRequest,
  ListQuotationsParams,
  MutationRevisionVersion,
  Quotation,
  SetCommercialStatusRequest,
  UpdateItemRequest,
  UpdateQuotationRequest,
  UpdateRunRequest,
} from '@/api/quotations/quotations.types';
import { queryKeys } from '@/constants/query-keys';
import { strings } from '@/constants/strings';
import { getErrorMessage } from '@/lib/get-error-message';

import {
  getCachedDraftVersion,
  injectExpectedRevisionVersion,
} from './quotation-mutation-cas';

export function useQuotations(
  params: ListQuotationsParams = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.quotations.list(params),
    queryFn: () => quotationsApi.listQuotations(params),
    enabled: options?.enabled ?? true,
  });
}

export function useQuotation(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.quotations.detail(id ?? ''),
    queryFn: () => quotationsApi.getQuotation(id as string),
    enabled: Boolean(id),
  });
}

async function refreshQuotation(qc: ReturnType<typeof useQueryClient>, id: string) {
  const fresh = await quotationsApi.getQuotation(id);
  qc.setQueryData(queryKeys.quotations.detail(id), fresh);
  void qc.invalidateQueries({ queryKey: queryKeys.quotations.all });
  return fresh;
}

interface QuotationMutationOptions {
  /** Re-fetch and retry once when the draft version changed (safe for idempotent patches). */
  retryOnConflict?: boolean;
}

function useQuotationMutation<TArgs>(
  id: string,
  mutationFn: (args: TArgs) => Promise<Quotation>,
  options: QuotationMutationOptions = {},
) {
  const { retryOnConflict = true } = options;
  const qc = useQueryClient();

  const runWithCas = (args: TArgs) => {
    const version = getCachedDraftVersion(qc, id);
    const patched = injectExpectedRevisionVersion(args, version);
    return mutationFn(patched);
  };

  return useMutation({
    scope: { id: `quotation:${id}` },
    mutationFn: async (args: TArgs) => {
      try {
        return await runWithCas(args);
      } catch (error) {
        const isConflict =
          isApiError(error) && (error.httpStatus === 409 || error.code === 'CONFLICT');
        if (!retryOnConflict || !isConflict) {
          throw error;
        }
        await refreshQuotation(qc, id);
        return runWithCas(args);
      }
    },
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.quotations.detail(id), data);
      void qc.invalidateQueries({ queryKey: queryKeys.quotations.all });
    },
    onError: async (error: unknown) => {
      if (isApiError(error) && (error.httpStatus === 409 || error.code === 'CONFLICT')) {
        await refreshQuotation(qc, id);
        toast.warning(strings.quotations.conflictRefresh);
        return;
      }
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCreateQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateQuotationRequest) => quotationsApi.createQuotation(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.quotations.all });
    },
  });
}

export function useUpdateQuotation(id: string) {
  return useQuotationMutation(id, (body: UpdateQuotationRequest) =>
    quotationsApi.updateQuotation(id, body),
  );
}

export function useIssueQuotation(id: string) {
  return useQuotationMutation(
    id,
    (body: IssueQuotationRequest) => quotationsApi.issueQuotation(id, body),
    { retryOnConflict: false },
  );
}

export function useReviseQuotation(id: string) {
  return useQuotationMutation(id, () => quotationsApi.reviseQuotation(id), {
    retryOnConflict: false,
  });
}

export function useArchiveQuotation(id: string) {
  return useQuotationMutation(id, () => quotationsApi.archiveQuotation(id), {
    retryOnConflict: false,
  });
}

export function useSetCommercialStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    scope: { id: `quotation:${id}` },
    mutationFn: (body: SetCommercialStatusRequest) =>
      quotationsApi.setQuotationCommercialStatus(id, body),
    onSuccess: async (quotation) => {
      qc.setQueryData(queryKeys.quotations.detail(id), quotation);
      void qc.invalidateQueries({ queryKey: queryKeys.quotations.all });
      void qc.invalidateQueries({ queryKey: queryKeys.purchasedOrders.all });
    },
  });
}

/** Alias for POST /commercial/won — prefer `useSetCommercialStatus` with `{ status: 'Won' }`. */
export function useMarkCommercialWon(id: string) {
  return useSetCommercialStatus(id);
}

export function useBelowCostOverride(id: string) {
  return useQuotationMutation(id, (body: MutationRevisionVersion) =>
    quotationsApi.belowCostOverride(id, body),
  );
}

export function useAddRun(id: string) {
  return useQuotationMutation(id, (body: AddRunRequest) => quotationsApi.addRun(id, body), {
    retryOnConflict: false,
  });
}

export function useUpdateRun(id: string) {
  return useQuotationMutation(id, ({ runId, body }: { runId: string; body: UpdateRunRequest }) =>
    quotationsApi.updateRun(id, runId, body),
  );
}

export function useDeleteRun(id: string) {
  return useQuotationMutation(
    id,
    ({ runId, body }: { runId: string; body: MutationRevisionVersion }) =>
      quotationsApi.deleteRun(id, runId, body),
    { retryOnConflict: false },
  );
}

export function useCompleteRun(id: string) {
  return useQuotationMutation(id, ({ runId, body }: { runId: string; body: MutationRevisionVersion }) =>
    quotationsApi.completeRun(id, runId, body),
  );
}

export function useReopenRun(id: string) {
  return useQuotationMutation(id, ({ runId, body }: { runId: string; body: MutationRevisionVersion }) =>
    quotationsApi.reopenRun(id, runId, body),
  );
}

export function useAddItem(id: string) {
  return useQuotationMutation(
    id,
    ({ runId, body }: { runId: string; body: AddItemRequest }) =>
      quotationsApi.addItem(id, runId, body),
    { retryOnConflict: false },
  );
}

export function useUpdateItem(id: string) {
  return useQuotationMutation(
    id,
    ({ runId, itemId, body }: { runId: string; itemId: string; body: UpdateItemRequest }) =>
      quotationsApi.updateItem(id, runId, itemId, body),
  );
}

export function useDeleteItem(id: string) {
  return useQuotationMutation(
    id,
    ({
      runId,
      itemId,
      body,
    }: {
      runId: string;
      itemId: string;
      body: MutationRevisionVersion;
    }) => quotationsApi.deleteItem(id, runId, itemId, body),
    { retryOnConflict: false },
  );
}

export function useApplyStdPrice(id: string) {
  return useQuotationMutation(id, ({ runId, body }: { runId: string; body: ApplyStdRequest }) =>
    quotationsApi.applyStdPrice(id, runId, body),
  );
}

export function useApplyPerAmp(id: string) {
  return useQuotationMutation(id, ({ runId, body }: { runId: string; body: MutationRevisionVersion }) =>
    quotationsApi.applyPerAmpPrice(id, runId, body),
  );
}
