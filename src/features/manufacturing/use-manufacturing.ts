import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as manufacturingApi from '@/api/manufacturing/manufacturing.api';
import { listProjects } from '@/api/projects/projects.api';
import type {
  CreateClearanceRequest,
  ManufacturingClearanceDto,
  ManufacturingProjectItemDto,
  UpdateClearanceLineRequest,
} from '@/api/manufacturing/manufacturing.types';
import type { Project } from '@/api/projects/projects.types';
import { queryKeys } from '@/constants/query-keys';

const PORTFOLIO_PAGE_SIZE = 100;
const PORTFOLIO_CONCURRENCY = 5;

export interface ManufacturingPortfolioProject {
  project: Project;
  items: ManufacturingProjectItemDto[];
}

export interface ProductionPortfolioProject {
  project: Project;
  clearances: ManufacturingClearanceDto[];
}

async function listAllOpenProjects(): Promise<Project[]> {
  const projects: Project[] = [];
  let page = 1;
  for (;;) {
    const result = await listProjects({
      status: 'active',
      executionState: 'open',
      page,
      limit: PORTFOLIO_PAGE_SIZE,
    });
    projects.push(...result.items);
    if (page * result.limit >= result.total) return projects;
    page += 1;
  }
}

async function mapConcurrent<T, R>(values: T[], mapper: (value: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(values.length);
  let nextIndex = 0;

  async function worker() {
    for (;;) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= values.length) return;
      results[index] = await mapper(values[index]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(PORTFOLIO_CONCURRENCY, values.length) }, () => worker()),
  );
  return results;
}

function invalidateProjectManufacturing(qc: ReturnType<typeof useQueryClient>, projectId: string) {
  void qc.invalidateQueries({ queryKey: queryKeys.manufacturing.projectItems(projectId) });
  void qc.invalidateQueries({ queryKey: queryKeys.manufacturing.clearances(projectId) });
  void qc.invalidateQueries({ queryKey: queryKeys.manufacturing.pendingProject(projectId) });
  void qc.invalidateQueries({ queryKey: queryKeys.manufacturing.summary(projectId) });
  void qc.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
  void qc.invalidateQueries({ queryKey: queryKeys.manufacturing.pendingPortfolio });
  void qc.invalidateQueries({ queryKey: queryKeys.manufacturing.clearancePortfolio });
  void qc.invalidateQueries({ queryKey: queryKeys.manufacturing.productionPortfolio });
  void qc.invalidateQueries({ queryKey: queryKeys.dashboard });
}

export function useManufacturingClearancePortfolio() {
  return useQuery({
    queryKey: queryKeys.manufacturing.clearancePortfolio,
    queryFn: async (): Promise<ManufacturingPortfolioProject[]> => {
      const projects = await listAllOpenProjects();
      const entries = await mapConcurrent(projects, async (project) => ({
        project,
        items: await manufacturingApi.listManufacturingProjectItems(project.id),
      }));
      return entries
        .map((entry) => ({
          ...entry,
          items: entry.items.filter((item) => item.availableClearedQuantityScaled > 0),
        }))
        .filter((entry) => entry.items.length > 0);
    },
  });
}

export function useManufacturingProductionPortfolio() {
  return useQuery({
    queryKey: queryKeys.manufacturing.productionPortfolio,
    queryFn: async (): Promise<ProductionPortfolioProject[]> => {
      const projects = await listAllOpenProjects();
      const entries = await mapConcurrent(projects, async (project) => ({
        project,
        clearances: await manufacturingApi.listManufacturingClearances(project.id),
      }));
      return entries
        .map((entry) => ({
          ...entry,
          clearances: entry.clearances.filter((clearance) => clearance.status !== 'Closed'),
        }))
        .filter((entry) => entry.clearances.length > 0);
    },
  });
}

export function useManufacturingProjectItems(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.manufacturing.projectItems(projectId ?? ''),
    queryFn: () => manufacturingApi.listManufacturingProjectItems(projectId as string),
    enabled: Boolean(projectId),
  });
}

export function useManufacturingClearances(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.manufacturing.clearances(projectId ?? ''),
    queryFn: () => manufacturingApi.listManufacturingClearances(projectId as string),
    enabled: Boolean(projectId),
  });
}

export function usePortfolioManufacturingPending(enabled = true) {
  return useQuery({
    queryKey: queryKeys.manufacturing.pendingPortfolio,
    queryFn: () => manufacturingApi.listPortfolioManufacturingPending(),
    enabled,
  });
}

export function useProjectManufacturingPending(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.manufacturing.pendingProject(projectId ?? ''),
    queryFn: () => manufacturingApi.listProjectManufacturingPending(projectId as string),
    enabled: Boolean(projectId),
  });
}

export function useProjectManufacturingSummary(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.manufacturing.summary(projectId ?? ''),
    queryFn: () => manufacturingApi.getProjectManufacturingSummary(projectId as string),
    enabled: Boolean(projectId),
  });
}

export function useCreateManufacturingClearance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, body }: { projectId: string; body: CreateClearanceRequest }) =>
      manufacturingApi.createManufacturingClearance(projectId, body),
    onSuccess: (_data, { projectId }) => invalidateProjectManufacturing(qc, projectId),
  });
}

export function useUpdateManufacturingClearanceLine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      clearanceId,
      lineId,
      body,
    }: {
      projectId: string;
      clearanceId: string;
      lineId: string;
      body: UpdateClearanceLineRequest;
    }) => manufacturingApi.updateManufacturingClearanceLine(projectId, clearanceId, lineId, body),
    onSuccess: (data) => invalidateProjectManufacturing(qc, data.projectId),
  });
}

export function useMarkClearanceFullyProduced() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, clearanceId }: { projectId: string; clearanceId: string }) =>
      manufacturingApi.markClearanceFullyProduced(projectId, clearanceId),
    onSuccess: (data) => invalidateProjectManufacturing(qc, data.projectId),
  });
}

export function useCloseManufacturingClearance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, clearanceId }: { projectId: string; clearanceId: string }) =>
      manufacturingApi.closeManufacturingClearance(projectId, clearanceId),
    onSuccess: (data) => invalidateProjectManufacturing(qc, data.projectId),
  });
}
