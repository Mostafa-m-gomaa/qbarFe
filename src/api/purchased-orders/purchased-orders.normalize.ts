import { normalizeQuotationRevision } from '@/api/quotations/quotations.normalize';

import type { PurchasedOrder } from './purchased-orders.types';

export function normalizePurchasedOrder(order: PurchasedOrder): PurchasedOrder {
  const snapshot = order.revisionSnapshot;
  return {
    ...order,
    grandAmountMinor:
      order.grandAmountMinor ??
      snapshot?.totals?.grandAmountMinor ??
      0,
    revisionSnapshot: snapshot
      ? normalizeQuotationRevision(snapshot)
      : snapshot,
  };
}

export function normalizePurchasedOrders(items: PurchasedOrder[]): PurchasedOrder[] {
  return items.map(normalizePurchasedOrder);
}
