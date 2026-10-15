/** Customer-facing quotation document — no cost, profit, margin, or internal fields. */

export interface CustomerDocumentLine {
  index: number;
  description: string;
  unitCode: string;
  quantity: string;
  unitSellAmountMinor: number;
  sellAmountMinor: number;
  /** Tap-off only */
  tapRating?: string | null;
  mccb?: string | null;
  poles?: string | null;
}

export interface CustomerDocumentRun {
  name: string;
  amp: number;
  conductor: string;
  poles: string;
  ip: string;
  treatment: string;
  basis: string;
  pricingProfile: string;
  lines: CustomerDocumentLine[];
}

export interface CustomerDocumentSummary {
  supplyAmountMinor: number;
  installationAmountMinor: number;
  discountAmountMinor: number;
  sellExVatAmountMinor: number;
  vatAmountMinor: number;
  grandAmountMinor: number;
  vatOn: boolean;
  vatRateLabel: string;
}

export interface CustomerQuotationDocument {
  companyName: string;
  ref: string;
  revisionNumber: number;
  revisionStatus: 'Draft' | 'Issued';
  quotationStatus: string;
  quotationDate: string;
  isDraftWatermark: boolean;
  contractorName: string;
  opportunityLabel: string;
  salesOwnerName: string;
  currencyCode: string;
  currencyMinorUnits: number;
  validity: string;
  paymentTerms: string;
  deliveryPeriod: string;
  runs: CustomerDocumentRun[];
  summary: CustomerDocumentSummary;
  notes: string[];
}
