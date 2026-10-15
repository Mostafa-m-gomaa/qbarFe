import { del, get, getPaginated, patch, post } from '@/api/client/axios-client';
import type { Paginated } from '@/api/client/types';

import type {
  AddItemRequest,
  AddRunRequest,
  ApplyStdRequest,
  CreateQuotationRequest,
  IssueQuotationRequest,
  ListQuotationsParams,
  MutationRevisionVersion,
  Quotation,
  QuotationRevision,
  SetCommercialStatusRequest,
  UpdateItemRequest,
  UpdateQuotationRequest,
  UpdateRunRequest,
} from './quotations.types';
import { normalizeQuotation, normalizeQuotations } from './quotations.normalize';

const BASE = '/quotations';

async function normalizeQuotationResponse(data: Quotation): Promise<Quotation> {
  return normalizeQuotation(data);
}

export async function listQuotations(params: ListQuotationsParams = {}): Promise<Paginated<Quotation>> {
  const page = await getPaginated<Quotation>(BASE, { params });
  return { ...page, items: normalizeQuotations(page.items) };
}

export async function getQuotation(id: string): Promise<Quotation> {
  return normalizeQuotationResponse(await get<Quotation>(`${BASE}/${id}`));
}

export async function createQuotation(body: CreateQuotationRequest): Promise<Quotation> {
  return normalizeQuotationResponse(await post<Quotation>(BASE, body));
}

export async function updateQuotation(id: string, body: UpdateQuotationRequest): Promise<Quotation> {
  return normalizeQuotationResponse(await patch<Quotation>(`${BASE}/${id}`, body));
}

export async function issueQuotation(id: string, body: IssueQuotationRequest): Promise<Quotation> {
  return normalizeQuotationResponse(await post<Quotation>(`${BASE}/${id}/issue`, body));
}

export async function reviseQuotation(id: string): Promise<Quotation> {
  return normalizeQuotationResponse(await post<Quotation>(`${BASE}/${id}/revise`));
}

export async function archiveQuotation(id: string): Promise<Quotation> {
  return normalizeQuotationResponse(await post<Quotation>(`${BASE}/${id}/archive`));
}

export async function markQuotationCommercialWon(id: string): Promise<Quotation> {
  return normalizeQuotationResponse(await post<Quotation>(`${BASE}/${id}/commercial/won`));
}

export async function setQuotationCommercialStatus(
  id: string,
  body: SetCommercialStatusRequest,
): Promise<Quotation> {
  return normalizeQuotationResponse(
    await post<Quotation>(`${BASE}/${id}/commercial/status`, body),
  );
}

export async function belowCostOverride(
  id: string,
  body: MutationRevisionVersion,
): Promise<Quotation> {
  return normalizeQuotationResponse(await post<Quotation>(`${BASE}/${id}/below-cost-override`, body));
}

export function listQuotationRevisions(id: string): Promise<QuotationRevision[]> {
  return get<QuotationRevision[]>(`${BASE}/${id}/revisions`);
}

export function getQuotationRevision(id: string, rev: number): Promise<QuotationRevision> {
  return get<QuotationRevision>(`${BASE}/${id}/revisions/${rev}`);
}

export async function addRun(id: string, body: AddRunRequest): Promise<Quotation> {
  return normalizeQuotationResponse(await post<Quotation>(`${BASE}/${id}/runs`, body));
}

export async function updateRun(
  id: string,
  runId: string,
  body: UpdateRunRequest,
): Promise<Quotation> {
  return normalizeQuotationResponse(await patch<Quotation>(`${BASE}/${id}/runs/${runId}`, body));
}

export async function deleteRun(
  id: string,
  runId: string,
  body: MutationRevisionVersion,
): Promise<Quotation> {
  return normalizeQuotationResponse(
    await del<Quotation>(`${BASE}/${id}/runs/${runId}`, { data: body }),
  );
}

export async function completeRun(
  id: string,
  runId: string,
  body: MutationRevisionVersion,
): Promise<Quotation> {
  return normalizeQuotationResponse(
    await post<Quotation>(`${BASE}/${id}/runs/${runId}/complete`, body),
  );
}

export async function reopenRun(
  id: string,
  runId: string,
  body: MutationRevisionVersion,
): Promise<Quotation> {
  return normalizeQuotationResponse(
    await post<Quotation>(`${BASE}/${id}/runs/${runId}/reopen`, body),
  );
}

export async function addItem(
  id: string,
  runId: string,
  body: AddItemRequest,
): Promise<Quotation> {
  return normalizeQuotationResponse(
    await post<Quotation>(`${BASE}/${id}/runs/${runId}/items`, body),
  );
}

export async function updateItem(
  id: string,
  runId: string,
  itemId: string,
  body: UpdateItemRequest,
): Promise<Quotation> {
  return normalizeQuotationResponse(
    await patch<Quotation>(`${BASE}/${id}/runs/${runId}/items/${itemId}`, body),
  );
}

export async function deleteItem(
  id: string,
  runId: string,
  itemId: string,
  body: MutationRevisionVersion,
): Promise<Quotation> {
  return normalizeQuotationResponse(
    await del<Quotation>(`${BASE}/${id}/runs/${runId}/items/${itemId}`, { data: body }),
  );
}

export async function applyStdPrice(
  id: string,
  runId: string,
  body: ApplyStdRequest,
): Promise<Quotation> {
  return normalizeQuotationResponse(
    await post<Quotation>(`${BASE}/${id}/runs/${runId}/apply-std`, body),
  );
}

export async function applyPerAmpPrice(
  id: string,
  runId: string,
  body: MutationRevisionVersion,
): Promise<Quotation> {
  return normalizeQuotationResponse(
    await post<Quotation>(`${BASE}/${id}/runs/${runId}/apply-per-amp`, body),
  );
}
