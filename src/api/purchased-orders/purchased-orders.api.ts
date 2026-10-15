import { get, getPaginated } from '@/api/client/axios-client';
import type { Paginated } from '@/api/client/types';

import type { ListPurchasedOrdersParams, PurchasedOrder } from './purchased-orders.types';
import { normalizePurchasedOrder, normalizePurchasedOrders } from './purchased-orders.normalize';

const BASE = '/purchased-orders';

export async function listPurchasedOrders(
  params: ListPurchasedOrdersParams = {},
): Promise<Paginated<PurchasedOrder>> {
  const page = await getPaginated<PurchasedOrder>(BASE, { params });
  return { ...page, items: normalizePurchasedOrders(page.items) };
}

export async function getPurchasedOrder(id: string): Promise<PurchasedOrder> {
  return normalizePurchasedOrder(await get<PurchasedOrder>(`${BASE}/${id}`));
}

/** Snapshot created when the quotation was marked commercial won. */
export async function getQuotationPurchasedOrder(quotationId: string): Promise<PurchasedOrder> {
  return normalizePurchasedOrder(
    await get<PurchasedOrder>(`/quotations/${quotationId}/purchased-order`),
  );
}
