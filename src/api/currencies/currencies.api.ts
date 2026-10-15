import { getPaginated } from '@/api/client/axios-client';

import type { Currency, ListCurrenciesParams } from './currencies.types';

/**
 * GET /currencies — paginated. We request a single large page (limit max 100) because the
 * currency catalog is small and is used as money-formatting metadata across the app.
 */
export async function listCurrencies(params: ListCurrenciesParams = {}): Promise<Currency[]> {
  const page = await getPaginated<Currency>('/currencies', {
    params: { limit: 100, ...params },
  });
  return page.items;
}
