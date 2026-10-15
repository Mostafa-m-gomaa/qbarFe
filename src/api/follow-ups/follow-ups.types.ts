import type { ActorSummary } from '@/api/common/actor.types';
import type { OpportunityStatus, OpportunityType } from '@/api/opportunities/opportunities.types';
import type { QuotationStatus } from '@/api/quotations/quotations.types';

/** Same six types as project Activities (V23.2). */
export type FollowUpType =
  | 'Call'
  | 'Email'
  | 'Visit'
  | 'Site Visit'
  | 'Consultant Visit'
  | 'Procurement Visit';

export type FollowUpStatus = 'open' | 'completed' | 'cancelled';

/** Server-computed; not stored. */
export type FollowUpDueState = 'overdue' | 'today' | 'upcoming' | 'none';

export type FollowUpDueFilter = 'overdue' | 'today' | 'next7days';

export interface FollowUpOpportunityView {
  id: string;
  name: string;
  description: string | null;
  type: OpportunityType;
  status: OpportunityStatus;
  salesOwnerId: string | null;
}

export interface FollowUpQuotationContractorView {
  id: string;
  company: string;
}

export interface FollowUpQuotationView {
  id: string;
  ref: string;
  status: QuotationStatus;
  contractorId?: string;
  contractor?: FollowUpQuotationContractorView | null;
}

export interface FollowUp {
  id: string;
  opportunityId: string;
  quotationId: string | null;
  title: string;
  type: FollowUpType;
  assignedToId: string;
  dueAt: string;
  dueState: FollowUpDueState;
  status: FollowUpStatus;
  notes: string;
  outcome: string | null;
  completedAt: string | null;
  revision: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  opportunity: FollowUpOpportunityView | null;
  quotation: FollowUpQuotationView | null;
  assignedToUser: ActorSummary | null;
  createdByUser: ActorSummary | null;
}

export interface CreateFollowUpRequest {
  opportunityId: string;
  quotationId?: string | null;
  title: string;
  type: FollowUpType;
  assignedToId?: string;
  dueAt: string;
  notes?: string;
}

export interface UpdateFollowUpRequest {
  expectedRevision: number;
  title?: string;
  type?: FollowUpType;
  assignedToId?: string;
  dueAt?: string;
  notes?: string;
  quotationId?: string | null;
}

export interface CompleteFollowUpRequest {
  expectedRevision: number;
  outcome: string;
  notes?: string;
}

export interface CancelFollowUpRequest {
  expectedRevision: number;
}

export interface ListFollowUpsParams {
  page?: number;
  limit?: number;
  status?: FollowUpStatus;
  assignedToId?: string;
  opportunityId?: string;
  quotationId?: string;
  type?: FollowUpType;
  due?: FollowUpDueFilter;
  q?: string;
  sortBy?: 'dueAt' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}
