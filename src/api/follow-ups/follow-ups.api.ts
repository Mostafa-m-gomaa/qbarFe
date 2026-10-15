import { get, getPaginated, patch, post } from '@/api/client/axios-client';
import type { Paginated } from '@/api/client/types';

import type {
  CancelFollowUpRequest,
  CompleteFollowUpRequest,
  CreateFollowUpRequest,
  FollowUp,
  ListFollowUpsParams,
  UpdateFollowUpRequest,
} from './follow-ups.types';

const BASE = '/follow-ups';

export function listFollowUps(params: ListFollowUpsParams = {}): Promise<Paginated<FollowUp>> {
  return getPaginated<FollowUp>(BASE, { params });
}

export function getFollowUp(id: string): Promise<FollowUp> {
  return get<FollowUp>(`${BASE}/${id}`);
}

export function createFollowUp(body: CreateFollowUpRequest): Promise<FollowUp> {
  return post<FollowUp>(BASE, body);
}

export function updateFollowUp(id: string, body: UpdateFollowUpRequest): Promise<FollowUp> {
  return patch<FollowUp>(`${BASE}/${id}`, body);
}

export function completeFollowUp(id: string, body: CompleteFollowUpRequest): Promise<FollowUp> {
  return post<FollowUp>(`${BASE}/${id}/complete`, body);
}

export function cancelFollowUp(id: string, body: CancelFollowUpRequest): Promise<FollowUp> {
  return post<FollowUp>(`${BASE}/${id}/cancel`, body);
}
