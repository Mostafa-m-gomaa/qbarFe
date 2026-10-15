import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as activitiesApi from '@/api/activities/activities.api';
import type {
  CreateActivityRequest,
  ListActivitiesParams,
  UpdateActivityRequest,
} from '@/api/activities/activities.types';
import { queryKeys } from '@/constants/query-keys';

export function useActivities(params: ListActivitiesParams = {}) {
  return useQuery({
    queryKey: queryKeys.activities.list(params),
    queryFn: () => activitiesApi.listActivities(params),
  });
}

export function useActivity(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.activities.detail(id ?? ''),
    queryFn: () => activitiesApi.getActivity(id as string),
    enabled: Boolean(id),
  });
}

/** Invalidates the activity + lists + its project's activity list + the dashboard. */
function useActivityInvalidation() {
  const qc = useQueryClient();
  return (id: string, projectId?: string) => {
    void qc.invalidateQueries({ queryKey: queryKeys.activities.detail(id) });
    void qc.invalidateQueries({ queryKey: queryKeys.activities.all });
    if (projectId) {
      void qc.invalidateQueries({ queryKey: queryKeys.projects.activities(projectId) });
    }
    void qc.invalidateQueries({ queryKey: queryKeys.dashboard });
  };
}

export function useCreateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateActivityRequest) => activitiesApi.createActivity(body),
    onSuccess: (activity) => {
      void qc.invalidateQueries({ queryKey: queryKeys.activities.all });
      void qc.invalidateQueries({ queryKey: queryKeys.projects.activities(activity.projectId) });
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useUpdateActivity() {
  const invalidate = useActivityInvalidation();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateActivityRequest }) =>
      activitiesApi.updateActivity(id, body),
    onSuccess: (activity) => invalidate(activity.id, activity.projectId),
  });
}

export function useCompleteActivity() {
  const invalidate = useActivityInvalidation();
  return useMutation({
    mutationFn: (id: string) => activitiesApi.completeActivity(id),
    onSuccess: (activity) => invalidate(activity.id, activity.projectId),
  });
}

export function useArchiveActivity() {
  const invalidate = useActivityInvalidation();
  return useMutation({
    mutationFn: (id: string) => activitiesApi.archiveActivity(id),
    onSuccess: (activity) => invalidate(activity.id, activity.projectId),
  });
}
