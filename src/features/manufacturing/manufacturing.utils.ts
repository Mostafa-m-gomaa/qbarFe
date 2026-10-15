import type {
  ManufacturingClearanceStatus,
  PendingManufacturingLineDto,
} from '@/api/manufacturing/manufacturing.types';

import { QUANTITY_SCALE } from './manufacturing.constants';

/** Converts a decimal quantity to a compact value without redundant zeroes. */
export function formatDecimalQuantity(value: string | number): string {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return String(value);
  return parsed.toLocaleString('en-US', {
    maximumFractionDigits: 4,
    useGrouping: false,
  });
}

/** Converts scaled quantity to a compact decimal meter value. */
export function scaledToMetersString(scaled: number): string {
  return formatDecimalQuantity(scaled / QUANTITY_SCALE);
}

/** Removes redundant decimal zeroes and appends the meter unit. */
export function formatMeters(value: string | number): string {
  return `${formatDecimalQuantity(value)} m`;
}

export function isClearanceReadOnly(status: ManufacturingClearanceStatus): boolean {
  return status === 'Closed';
}

/**
 * Dashboard KPI aggregate: sum pending from open MC rows only (exclude Closed status).
 * Pending report itself still includes closed incomplete lines per backend rules.
 */
export function aggregateOpenPendingQuantityScaled(rows: PendingManufacturingLineDto[]): number {
  return rows
    .filter((row) => row.status !== 'Closed')
    .reduce((sum, row) => sum + row.pendingQuantityScaled, 0);
}

export function parseDecimalQuantity(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

/** True when clear-now value is positive and within available (inclusive). */
export function isClearNowValid(clearNow: string, availableCleared: string): boolean {
  const clear = parseDecimalQuantity(clearNow);
  const available = parseDecimalQuantity(availableCleared);
  if (clear === null || available === null) return false;
  if (clear <= 0) return false;
  return clear <= available + 1e-9;
}
