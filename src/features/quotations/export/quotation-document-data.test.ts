import { describe, expect, it } from 'vitest';

import type { Quotation, QuotationRevision } from '@/api/quotations/quotations.types';

import {
  buildCustomerQuotationDocument,
  customerDocumentHasForbiddenKeys,
  customerQuotationExportFilename,
} from './quotation-document-data';

function revisionWithCost(): QuotationRevision {
  return {
    rev: 1,
    version: 2,
    status: 'Draft',
    date: '2026-03-15T00:00:00.000Z',
    fxRateToBase: '1.00000000',
    currencyCode: 'QAR',
    currencyMinorUnits: 2,
    validity: '1 Week',
    paymentTerms: '30 days',
    deliveryPeriod: '8 weeks',
    vatOn: true,
    vatRate: '14.0000',
    vatRateScaled: 140000,
    discountType: 'none',
    discountValueScaled: 0,
    percentDiscountAppliedToRates: false,
    installationIncluded: false,
    installationPercent: '10.0000',
    sellingPricePerAmpBase: 1500,
    notes: ['Note A'],
    createdBy: 'u1',
    updatedBy: 'u1',
    issuedAt: null,
    issuedBy: null,
    issuedByUser: null,
    costPerAmpBase: 900,
    isBelowCost: true,
    installationCostMode: 'percent',
    runs: [
      {
        id: 'run1',
        name: 'Run 1',
        amp: 1000,
        conductor: 'Copper',
        poles: '4.5P',
        ip: 'IP55',
        treatment: 'Tin Plated',
        basis: 'Detailed Pricing',
        pricingProfile: 'Std Pricing',
        complete: false,
        straightElement: {
          id: 's1',
          itemKey: 'STRAIGHT',
          description: 'Straight busbar',
          unitCode: 'LM',
          quantity: '10.0000',
          quantityScaled: 100000,
          unitSellAmountMinor: 150000,
          sellAmountMinor: 1500000,
          currencyCode: 'QAR',
          product: null,
          discountBaseUnitSellAmountMinor: null,
          unitCostAmountMinor: 90000,
          costAmountMinor: 900000,
          costPending: true,
        },
        items: [
          {
            id: 'i1',
            kind: 'tap_off',
            itemKey: 'TAP_OFF',
            description: 'Tap-off 400A',
            unitCode: 'EA',
            quantity: '2.0000',
            quantityScaled: 20000,
            unitSellAmountMinor: 500000,
            sellAmountMinor: 1000000,
            currencyCode: 'QAR',
            product: null,
            tapRating: '400A',
            mccb: 'With MCCB',
            poles: '4P',
            discountBaseUnitSellAmountMinor: null,
            unitCostAmountMinor: 300000,
            costAmountMinor: 600000,
            costPending: false,
          },
        ],
      },
    ],
    totals: {
      supplyAmountMinor: 2500000,
      installationAmountMinor: 250000,
      discountAmountMinor: 0,
      sellExVatAmountMinor: 2750000,
      vatAmountMinor: 385000,
      grandAmountMinor: 3135000,
      materialCostAmountMinor: 1500000,
      profitAmountMinor: 1250000,
      marginPercent: '45.4545',
      totalProjectCostExVatAmountMinor: 1500000,
    },
  };
}

function quotation(rev: QuotationRevision): Quotation {
  return {
    id: 'q1',
    ref: 'PBT-QB-2704-01',
    contractorId: 'c1',
    opportunityId: 'o1',
    salesOwnerId: 'u1',
    currencyCode: 'QAR',
    status: 'Revision Draft',
    commercialStatus: 'Active',
    lifecycle: 'active',
    contractor: { id: 'c1', company: 'ACME LLC' },
    opportunity: {
      id: 'o1',
      name: 'Metro substation',
      description: null,
      type: 'In Hand',
      status: 'Open',
    },
    salesOwnerUser: { id: 'u1', name: 'Ahmed', email: 'a@x.com' },
    currentRevision: rev,
    revisions: [rev],
    createdBy: 'u1',
    updatedBy: 'u1',
    createdByUser: null,
    updatedByUser: null,
    archivedAt: null,
    archivedBy: null,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  };
}

describe('buildCustomerQuotationDocument', () => {
  it('strips cost, profit, margin, and below-cost from export model', () => {
    const rev = revisionWithCost();
    const q = quotation(rev);
    const doc = buildCustomerQuotationDocument(q, rev);
    expect(customerDocumentHasForbiddenKeys(doc)).toEqual([]);
    expect(doc.summary.grandAmountMinor).toBe(3135000);
    expect(doc.isDraftWatermark).toBe(true);
    expect(doc.runs[0].lines).toHaveLength(2);
    expect(doc.runs[0].lines[1].tapRating).toBe('400A');
  });

  it('uses issued revision without draft watermark', () => {
    const rev = { ...revisionWithCost(), status: 'Issued' as const };
    const doc = buildCustomerQuotationDocument(quotation(rev), rev);
    expect(doc.isDraftWatermark).toBe(false);
    expect(doc.revisionNumber).toBe(1);
  });

  it('builds export filename', () => {
    expect(customerQuotationExportFilename('PBT-QB-2704-01', 1, 'pdf')).toBe(
      'PBT-QB-2704-01-rev-1.pdf',
    );
  });
});
