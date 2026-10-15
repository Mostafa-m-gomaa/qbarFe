import type { ActorSummary } from '@/api/common/actor.types';
import type { OpportunityStatus, OpportunityType } from '@/api/opportunities/opportunities.types';

export type QuotationStatus = 'Draft' | 'Issued' | 'Revision Draft';
export type QuotationCommercialStatus =
  | 'Active'
  | 'Won'
  | 'Lost'
  | 'Cancelled'
  | 'ConvertedToCables'
  | 'OnHold'
  | 'ContractorChanged';

export interface CommercialDetailsLost {
  competitorName: string;
  reasonLost: string;
  details?: string | null;
}

export interface CommercialDetailsCancelled {
  cancellationReason: string;
}

export interface CommercialDetailsConvertedToCables {
  note?: string | null;
}

export interface CommercialDetailsOnHold {
  holdReason?: string | null;
}

export interface CommercialDetailsContractorChanged {
  previousContractorId: string;
  newContractorId: string;
  reasonNote: string;
}

export type QuotationCommercialDetails =
  | CommercialDetailsLost
  | CommercialDetailsCancelled
  | CommercialDetailsConvertedToCables
  | CommercialDetailsOnHold
  | CommercialDetailsContractorChanged;

export type SetCommercialStatusRequest =
  | { status: 'Active' }
  | { status: 'Won' }
  | {
      status: 'Lost';
      competitorName: string;
      reasonLost: string;
      details?: string;
    }
  | { status: 'Cancelled'; cancellationReason: string }
  | { status: 'ConvertedToCables'; note?: string }
  | { status: 'OnHold'; holdReason?: string }
  | {
      status: 'ContractorChanged';
      newContractorId: string;
      reasonNote: string;
    };
export type RevisionStatus = 'Draft' | 'Issued';
export type QuotationLifecycle = 'active' | 'archived';
export type DiscountType = 'none' | 'percent' | 'lump';
export type InstallationCostMode = 'percent' | 'manual';
export type RunBasis = 'Detailed Pricing' | 'All-Inclusive LM';
export type ItemKind = 'accessory' | 'tap_off' | 'end_feed' | 'custom';

export interface ProductSnapshot {
  productId: string;
  code: string;
  name: string;
  unitCode: string;
  categoryName: string;
}

export interface AdditionalCost {
  description: string;
  amountMinor: number;
}

export interface BelowCostOverride {
  signature: string;
  approvedBy: string;
  approvedAt: string;
}

/** Selling totals always present; cost fields only with quotations.view_cost. */
export interface RevisionTotalsSelling {
  supplyAmountMinor: number;
  installationAmountMinor: number;
  discountAmountMinor: number;
  sellExVatAmountMinor: number;
  vatAmountMinor: number;
  grandAmountMinor: number;
}

export interface RevisionTotalsCost extends RevisionTotalsSelling {
  materialCostAmountMinor: number;
  installationCostAmountMinor: number;
  additionalCostAmountMinor: number;
  operationalCostAmountMinor: number;
  totalProjectCostExVatAmountMinor: number;
  profitAmountMinor: number;
  marginPercentScaled: number;
  marginPercent: string;
}

export type RevisionTotals = RevisionTotalsSelling | RevisionTotalsCost;

export interface StraightElementLine {
  id: string;
  itemKey: string;
  description: string;
  unitCode: string;
  quantity: string;
  quantityScaled: number;
  unitSellAmountMinor: number;
  sellAmountMinor: number;
  currencyCode: string;
  product: ProductSnapshot | null;
  discountBaseUnitSellAmountMinor: number | null;
  unitCostAmountMinor?: number;
  costAmountMinor?: number;
  costPending?: boolean;
}

export interface QuotationItem {
  id: string;
  kind: ItemKind;
  itemKey: string;
  description: string;
  unitCode: string;
  quantity: string;
  quantityScaled: number;
  unitSellAmountMinor: number;
  sellAmountMinor: number;
  currencyCode: string;
  product: ProductSnapshot | null;
  tapRating: string | null;
  mccb: string | null;
  poles: string | null;
  discountBaseUnitSellAmountMinor: number | null;
  unitCostAmountMinor?: number;
  costAmountMinor?: number;
  costPending?: boolean;
}

export interface BusbarRun {
  id: string;
  name: string;
  amp: number;
  conductor: string;
  poles: string;
  ip: string;
  treatment: string;
  basis: RunBasis;
  pricingProfile: string;
  complete: boolean;
  straightElement: StraightElementLine;
  items: QuotationItem[];
}

