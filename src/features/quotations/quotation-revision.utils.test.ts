import { describe, expect, it } from 'vitest';

import type { Quotation, QuotationRevision } from '@/api/quotations/quotations.types';

import {
  dedupeQuotations,
  draftRevision,
  isRevisionReadOnly,
  resolveListRevision,
  revisionHasPendingCost,
} from './quotation-revision.utils';

function rev(partial: Partial<QuotationRevision> & Pick<QuotationRevision, 'rev' | 'status'>): QuotationRevision {
  return {
    version: 0,
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
    ...partial,
  };
}

function quotation(revisions: QuotationRevision[]): Quotation {
  const current = revisions[revisions.length - 1];
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
    currentRevision: current,
    revisions,
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

describe('quotation-revision.utils', () => {
  it('marks issued revisions read-only', () => {
    const q = quotation([rev({ rev: 0, status: 'Issued' })]);
    expect(isRevisionReadOnly(q, q.revisions[0])).toBe(true);
  });

  it('allows editing the active draft', () => {
    const q = quotation([rev({ rev: 1, status: 'Draft', version: 2 })]);
    expect(isRevisionReadOnly(q, q.revisions[0])).toBe(false);
    expect(draftRevision(q)?.rev).toBe(1);
  });

  it('lists a quotation once with its latest revision', () => {
    const issued = rev({ rev: 0, status: 'Issued' });
    const draft = rev({ rev: 1, status: 'Draft', version: 3 });
    const q = {
      ...quotation([issued, draft]),
      ref: 'PBT-QB-2704-01',
      status: 'Revision Draft' as const,
      currentRevision: draft,
    };

    // Single quotation object renders one row: latest revision.
    expect(resolveListRevision(q).rev).toBe(1);
    expect(resolveListRevision(q).status).toBe('Draft');

    // Duplicate list entries for the same quotation collapse to one row.
    const stale = { ...q, currentRevision: issued, revisions: [issued] };
    const rows = dedupeQuotations([stale, q]);
    expect(rows).toHaveLength(1);
    expect(resolveListRevision(rows[0]).rev).toBe(1);
    expect(rows[0].status).toBe('Revision Draft');
  });

  it('keeps distinct quotations on the same opportunity as separate rows', () => {
    const qa = { ...quotation([rev({ rev: 0, status: 'Issued' })]), id: 'qa' };
    const qb = { ...quotation([rev({ rev: 0, status: 'Draft' })]), id: 'qb' };
    expect(dedupeQuotations([qa, qb])).toHaveLength(2);
  });

  it('detects pending cost on straight element', () => {
    const r = rev({
      rev: 0,
      status: 'Draft',
      runs: [
        {
          id: 'run1',
          name: 'Run 1',
          amp: 1000,
          conductor: 'Copper',
          poles: '4.5P',
          ip: 'IP55',
          treatment: 'Tin',
          basis: 'Detailed Pricing',
          pricingProfile: 'Std',
          complete: false,
          straightElement: {
            id: 's1',
            itemKey: 'STRAIGHT',
            description: 'Straight',
            unitCode: 'LM',
            quantity: '1.0000',
            quantityScaled: 10000,
            unitSellAmountMinor: 100,
            sellAmountMinor: 100,
            currencyCode: 'QAR',
            product: null,
            discountBaseUnitSellAmountMinor: null,
            costPending: true,
          },
          items: [],
        },
      ],
    });
    expect(revisionHasPendingCost(r)).toBe(true);
  });
});
