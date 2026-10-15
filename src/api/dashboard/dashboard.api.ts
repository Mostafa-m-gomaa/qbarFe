import { get } from '@/api/client/axios-client';

import type { DashboardResponse } from './dashboard.types';

/** GET /dashboard — requires `reports.read`. As-of is today (UTC) on the backend. */
export function getDashboard(): Promise<DashboardResponse> {
  return get<DashboardResponse>('/dashboard');
}
