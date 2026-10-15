import { get, patch, post } from '@/api/client/axios-client';

import type {
  CreateClearanceRequest,
  ManufacturingClearanceDto,
  ManufacturingProjectItemDto,
  PendingManufacturingLineDto,
  ProjectManufacturingSummaryDto,
  UpdateClearanceLineRequest,
} from './manufacturing.types';

const projectsBase = '/projects';

export function listManufacturingProjectItems(
  projectId: string,
): Promise<ManufacturingProjectItemDto[]> {
  return get<ManufacturingProjectItemDto[]>(`${projectsBase}/${projectId}/items`);
}

export function listManufacturingClearances(
  projectId: string,
): Promise<ManufacturingClearanceDto[]> {
  return get<ManufacturingClearanceDto[]>(
    `${projectsBase}/${projectId}/manufacturing/clearances`,
  );
}

export function createManufacturingClearance(
  projectId: string,
  body: CreateClearanceRequest,
): Promise<ManufacturingClearanceDto> {
  return post<ManufacturingClearanceDto>(
    `${projectsBase}/${projectId}/manufacturing/clearances`,
    body,
  );
}

export function updateManufacturingClearanceLine(
  projectId: string,
  clearanceId: string,
  lineId: string,
  body: UpdateClearanceLineRequest,
): Promise<ManufacturingClearanceDto> {
  return patch<ManufacturingClearanceDto>(
    `${projectsBase}/${projectId}/manufacturing/clearances/${clearanceId}/lines/${lineId}`,
    body,
  );
}

export function markClearanceFullyProduced(
  projectId: string,
  clearanceId: string,
): Promise<ManufacturingClearanceDto> {
  return post<ManufacturingClearanceDto>(
    `${projectsBase}/${projectId}/manufacturing/clearances/${clearanceId}/mark-produced`,
  );
}

export function closeManufacturingClearance(
  projectId: string,
  clearanceId: string,
): Promise<ManufacturingClearanceDto> {
  return post<ManufacturingClearanceDto>(
    `${projectsBase}/${projectId}/manufacturing/clearances/${clearanceId}/close`,
  );
}

export function listPortfolioManufacturingPending(): Promise<PendingManufacturingLineDto[]> {
  return get<PendingManufacturingLineDto[]>(`${projectsBase}/manufacturing/pending`);
}

export function listProjectManufacturingPending(
  projectId: string,
): Promise<PendingManufacturingLineDto[]> {
  return get<PendingManufacturingLineDto[]>(
    `${projectsBase}/${projectId}/manufacturing/pending`,
  );
}

export function getProjectManufacturingSummary(
  projectId: string,
): Promise<ProjectManufacturingSummaryDto> {
  return get<ProjectManufacturingSummaryDto>(`${projectsBase}/${projectId}/summary`);
}
