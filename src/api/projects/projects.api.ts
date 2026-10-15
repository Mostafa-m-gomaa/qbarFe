import type { Activity } from '@/api/activities/activities.types';
import { get, getPaginated, patch, post } from '@/api/client/axios-client';
import type { Paginated } from '@/api/client/types';
import type {
  ListOpportunitiesParams,
  Opportunity,
} from '@/api/opportunities/opportunities.types';

import type {
  CloseProjectExecutionResult,
  CloseTenderRequest,
  CreateProjectRequest,
  ListProjectsParams,
  Project,
  ProjectDetail,
  SetProjectStageRequest,
  UpdateProjectRequest,
} from './projects.types';
import type { ListActivitiesParams } from '@/api/activities/activities.types';

const BASE = '/projects';

export function listProjects(params: ListProjectsParams = {}): Promise<Paginated<Project>> {
  return getPaginated<Project>(BASE, { params });
}

export function getProject(id: string): Promise<ProjectDetail> {
  return get<ProjectDetail>(`${BASE}/${id}`);
}

export function createProject(body: CreateProjectRequest): Promise<ProjectDetail> {
  return post<ProjectDetail>(BASE, body);
}

export function updateProject(id: string, body: UpdateProjectRequest): Promise<ProjectDetail> {
  return patch<ProjectDetail>(`${BASE}/${id}`, body);
}

export async function closeProjectExecution(id: string): Promise<CloseProjectExecutionResult> {
  const data = await post<CloseProjectExecutionResult | (ProjectDetail & { warnings?: CloseProjectExecutionResult['warnings'] })>(
    `${BASE}/${id}/close`,
  );
  if (data && typeof data === 'object' && 'project' in data && data.project) {
    return data as CloseProjectExecutionResult;
  }
  const detail = data as ProjectDetail & { warnings?: CloseProjectExecutionResult['warnings'] };
  return { project: detail, warnings: detail.warnings };
}

export function reopenProjectExecution(id: string): Promise<ProjectDetail> {
  return post<ProjectDetail>(`${BASE}/${id}/reopen`);
}

export function setProjectStage(id: string, body: SetProjectStageRequest): Promise<Project> {
  return post<Project>(`${BASE}/${id}/stage`, body);
}

/** Backend transaction: transitions the project to In Hand and the winner opportunity. */
export function closeTender(
  id: string,
  body: CloseTenderRequest,
): Promise<{ project: Project; winner: Opportunity }> {
  return post<{ project: Project; winner: Opportunity }>(`${BASE}/${id}/close-tender`, body);
}

export function archiveProject(id: string): Promise<Project> {
  return post<Project>(`${BASE}/${id}/archive`);
}

/** Nested project opportunities (server-scoped to the project). */
export function listProjectOpportunities(
  id: string,
  params: ListOpportunitiesParams = {},
): Promise<Paginated<Opportunity>> {
  return getPaginated<Opportunity>(`${BASE}/${id}/opportunities`, { params });
}

/** Nested project activities (server-scoped to the project). */
export function listProjectActivities(
  id: string,
  params: ListActivitiesParams = {},
): Promise<Paginated<Activity>> {
  return getPaginated<Activity>(`${BASE}/${id}/activities`, { params });
}
