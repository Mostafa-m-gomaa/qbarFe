import { get } from '@/api/client/axios-client';

import type { QuotationSchedule } from './quotation-schedule.types';

const BASE = '/quotation-schedule';

export function getQuotationSchedule(): Promise<QuotationSchedule> {
  return get<QuotationSchedule>(BASE);
}
