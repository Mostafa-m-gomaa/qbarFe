import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import type { Quotation, QuotationRevision } from '@/api/quotations/quotations.types';
import { queryKeys } from '@/constants/query-keys';

import {
  getCachedDraftVersion,
  injectExpectedRevisionVersion,
} from './quotation-mutation-cas';

function minimalQuotation(draftVersion: number): Quotation {
  const draft: QuotationRevision = {
    rev: 1,
    version: draftVersion,
    status: 'Draft',
    date: '2026-01-01',
    fxRateToBase: '1.00000000',
    currencyCode: 'QAR',
    currencyMinorUnits: 2,
    validity: '',
    paymentTerms: '',
    deliveryPeriod: '',
    vatOn: true,
    vatRate: '0.0000',
    vatRateScaled: 0,
    discountType: 'none',
    discountValueScaled: 0,
    percentDiscountAppliedToRates: false,
    installationIncluded: false,
    installationPercent: '0.0000',
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
  };
  return {
    id: 'q1',
    ref: 'PBT-QB-2701-01',
    contractorId: 'c1',
    opportunityId: 'o1',
    salesOwnerId: 'u1',
    currencyCode: 'QAR',
    status: 'Revision Draft',
    commercialStatus: 'Active',
    lifecycle: 'active',
    contractor: null,
    opportunity: null,
    salesOwnerUser: null,
    currentRevision: draft,
    revisions: [draft],
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

describe('quotation-mutation-cas', () => {
  it('reads draft version from quotation detail cache', () => {
    const qc = new QueryClient();
    qc.setQueryData(queryKeys.quotations.detail('q1'), minimalQuotation(7));
    expect(getCachedDraftVersion(qc, 'q1')).toBe(7);
  });

  it('injects version on top-level mutation body', () => {
    const out = injectExpectedRevisionVersion(
      { expectedRevisionVersion: 0, validity: '1 Week' },
      5,
    );
    expect(out).toEqual({ expectedRevisionVersion: 5, validity: '1 Week' });
  });

  it('injects version on nested run/item mutation args', () => {
    const out = injectExpectedRevisionVersion(
      {
        runId: 'run1',
        body: { expectedRevisionVersion: 2, amp: 1000 },
      },
      9,
    );
    expect(out).toEqual({
      runId: 'run1',
      body: { expectedRevisionVersion: 9, amp: 1000 },
    });
  });

  it('leaves args unchanged when no CAS field is present', () => {
    expect(injectExpectedRevisionVersion(undefined, 3)).toBe(undefined);
  });
});
