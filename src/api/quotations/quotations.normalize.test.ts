import { describe, expect, it } from 'vitest';

import type { Quotation } from './quotations.types';
import { normalizeQuotation } from './quotations.normalize';

function minimalQuotation(overrides: Partial<Quotation> = {}): Quotation {
  return {
    id: 'q1',
    ref: 'PBT-QB-2701-01',
    contractorId: 'c1',
    opportunityId: 'o1',
    salesOwnerId: 'u1',
    currencyCode: 'QAR',
    status: 'Draft',
    commercialStatus: 'Active',
    lifecycle: 'active',
    contractor: null,
    opportunity: null,
    salesOwnerUser: null,
    currentRevision: {
      rev: 0,
      version: 0,
      status: 'Draft',
      date: '2026-01-01',
      fxRateToBase: '1.00000000',
      currencyCode: 'QAR',
      currencyMinorUnits: 2,
      validity: '',
      paymentTerms: '',
      deliveryPeriod: '',
      vatOn: true,
      vatRate: '14.0000',
      vatRateScaled: 140000,
      discountType: 'none',
      discountValueScaled: 0,
      percentDiscountAppliedToRates: false,
      installationIncluded: false,
      installationPercent: '10.0000',
      sellingPricePerAmpBase: null,
      notes: [],
      createdBy: 'u1',
      updatedBy: 'u1',
      issuedAt: null,
      issuedBy: null,
      issuedByUser: null,
      runs: [],
      totals: {
        supplyAmountMinor: 0,
        installationAmountMinor: 0,
        discountAmountMinor: 0,
        sellExVatAmountMinor: 0,
        vatAmountMinor: 0,
        grandAmountMinor: 0,
      },
    },
    revisions: [],
    createdBy: 'u1',
    updatedBy: 'u1',
    createdByUser: null,
    updatedByUser: null,
    archivedAt: null,
    archivedBy: null,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    ...overrides,
  };
}

describe('normalizeQuotation', () => {
  it('defaults commercialStatus to Active when missing', () => {
    const { commercialStatus: _ignored, ...raw } = minimalQuotation();
    expect(normalizeQuotation(raw as Quotation).commercialStatus).toBe('Active');
  });

  it('converts fxRateToBase object to string on current revision', () => {
    const q = minimalQuotation();
    q.currentRevision = {
      ...q.currentRevision,
      fxRateToBase: { rateScaled: 1_000_000, scale: 6 } as unknown as string,
    };
    q.revisions = [q.currentRevision];
    const out = normalizeQuotation(q);
    expect(out.currentRevision.fxRateToBase).toBe('1.00000000');
  });
});
