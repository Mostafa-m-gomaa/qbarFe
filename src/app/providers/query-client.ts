import { QueryClient } from '@tanstack/react-query';

import { isApiError } from '@/api/client/api-error';

/** Do not retry client errors (auth/permission/validation/not-found/conflict). */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (isApiError(error)) {
    const status = error.httpStatus;
    if (status && status >= 400 && status < 500) return false;
  }
  return failureCount < 2;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: shouldRetry,
    },
    mutations: {
      retry: false,
    },
  },
});
