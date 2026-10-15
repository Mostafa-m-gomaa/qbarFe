import type { Quotation, QuotationRevision } from '@/api/quotations/quotations.types';

export function draftRevision(quotation: Quotation): QuotationRevision | null {
  return quotation.revisions.find((r) => r.status === 'Draft') ?? null;
}

export function latestIssuedRevision(quotation: Quotation): QuotationRevision | null {
  return (
    [...quotation.revisions]
      .filter((r) => r.status === 'Issued')
      .sort((a, b) => b.rev - a.rev)[0] ?? null
  );
}

/** Revision the user is allowed to edit (draft only). */
export function editableDraftRevision(quotation: Quotation): QuotationRevision | null {
  return draftRevision(quotation);
}

export function resolveViewRevision(
  quotation: Quotation,
  revParam: number | null,
): QuotationRevision {
  if (revParam !== null) {
    const found = quotation.revisions.find((r) => r.rev === revParam);
    if (found) return found;
  }
  const draft = draftRevision(quotation);
  if (draft) return draft;
  const issued = latestIssuedRevision(quotation);
  if (issued) return issued;
  return quotation.currentRevision;
}

export function isRevisionReadOnly(quotation: Quotation, revision: QuotationRevision): boolean {
  if (revision.status === 'Issued') return true;
  const draft = draftRevision(quotation);
  if (!draft) return true;
  return revision.rev !== draft.rev;
}

/**
 * Revision to display in quotation *lists*.
 *
 * A quotation is a single row showing its latest/current revision —
 * never one row per revision. Prefers `currentRevision`, but falls back
 * to the highest `rev` in `revisions[]` if that is newer (stale cache)
 * or if `currentRevision` is missing.
 */
export function resolveListRevision(quotation: Quotation): QuotationRevision {
  const current = quotation.currentRevision;
  const latest = [...(quotation.revisions ?? [])].sort((a, b) => b.rev - a.rev)[0];
  if (!current) return latest;
  if (latest && latest.rev > current.rev) return latest;
  return current;
}

/**
 * Collapse a quotation list to one row per quotation (`id`).
 *
 * If the backend ever returns duplicate entries for the same quotation
 * (e.g. one per revision), keep only the entry with the highest
 * displayed revision. Distinct quotations (different `id`, even on the
 * same opportunity) are preserved as separate rows.
 */
export function dedupeQuotations(quotations: Quotation[]): Quotation[] {
  const byId = new Map<string, Quotation>();
  for (const q of quotations) {
    const existing = byId.get(q.id);
    if (!existing) {
      byId.set(q.id, q);
      continue;
    }
    if (resolveListRevision(q).rev > resolveListRevision(existing).rev) {
      byId.set(q.id, q);
    }
  }
  return [...byId.values()];
}

export function revisionHasPendingCost(revision: QuotationRevision): boolean {
  for (const run of revision.runs) {
    if (run.straightElement.costPending) return true;
    if (run.items.some((item) => item.costPending)) return true;
  }
  return false;
}

export function totalsHasCostFields(
  totals: QuotationRevision['totals'],
): totals is QuotationRevision['totals'] & {
  profitAmountMinor: number;
  totalProjectCostExVatAmountMinor: number;
  marginPercent: string;
} {
  return (
    'profitAmountMinor' in totals &&
    'totalProjectCostExVatAmountMinor' in totals &&
    'marginPercent' in totals
  );
}
