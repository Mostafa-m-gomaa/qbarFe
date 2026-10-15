/** Project DTOs — transcribed from the backend project response contract (7.12). */

import type {
  ProjectDepartment,
  ProjectExecutionState,
  ProjectItemConductor,
  ProjectItemPlating,
  ProjectItemPoles,
  ProjectItemRating,
  ProjectItemType,
  ProjectOperationalStatus,
} from './project-enums';

export type ProjectType = 'Tender' | 'In Hand';
export type ProjectStage = 'Lead' | 'Quotation' | 'Negotiation' | 'PO' | 'Project';
export type ProjectStatus = 'active' | 'archived';

export type ProjectItemLifecycle = 'active' | 'archived';

/** Resolved user on project audit fields (list + detail). */
export interface ProjectActorSummary {
  id: string;
  name: string;
  email: string;
}

export interface ProjectMilestones {
  drawingSubmittedOn: string | null;
  drawingApprovedOn: string | null;
  productionRequiredOn: string | null;
  deliveryTargetOn: string | null;
}

export interface ProjectPurchaseOrderRef {
  id: string;
  customerPORef: string;
  date: string;
}

export interface ProjectItem {
  id: string;
  projectId: string;
  lineNo: number;
  itemType: ProjectItemType;
  rating: ProjectItemRating;
  conductor: ProjectItemConductor;
  plating: ProjectItemPlating;
  poles: ProjectItemPoles;
  meters: string;
  meterPrice: string;
  quantity: string;
  unitPrice: string;
  unitCode: string;
  currencyCode: string;
  value: string;
  revision: number;
  lifecycle: ProjectItemLifecycle;
  allocatedClearedQuantityScaled: number;
  createdAt: string;
  updatedAt: string;
}

/** List row — no items (lightweight table). */
export interface Project {
  id: string;
  number: string | null;
  name: string;
  type: ProjectType;
  stage: ProjectStage;
  country: string;
  city: string;
  site: string;
  consultantId: string | null;
  contractorId: string | null;
  salesPersonIds: string[];
  executionOwnerId: string | null;
  department: ProjectDepartment | null;
  customer: string;
  poContractRef: string | null;
  operationalStatus: ProjectOperationalStatus | null;
  nextAction: string | null;
  actionOwnerId: string | null;
  actionDueOn: string | null;
  poDate: string | null;
  manufacturingClearanceOn: string | null;
  paymentDueOn: string | null;
  milestones: ProjectMilestones;
  executionState: ProjectExecutionState;
  closedOn: string | null;
  expectedClosingDate: string | null;
  notes: string;
  tenderHistory: boolean;
  tenderClosed: boolean;
  status: ProjectStatus;
  createdBy: string;
  updatedBy: string;
  createdByUser: ProjectActorSummary | null;
  updatedByUser: ProjectActorSummary | null;
  createdAt: string;
  updatedAt: string;
}

/** Detail / create / update — includes active quantity lines and PO context. */
export interface ProjectDetail extends Project {
  items: ProjectItem[];
  purchaseOrders: ProjectPurchaseOrderRef[];
}

/** Writable line on create/update (full sync when `items` is sent). */
export interface ProjectItemWrite {
  id?: string;
  itemType: ProjectItemType;
  rating: ProjectItemRating;
  conductor: ProjectItemConductor;
  plating: ProjectItemPlating;
  poles: ProjectItemPoles;
  meters: string;
  meterPrice: string;
}

/** Shared form header fields (flat milestone dates on write). */
interface ProjectFormWriteFields {
  country?: string;
  city?: string;
  site?: string;
  consultantId?: string | null;
  contractorId?: string | null;
  executionOwnerId?: string | null;
  department?: ProjectDepartment | null;
  customer?: string | null;
  poContractRef?: string | null;
  operationalStatus?: ProjectOperationalStatus | null;
  nextAction?: string | null;
  actionOwnerId?: string | null;
  actionDueOn?: string | null;
  poDate?: string | null;
  drawingSubmittedOn?: string | null;
  drawingApprovedOn?: string | null;
  manufacturingClearanceOn?: string | null;
  productionRequiredOn?: string | null;
  deliveryTargetOn?: string | null;
  paymentDueOn?: string | null;
  expectedClosingDate?: string | null;
  notes?: string;
  items?: ProjectItemWrite[];
}

export interface CreateProjectRequest extends ProjectFormWriteFields {
  name: string;
  consultantId?: string;
  type?: ProjectType;
  salesPersonIds?: string[];
}

/** Partial update — `type` is intentionally omitted (backend never changes it here). */
export interface UpdateProjectRequest extends ProjectFormWriteFields {
  name?: string;
  salesPersonIds?: string[];
}

export interface ListProjectsParams {
  page?: number;
  limit?: number;
  status?: ProjectStatus;
  type?: ProjectType;
  stage?: ProjectStage;
  consultantId?: string;
  country?: string;
  salesPersonId?: string;
  q?: string;
  department?: ProjectDepartment;
  executionState?: ProjectExecutionState;
  createdFrom?: string;
  createdTo?: string;
}

export interface SetProjectStageRequest {
  stage: ProjectStage;
}

export interface CloseTenderRequest {
  winnerOpportunityId: string;
}

export interface ProjectCloseWarning {
  code: string;
  quantityScaled?: number;
}

/** Close execution may return warnings (e.g. pending production) alongside the project. */
export interface CloseProjectExecutionResult {
  project: ProjectDetail;
  warnings?: ProjectCloseWarning[];
}
