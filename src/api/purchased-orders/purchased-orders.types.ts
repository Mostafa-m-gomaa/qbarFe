import type { QuotationLifecycle, QuotationRevision } from '@/api/quotations/quotations.types';

export interface PurchasedOrderFxRate {
  rateScaled: number;
  scale: number;
  asOf: string;
  baseCurrencyCode: string;
}

export interface PurchasedOrder {
  id: string;
  quotationId: string;
  quotationRef: string;
  quotationRev: number;
  opportunityId: string;
  contractorId: string;
  salesOwnerId: string;
  currencyCode: string;
  issuedAt: string;
  issuedBy: string;
  fxRateToBase: PurchasedOrderFxRate | string;
  grandAmountMinor: number;
  revisionSnapshot: QuotationRevision;
  wonAt: string;
  wonBy: string;
  lifecycle: QuotationLifecycle;
  createdAt: string;
  updatedAt: string;
}

export interface ListPurchasedOrdersParams {
  page?: number;
  limit?: number;
  quotationId?: string;
  opportunityId?: string;
  contractorId?: string;
}
