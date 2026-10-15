import { useQuery } from '@tanstack/react-query';

import { getQuotationSchedule } from '@/api/quotation-schedule/quotation-schedule.api';
import { queryKeys } from '@/constants/query-keys';

export function useQuotationSchedule() {
  return useQuery({
    queryKey: queryKeys.quotationSchedule,
    queryFn: () => getQuotationSchedule(),
    staleTime: 5 * 60 * 1000,
  });
}
