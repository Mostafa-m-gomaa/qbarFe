import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { listCurrencies } from '@/api/currencies/currencies.api';
import type { Currency } from '@/api/currencies/currencies.types';
import { queryKeys } from '@/constants/query-keys';

/**
 * Currency catalog — the single source of `minorUnits` for money formatting.
 * Cached generously since currency metadata changes rarely.
 */
export function useCurrencies() {
  return useQuery({
    queryKey: queryKeys.currencies.all,
    queryFn: () => listCurrencies(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/** Returns a code → currency lookup map (empty until loaded). */
export function useCurrencyMap(): Map<string, Currency> {
  const { data } = useCurrencies();
  return useMemo(() => {
    const map = new Map<string, Currency>();
    for (const currency of data ?? []) {
      map.set(currency.code, currency);
    }
    return map;
  }, [data]);
}
