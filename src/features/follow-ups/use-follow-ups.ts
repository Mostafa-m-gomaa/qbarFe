import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { isApiError } from '@/api/client/api-error';
import * as followUpsApi from '@/api/follow-ups/follow-ups.api';
import type {
  CancelFollowUpRequest,
  CompleteFollowUpRequest,
  CreateFollowUpRequest,
  FollowUp,
  ListFollowUpsParams,
  UpdateFollowUpRequest,
} from '@/api/follow-ups/follow-ups.types';
import { queryKeys } from '@/constants/query-keys';
import { strings } from '@/constants/strings';
import { getErrorMessage } from '@/lib/get-error-message';

import { getCachedFollowUpRevision } from './follow-up-mutation-cas';

export function useFollowUps(params: ListFollowUpsParams = {}) {
  return useQuery({
    queryKey: queryKeys.followUps.list(params),
    queryFn: () => followUpsApi.listFollowUps(params),
  });
}

export function useFollowUp(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.followUps.detail(id ?? ''),
    queryFn: () => followUpsApi.getFollowUp(id as string),
    enabled: Boolean(id),
  });
}

async function refreshFollowUp(qc: ReturnType<typeof useQueryClient>, id: string) {
  const fresh = await followUpsApi.getFollowUp(id);
  qc.setQueryData(queryKeys.followUps.detail(id), fresh);
  void qc.invalidateQueries({ queryKey: queryKeys.followUps.all });
  return fresh;
}

function invalidateFollowUpScope(qc: ReturnType<typeof useQueryClient>, followUp: FollowUp) {
  void qc.invalidateQueries({ queryKey: queryKeys.followUps.detail(followUp.id) });
  void qc.invalidateQueries({ queryKey: queryKeys.followUps.all });
  void qc.invalidateQueries({ queryKey: queryKeys.dashboard });
}

function resolveRevision(
  qc: ReturnType<typeof useQueryClient>,
  id: string,
  fromBody: number,
): number {
  const cached = getCachedFollowUpRevision(qc, id);
  return cached > 0 ? cached : fromBody;
}

interface FollowUpMutationOptions {
  retryOnConflict?: boolean;
}

function useFollowUpIdMutation<TBody extends { expectedRevision: number }>(
  mutationFn: (id: string, body: TBody) => Promise<FollowUp>,
  options: FollowUpMutationOptions = {},
) {
  const { retryOnConflict = true } = options;
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: TBody }) => {
      const attempt = async () => {
        const revision = resolveRevision(qc, id, body.expectedRevision);
        const patched = { ...body, expectedRevision: revision } as TBody;
        return mutationFn(id, patched);
      };
      try {
        return await attempt();
      } catch (error) {
        const isConflict =
          isApiError(error) && (error.httpStatus === 409 || error.code === 'CONFLICT');
        if (!retryOnConflict || !isConflict) {
          throw error;
        }
        await refreshFollowUp(qc, id);
        return attempt();
      }
    },
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.followUps.detail(data.id), data);
      invalidateFollowUpScope(qc, data);
    },
    onError: async (error: unknown, { id }) => {
      if (isApiError(error) && (error.httpStatus === 409 || error.code === 'CONFLICT')) {
        await refreshFollowUp(qc, id);
        toast.warning(strings.followUps.conflictRefresh);
        return;
      }
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCreateFollowUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateFollowUpRequest) => followUpsApi.createFollowUp(body),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.followUps.detail(data.id), data);
      invalidateFollowUpScope(qc, data);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateFollowUp() {
  return useFollowUpIdMutation((id, body: UpdateFollowUpRequest) =>
    followUpsApi.updateFollowUp(id, body),
  );
}

export function useCompleteFollowUp() {
  return useFollowUpIdMutation((id, body: CompleteFollowUpRequest) =>
    followUpsApi.completeFollowUp(id, body),
  );
}

export function useCancelFollowUp() {
  return useFollowUpIdMutation(
    (id, body: CancelFollowUpRequest) => followUpsApi.cancelFollowUp(id, body),
    { retryOnConflict: false },
  );
}
