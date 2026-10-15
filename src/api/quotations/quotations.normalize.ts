import type { Quotation, QuotationRevision } from './quotations.types';

/** Backend may return fxRateToBase as a scaled object on revisions. */
export function normalizeFxRateToBase(value: unknown): string {
  if (typeof value === 'string' && value.length > 0) return value;
  if (value && typeof value === 'object' && 'rateScaled' in value) {
    const o = value as { rateScaled: number; scale?: number };
    const scale = o.scale ?? 6;
    const divisor = 10 ** scale;
    return (o.rateScaled / divisor).toFixed(8);
  }
  return '1.00000000';
}

export function normalizeQuotationRevision(revision: QuotationRevision): QuotationRevision {
  const raw = revision as QuotationRevision & { fxRateToBase: unknown };
  if (typeof raw.fxRateToBase === 'string') return revision;
  return {
    ...revision,
    fxRateToBase: normalizeFxRateToBase(raw.fxRateToBase),
  };
}

export function normalizeQuotation(quotation: Quotation): Quotation {
  const currentRevision = normalizeQuotationRevision(quotation.currentRevision);
  const revisions = quotation.revisions.map(normalizeQuotationRevision);
  const raw = quotation as Quotation & { commercialStatus?: Quotation['commercialStatus'] };
  return {
    ...quotation,
    commercialStatus: raw.commercialStatus ?? 'Active',
    currentRevision,
    revisions,
  };
}

export function normalizeQuotations(items: Quotation[]): Quotation[] {
  return items.map(normalizeQuotation);
}
