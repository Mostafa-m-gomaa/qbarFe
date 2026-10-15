import { useQuery } from '@tanstack/react-query';

import { getDashboard } from '@/api/dashboard/dashboard.api';
import { queryKeys } from '@/constants/query-keys';

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => getDashboard(),
    staleTime: 60_000,
  });
}
