import type { Quotation, QuotationRevision } from '@/api/quotations/quotations.types';
import { strings } from '@/constants/strings';
import { opportunityDisplayName } from '@/features/opportunities/opportunity-label';
import { formatDate } from '@/lib/format';

import type { CustomerDocumentLine, CustomerQuotationDocument } from './quotation-document.types';

export interface BuildCustomerDocumentLookups {
  contractorName?: string;
  salesOwnerName?: string;
}

/** Map API quotation + revision to a customer-safe document (selling fields only). */
export function buildCustomerQuotationDocument(
  quotation: Quotation,
  revision: QuotationRevision,
  lookups: BuildCustomerDocumentLookups = {},
): CustomerQuotationDocument {
  const contractorName =
    lookups.contractorName ??
    quotation.contractor?.company ??
    quotation.contractorId;
  const salesOwnerName =
    lookups.salesOwnerName ??
    quotation.salesOwnerUser?.name ??
    quotation.salesOwnerId ??
    '—';
  const opp = quotation.opportunity;
  const opportunityLabel = opportunityDisplayName(opp ?? undefined);

  const totals = revision.totals;

  const runs = revision.runs.map((run) => {
    const lines: CustomerDocumentLine[] = [];
    const straight = run.straightElement;
    lines.push({
      index: 1,
      description: straight.description,
      unitCode: straight.unitCode,
      quantity: straight.quantity,
      unitSellAmountMinor: straight.unitSellAmountMinor,
      sellAmountMinor: straight.sellAmountMinor,
    });
    run.items.forEach((item, ii) => {
      lines.push({
        index: ii + 2,
        description: item.description,
        unitCode: item.unitCode,
        quantity: item.quantity,
        unitSellAmountMinor: item.unitSellAmountMinor,
        sellAmountMinor: item.sellAmountMinor,
        ...(item.kind === 'tap_off'
          ? {
              tapRating: item.tapRating,
              mccb: item.mccb,
              poles: item.poles,
            }
          : {}),
      });
    });
    return {
      name: run.name,
      amp: run.amp,
      conductor: run.conductor,
      poles: run.poles,
      ip: run.ip,
      treatment: run.treatment,
      basis: run.basis,
      pricingProfile: run.pricingProfile,
      lines,
    };
  });

  return {
    companyName: strings.app.name,
    ref: quotation.ref,
    revisionNumber: revision.rev,
    revisionStatus: revision.status,
    quotationStatus: quotation.status,
    quotationDate: formatDate(revision.date),
    isDraftWatermark: revision.status === 'Draft',
    contractorName,
    opportunityLabel,
    salesOwnerName,
    currencyCode: revision.currencyCode,
    currencyMinorUnits: revision.currencyMinorUnits,
    validity: revision.validity || '—',
    paymentTerms: revision.paymentTerms || '—',
    deliveryPeriod: revision.deliveryPeriod || '—',
    runs,
    summary: {
      supplyAmountMinor: totals.supplyAmountMinor,
      installationAmountMinor: totals.installationAmountMinor,
      discountAmountMinor: totals.discountAmountMinor,
      sellExVatAmountMinor: totals.sellExVatAmountMinor,
      vatAmountMinor: totals.vatAmountMinor,
      grandAmountMinor: totals.grandAmountMinor,
      vatOn: revision.vatOn,
      vatRateLabel: revision.vatRate,
    },
    notes: [...revision.notes],
  };
}

/** For tests: ensure serialized document has no internal cost/profit keys. */
export function customerDocumentHasForbiddenKeys(doc: CustomerQuotationDocument): string[] {
  const json = JSON.stringify(doc);
  const forbidden = [
    'costAmountMinor',
    'unitCostAmountMinor',
    'costPending',
    'profitAmountMinor',
    'marginPercent',
    'totalProjectCost',
    'materialCost',
    'belowCost',
    'costPerAmp',
  ];
  return forbidden.filter((k) => json.includes(k));
}

export function customerQuotationExportFilename(
  ref: string,
  rev: number,
  ext: 'pdf' | 'docx',
): string {
  const safe = ref.replace(/[^\w.-]+/g, '-');
  return `${safe}-rev-${rev}.${ext}`;
}
