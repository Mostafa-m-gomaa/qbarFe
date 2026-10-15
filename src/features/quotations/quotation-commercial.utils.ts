import type { Quotation, QuotationCommercialStatus } from '@/api/quotations/quotations.types';

export const COMMERCIAL_STATUS_VALUES: QuotationCommercialStatus[] = [
  'Active',
  'Won',
  'Lost',
  'Cancelled',
  'ConvertedToCables',
  'OnHold',
  'ContractorChanged',
];

export function commercialStatusRequiresForm(status: QuotationCommercialStatus): boolean {
  return status !== 'Active' && status !== 'Won';
}

export function hasPurchasedOrderSnapshot(quotation: Quotation): boolean {
  return quotation.commercialStatus === 'Won';
}
