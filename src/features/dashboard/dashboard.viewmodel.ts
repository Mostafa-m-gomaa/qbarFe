import type { User } from '@/api/users/users.types';
import type { DashboardResponse } from '@/api/dashboard/dashboard.types';
import { labelFor, PROJECT_STAGE_LABELS } from '@/lib/enums';

export interface PipelinePoint {
  stage: string;
  label: string;
  count: number;
}

export interface SalespersonActivity {
  userId: string;
  name: string;
  count: number;
}

export interface DashboardViewModel {
  asOf: string;
  baseCurrencyCode: string;
  pipeline: PipelinePoint[];
  activityBySalesperson: SalespersonActivity[];
  hasPipeline: boolean;
  hasActivity: boolean;
}

/**
 * Adapts the raw dashboard response into a stable view model.
 * Salesperson names are resolved via the users map; unknown ids fall back to a short id.
 * No metrics are invented — only fields present in the API are transformed.
 */
export function toDashboardViewModel(
  data: DashboardResponse,
  userMap: Map<string, User>,
): DashboardViewModel {
  const pipeline: PipelinePoint[] = data.pipelineByStage.map((point) => ({
    stage: point.key,
    label: labelFor(PROJECT_STAGE_LABELS, point.key),
    count: point.count,
  }));

  const activityBySalesperson: SalespersonActivity[] = data.activityLast30BySalesperson
    .map((entry) => ({
      userId: entry.userId,
      name: userMap.get(entry.userId)?.name ?? shortId(entry.userId),
      count: entry.count,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    asOf: data.asOf,
    baseCurrencyCode: data.baseCurrencyCode,
    pipeline,
    activityBySalesperson,
    hasPipeline: pipeline.some((point) => point.count > 0),
    hasActivity: activityBySalesperson.some((entry) => entry.count > 0),
  };
}

function shortId(id: string): string {
  return `#${id.slice(-4)}`;
}
