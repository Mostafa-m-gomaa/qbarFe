import type { AdditionalCost } from '@/api/quotations/quotations.types';
import { strings } from '@/constants/strings';
import { sanitizeAsciiNumericInput } from '@/lib/quotation-decimals';

export interface AdditionalCostFormRow {
  description: string;
  amountText: string;
}

export type ParseAdditionalCostResult =
  | { ok: true; row: AdditionalCost }
  | { ok: false; message: string };

export function additionalCostToForm(cost: AdditionalCost): AdditionalCostFormRow {
  return {
    description: cost.description,
    amountText: (cost.amountMinor / 100).toFixed(2),
  };
}

export function parseAdditionalCostRow(
  description: string,
  amountText: string,
): ParseAdditionalCostResult {
  const desc = description.trim();
  if (!desc) {
    return { ok: false, message: strings.quotations.additionalCostDescriptionRequired };
  }
  const normalized = sanitizeAsciiNumericInput(amountText, 2);
  if (!normalized.trim()) {
    return { ok: false, message: strings.quotations.additionalCostAmountRequired };
  }
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) {
    return { ok: false, message: strings.quotations.additionalCostAmountRequired };
  }
  return {
    ok: true,
    row: { description: desc, amountMinor: Math.round(n * 100) },
  };
}

/** Build a full additionalCosts payload from saved rows, falling back to server rows when needed. */
export function mergeAdditionalCostAtIndex(
  costs: AdditionalCost[],
  forms: AdditionalCostFormRow[],
  index: number,
  parsed: AdditionalCost,
): AdditionalCost[] {
  return costs.map((cost, i) => {
    if (i === index) return parsed;
    if (i < forms.length) {
      const other = parseAdditionalCostRow(forms[i].description, forms[i].amountText);
      if (other.ok) return other.row;
    }
    return cost;
  });
}
