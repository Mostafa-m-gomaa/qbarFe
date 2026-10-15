import { get, getPaginated, patch, post } from '@/api/client/axios-client';
import type { Paginated } from '@/api/client/types';

import type {
  Activity,
  CreateActivityRequest,
  ListActivitiesParams,
  UpdateActivityRequest,
} from './activities.types';

const BASE = '/activities';

export function listActivities(params: ListActivitiesParams = {}): Promise<Paginated<Activity>> {
  return getPaginated<Activity>(BASE, { params });
}

export function getActivity(id: string): Promise<Activity> {
  return get<Activity>(`${BASE}/${id}`);
}

export function createActivity(body: CreateActivityRequest): Promise<Activity> {
  return post<Activity>(BASE, body);
}

export function updateActivity(id: string, body: UpdateActivityRequest): Promise<Activity> {
  return patch<Activity>(`${BASE}/${id}`, body);
}

export function completeActivity(id: string): Promise<Activity> {
  return post<Activity>(`${BASE}/${id}/complete`);
}

export function archiveActivity(id: string): Promise<Activity> {
  return post<Activity>(`${BASE}/${id}/archive`);
}
