import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as projectsApi from '@/api/projects/projects.api';
import type {
  CloseTenderRequest,
  CreateProjectRequest,
  ListProjectsParams,
  SetProjectStageRequest,
  UpdateProjectRequest,
} from '@/api/projects/projects.types';
import type { ListActivitiesParams } from '@/api/activities/activities.types';
import type { ListOpportunitiesParams } from '@/api/opportunities/opportunities.types';
import { queryKeys } from '@/constants/query-keys';

export function useProjects(params: ListProjectsParams = {}) {
  return useQuery({
    queryKey: queryKeys.projects.list(params),
    queryFn: () => projectsApi.listProjects(params),
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id ?? ''),
    queryFn: () => projectsApi.getProject(id as string),
    enabled: Boolean(id),
  });
}

export function useProjectOpportunities(id: string | undefined, params: ListOpportunitiesParams = {}) {
  return useQuery({
    queryKey: [...queryKeys.projects.opportunities(id ?? ''), params],
    queryFn: () => projectsApi.listProjectOpportunities(id as string, params),
    enabled: Boolean(id),
  });
}

export function useProjectActivities(id: string | undefined, params: ListActivitiesParams = {}) {
  return useQuery({
    queryKey: [...queryKeys.projects.activities(id ?? ''), params],
    queryFn: () => projectsApi.listProjectActivities(id as string, params),
    enabled: Boolean(id),
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateProjectRequest) => projectsApi.createProject(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects.all }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateProjectRequest }) =>
      projectsApi.updateProject(id, body),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.projects.detail(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useSetProjectStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: SetProjectStageRequest }) =>
      projectsApi.setProjectStage(id, body),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.projects.detail(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useCloseTender() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CloseTenderRequest }) =>
      projectsApi.closeTender(id, body),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.projects.detail(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.projects.all });
      void qc.invalidateQueries({ queryKey: queryKeys.projects.opportunities(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.opportunities.all });
    },
  });
}

export function useArchiveProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.archiveProject(id),
    onSuccess: (_data, id) => {
      void qc.invalidateQueries({ queryKey: queryKeys.projects.detail(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useCloseProjectExecution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.closeProjectExecution(id),
    onSuccess: (_data, id) => {
      void qc.invalidateQueries({ queryKey: queryKeys.projects.detail(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.projects.all });
      void qc.invalidateQueries({ queryKey: queryKeys.manufacturing.summary(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.manufacturing.clearances(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.manufacturing.pendingProject(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.manufacturing.pendingPortfolio });
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useReopenProjectExecution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.reopenProjectExecution(id),
    onSuccess: (_data, id) => {
      void qc.invalidateQueries({ queryKey: queryKeys.projects.detail(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}