export interface QuotationRevision {
  rev: number;
  version: number;
  status: RevisionStatus;
  date: string;
  fxRateToBase: string;
  currencyCode: string;
  currencyMinorUnits: number;
  validity: string;
  paymentTerms: string;
  deliveryPeriod: string;
  vatOn: boolean;
  vatRate: string;
  vatRateScaled: number;
  discountType: DiscountType;
  discountValueScaled: number;
  percentDiscountAppliedToRates: boolean;
  installationIncluded: boolean;
  installationPercent: string;
  sellingPricePerAmpBase: number | null;
  notes: string[];
  createdBy: string;
  updatedBy: string;
  issuedAt: string | null;
  issuedBy: string | null;
  issuedByUser: ActorSummary | null;
  runs: BusbarRun[];
  totals: RevisionTotals;
  installationCostMode?: InstallationCostMode;
  installationCostPercentScaled?: number;
  installationCostAmountMinor?: number;
  additionalCosts?: AdditionalCost[];
  costPerAmpBase?: number | null;
  belowCostOverride?: BelowCostOverride | null;
  isBelowCost?: boolean;
}

export interface QuotationContractorView {
  id: string;
  company: string;
}

export interface QuotationOpportunityView {
  id: string;
  name: string;
  description: string | null;
  type: OpportunityType;
  status: OpportunityStatus;
}

export interface Quotation {
  id: string;
  ref: string;
  contractorId: string;
  opportunityId: string;
  salesOwnerId: string;
  /** List/detail convenience fields from current revision. */
  quotationDate?: string;
  revisionNumber?: number;
  revisionStatus?: RevisionStatus;
  valueMinor?: number;
  currencyCode: string;
  status: QuotationStatus;
  commercialStatus: QuotationCommercialStatus;
  commercialDetails?: QuotationCommercialDetails | null;
  commercialStatusAt?: string | null;
  commercialStatusBy?: string | null;
  lifecycle: QuotationLifecycle;
  contractor: QuotationContractorView | null;
  opportunity: QuotationOpportunityView | null;
  salesOwnerUser: ActorSummary | null;
  currentRevision: QuotationRevision;
  revisions: QuotationRevision[];
  createdBy: string;
  updatedBy: string;
  createdByUser: ActorSummary | null;
  updatedByUser: ActorSummary | null;
  archivedAt: string | null;
  archivedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListQuotationsParams {
  page?: number;
  limit?: number;
  contractorId?: string;
  opportunityId?: string;
  /** Opportunity type (Tender / In Hand) — requires backend support on GET /quotations. */
  type?: OpportunityType;
  /** Quotation sales owner — requires backend support on GET /quotations. */
  salesOwnerId?: string;
  status?: QuotationStatus;
  commercialStatus?: QuotationCommercialStatus;
  currencyCode?: string;
  q?: string;
  createdFrom?: string;
  createdTo?: string;
  sortBy?: 'createdAt' | 'grandTotal';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateQuotationRequest {
  contractorId: string;
  opportunityId: string;
  salesOwnerId?: string;
  currencyCode: string;
  fxRateToBase?: string;
}

export interface UpdateQuotationRequest {
  expectedRevisionVersion: number;
  validity?: string;
  paymentTerms?: string;
  deliveryPeriod?: string;
  vatOn?: boolean;
  vatRate?: string;
  discountType?: DiscountType;
  discountPercent?: string;
  discountAmountMinor?: number;
  installationIncluded?: boolean;
  installationPercent?: string;
  installationCostMode?: InstallationCostMode;
  installationCostPercent?: string;
  installationCostAmountMinor?: number;
  additionalCosts?: AdditionalCost[];
  sellingPricePerAmpBase?: number;
  costPerAmpBase?: number;
  notes?: string[];
  currencyCode?: string;
  fxRateToBase?: string;
}

export interface IssueQuotationRequest {
  expectedRevisionVersion: number;
  acknowledgePendingCost?: boolean;
}

export interface MutationRevisionVersion {
  expectedRevisionVersion: number;
}

export interface AddRunRequest extends MutationRevisionVersion {
  name?: string;
}

export interface UpdateRunRequest extends MutationRevisionVersion {
  name?: string;
  amp?: number;
  conductor?: string;
  poles?: string;
  ip?: string;
  treatment?: string;
  basis?: RunBasis;
  pricingProfile?: string;
  straightQuantity?: string;
}

export interface AddItemRequest extends MutationRevisionVersion {
  kind: ItemKind;
  itemKey?: string;
  description?: string;
  unitCode?: string;
  quantity: string;
  unitSellAmountMinor?: number;
  unitCostAmountMinor?: number;
  costPending?: boolean;
  productId?: string;
  tapRating?: string;
  mccb?: string;
  poles?: string;
}

export interface UpdateItemRequest extends MutationRevisionVersion {
  description?: string;
  unitCode?: string;
  quantity?: string;
  unitSellAmountMinor?: number;
  unitCostAmountMinor?: number;
  costPending?: boolean;
  productId?: string | null;
  tapRating?: string | null;
  mccb?: string | null;
  poles?: string | null;
  itemKey?: string;
}

export interface ApplyStdRequest extends MutationRevisionVersion {
  itemId?: string;
  itemKey?: string;
}
