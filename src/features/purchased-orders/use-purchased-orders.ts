import { useQuery } from '@tanstack/react-query';

import { isApiError } from '@/api/client/api-error';
import * as purchasedOrdersApi from '@/api/purchased-orders/purchased-orders.api';
import type { ListPurchasedOrdersParams } from '@/api/purchased-orders/purchased-orders.types';
import { queryKeys } from '@/constants/query-keys';

export function usePurchasedOrders(
  params: ListPurchasedOrdersParams = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.purchasedOrders.list(params),
    queryFn: () => purchasedOrdersApi.listPurchasedOrders(params),
    enabled: options?.enabled ?? true,
  });
}

export function usePurchasedOrder(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.purchasedOrders.detail(id ?? ''),
    queryFn: () => purchasedOrdersApi.getPurchasedOrder(id as string),
    enabled: Boolean(id),
  });
}

export function useQuotationPurchasedOrder(
  quotationId: string | undefined,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.purchasedOrders.byQuotation(quotationId ?? ''),
    queryFn: () => purchasedOrdersApi.getQuotationPurchasedOrder(quotationId as string),
    enabled: Boolean(quotationId) && (options?.enabled ?? true),
    retry: (failureCount, error) => {
      if (isApiError(error) && (error.httpStatus === 404 || error.code === 'NOT_FOUND')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
