import { get, getPaginated, patch, post } from '@/api/client/axios-client';
import type { Paginated } from '@/api/client/types';

import type {
  CreateOpportunityRequest,
  ListOpportunitiesParams,
  MarkLostRequest,
  Opportunity,
  UpdateOpportunityRequest,
} from './opportunities.types';

const BASE = '/opportunities';

export function listOpportunities(
  params: ListOpportunitiesParams = {},
): Promise<Paginated<Opportunity>> {
  return getPaginated<Opportunity>(BASE, { params });
}

export function getOpportunity(id: string): Promise<Opportunity> {
  return get<Opportunity>(`${BASE}/${id}`);
}

export function createOpportunity(body: CreateOpportunityRequest): Promise<Opportunity> {
  return post<Opportunity>(BASE, body);
}

export function updateOpportunity(
  id: string,
  body: UpdateOpportunityRequest,
): Promise<Opportunity> {
  return patch<Opportunity>(`${BASE}/${id}`, body);
}

export function markOpportunityWon(id: string): Promise<Opportunity> {
  return post<Opportunity>(`${BASE}/${id}/won`);
}

export function markOpportunityLost(id: string, body: MarkLostRequest): Promise<Opportunity> {
  return post<Opportunity>(`${BASE}/${id}/lost`, body);
}

export function reopenOpportunity(id: string): Promise<Opportunity> {
  return post<Opportunity>(`${BASE}/${id}/reopen`);
}

export function archiveOpportunity(id: string): Promise<Opportunity> {
  return post<Opportunity>(`${BASE}/${id}/archive`);
}

export function closeOpportunity(id: string): Promise<Opportunity> {
  return post<Opportunity>(`${BASE}/${id}/close`);
}
