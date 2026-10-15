import type { ActivityType, ListActivitiesParams } from '@/api/activities/activities.types';

export const ACTIVITIES_FILTER_ALL = 'all' as const;

export type ActivityTypeFilter = ActivityType | typeof ACTIVITIES_FILTER_ALL;
export type ActivityCompletedFilter = typeof ACTIVITIES_FILTER_ALL | 'true' | 'false';

export interface ProjectActivitiesListFilterInput {
  page: number;
  limit: number;
  q: string;
  projectId: string | null | undefined;
  defaultProjectId: string | undefined;
  assignedUserId: string | null;
  type: ActivityTypeFilter;
  completed: ActivityCompletedFilter;
  dueFrom: string;
  dueTo: string;
}

export function projectActivitiesListFiltersToParams(
  filters: ProjectActivitiesListFilterInput,
): ListActivitiesParams {
  const projectId = filters.projectId ?? filters.defaultProjectId;
  return {
    page: filters.page,
    limit: filters.limit,
    ...(filters.q.trim() ? { q: filters.q.trim() } : {}),
    ...(projectId ? { projectId } : {}),
    ...(filters.assignedUserId ? { assignedUserId: filters.assignedUserId } : {}),
    ...(filters.type === ACTIVITIES_FILTER_ALL ? {} : { type: filters.type }),
    ...(filters.completed === ACTIVITIES_FILTER_ALL ? {} : { completed: filters.completed }),
    ...(filters.dueFrom ? { dueFrom: filters.dueFrom } : {}),
    ...(filters.dueTo ? { dueTo: filters.dueTo } : {}),
  };
}
