import type { ActorSummary } from '@/api/common/actor.types';

/** Opportunity DTOs — pre-project commercial contract (no projectId). */

export type OpportunityType = 'Tender' | 'In Hand';
export type OpportunityStatus = 'Open' | 'Tender Closed' | 'Won' | 'Lost';
export type OpportunityLifecycle = 'active' | 'archived';

export const LOSS_REASONS = [
  'Price / Commercial',
  'Competitor Selected',
  'Technical Requirement',
  'Delivery Period',
  'Payment Terms',
  'Project Cancelled / On Hold',
  'Client / Contractor Decision',
  'No Response',
  'Other',
] as const;

export type LossReason = (typeof LOSS_REASONS)[number];

export interface Opportunity {
  id: string;
  name: string;
  description: string | null;
  type: OpportunityType;
  status: OpportunityStatus;
  salesOwnerId: string | null;
  salesOwnerUser: ActorSummary | null;
  lossReason: LossReason | null;
  lossDetails: string | null;
  resultDate: string | null;
  lifecycle: OpportunityLifecycle;
  createdBy: string;
  updatedBy: string;
  createdByUser: ActorSummary | null;
  updatedByUser: ActorSummary | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOpportunityRequest {
  name: string;
  description?: string;
  type: OpportunityType;
  salesOwnerId?: string;
}

export interface UpdateOpportunityRequest {
  name?: string;
  description?: string | null;
  salesOwnerId?: string;
}

export interface MarkLostRequest {
  lossReason: LossReason;
  lossDetails?: string;
}

export interface ListOpportunitiesParams {
  page?: number;
  limit?: number;
  q?: string;
  contractorId?: string;
  type?: OpportunityType;
  status?: OpportunityStatus;
  salesOwnerId?: string;
  lifecycle?: OpportunityLifecycle;
}
