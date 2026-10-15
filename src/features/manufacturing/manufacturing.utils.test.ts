import { describe, expect, it } from 'vitest';

import type { PendingManufacturingLineDto } from '@/api/manufacturing/manufacturing.types';

import {
  aggregateOpenPendingQuantityScaled,
  formatDecimalQuantity,
  formatMeters,
  isClearanceReadOnly,
  isClearNowValid,
  scaledToMetersString,
} from './manufacturing.utils';

describe('manufacturing.utils', () => {
  it('scaledToMetersString converts quantity scale', () => {
    expect(scaledToMetersString(250_000)).toBe('25');
  });

  it('formatMeters removes redundant zeroes and adds the unit', () => {
    expect(formatDecimalQuantity('12.5000')).toBe('12.5');
    expect(formatMeters('100.0000')).toBe('100 m');
    expect(formatMeters('12.5000')).toBe('12.5 m');
  });

  it('isClearanceReadOnly is true only for Closed', () => {
    expect(isClearanceReadOnly('Closed')).toBe(true);
    expect(isClearanceReadOnly('Produced')).toBe(false);
  });

  it('isClearNowValid respects available cleared', () => {
    expect(isClearNowValid('3', '6')).toBe(true);
    expect(isClearNowValid('7', '6')).toBe(false);
    expect(isClearNowValid('0', '6')).toBe(false);
  });

  it('aggregateOpenPendingQuantityScaled excludes closed MC rows', () => {
    const rows: PendingManufacturingLineDto[] = [
      {
        projectId: 'p1',
        projectNumber: '1',
        projectName: 'A',
        clearanceId: 'c1',
        clearanceNumber: 'MC-1',
        clearanceDate: '2026-01-01',
        requiredProductionOn: null,
        status: 'Partially Produced',
        lineId: 'l1',
        projectItemId: 'i1',
        itemLabel: 'Item',
        requiredQuantityScaled: 100_000,
        clearedQuantityScaled: 100_000,
        producedQuantityScaled: 50_000,
        pendingQuantityScaled: 50_000,
        required: '10',
        cleared: '10',
        produced: '5',
        pending: '5',
        agingDays: 3,
      },
      {
        projectId: 'p2',
        projectNumber: '2',
        projectName: 'B',
        clearanceId: 'c2',
        clearanceNumber: 'MC-2',
        clearanceDate: '2026-01-01',
        requiredProductionOn: null,
        status: 'Closed',
        lineId: 'l2',
        projectItemId: 'i2',
        itemLabel: 'Item',
        requiredQuantityScaled: 100_000,
        clearedQuantityScaled: 100_000,
        producedQuantityScaled: 0,
        pendingQuantityScaled: 100_000,
        required: '10',
        cleared: '10',
        produced: '0',
        pending: '10',
        agingDays: 0,
      },
    ];
    expect(aggregateOpenPendingQuantityScaled(rows)).toBe(50_000);
  });
});
