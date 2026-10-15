import type {
  Opportunity,
  OpportunityStatus,
  OpportunityType,
} from '@/api/opportunities/opportunities.types';

/** Minimal fields for display (full Opportunity or nested DTO). */
export type OpportunityLabelSource = {
  name?: string | null;
  type?: OpportunityType;
  status?: OpportunityStatus;
};

export function formatOpportunityTypeStatus(
  type?: OpportunityType,
  status?: OpportunityStatus,
): string | null {
  if (type && status) return `${type} / ${status}`;
  return null;
}

/** Primary user-facing label — never the raw id. */
export function opportunityDisplayName(
  source: OpportunityLabelSource | null | undefined,
): string {
  const name = source?.name?.trim();
  if (name) return name;
  const typeStatus = formatOpportunityTypeStatus(source?.type, source?.status);
  return typeStatus ?? '—';
}

/** Combobox: name as label, type/status as secondary line. */
export function opportunityComboboxOption(o: Opportunity): {
  value: string;
  label: string;
  description?: string;
} {
  const label = opportunityDisplayName(o);
  const description =
    formatOpportunityTypeStatus(o.type, o.status) ??
    (o.description?.trim() ? o.description.trim() : undefined);
  return { value: o.id, label, description };
}
