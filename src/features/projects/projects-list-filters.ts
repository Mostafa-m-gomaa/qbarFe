import type { ProjectDepartment } from '@/api/projects/project-enums';
import type { ListProjectsParams, ProjectStage, ProjectType } from '@/api/projects/projects.types';

export type ProjectsStageFilter = ProjectStage | 'all';

export type ProjectsActiveClosedFilter =
  | 'all'
  | 'active_only'
  | 'archived'
  | 'execution_open'
  | 'execution_closed';

export type ProjectsDepartmentFilter = ProjectDepartment | 'all';

export type ProjectsTypeFilter = ProjectType | 'all';

export interface ProjectsListFilterState {
  q: string;
  type: ProjectsTypeFilter;
  stage: ProjectsStageFilter;
  activeClosed: ProjectsActiveClosedFilter;
  consultantId: string | null;
  country: string;
  salesPersonId: string | null;
  department: ProjectsDepartmentFilter;
  createdFrom: string;
  createdTo: string;
}

export const defaultProjectsListFilters = (): ProjectsListFilterState => ({
  q: '',
  type: 'all',
  stage: 'all',
  activeClosed: 'active_only',
  consultantId: null,
  country: '',
  salesPersonId: null,
  department: 'all',
  createdFrom: '',
  createdTo: '',
});

export function projectsFiltersToListParams(
  filters: ProjectsListFilterState,
  paging: { page: number; limit: number },
): ListProjectsParams {
  const params: ListProjectsParams = {
    page: paging.page,
    limit: paging.limit,
    ...(filters.q.trim() ? { q: filters.q.trim() } : {}),
    ...(filters.type === 'all' ? {} : { type: filters.type }),
    ...(filters.stage === 'all' ? {} : { stage: filters.stage }),
    ...(filters.consultantId ? { consultantId: filters.consultantId } : {}),
    ...(filters.country.trim() ? { country: filters.country.trim() } : {}),
    ...(filters.salesPersonId ? { salesPersonId: filters.salesPersonId } : {}),
    ...(filters.department === 'all' ? {} : { department: filters.department }),
    ...(filters.createdFrom ? { createdFrom: filters.createdFrom } : {}),
    ...(filters.createdTo ? { createdTo: filters.createdTo } : {}),
  };

  switch (filters.activeClosed) {
    case 'all':
      break;
    case 'active_only':
      params.status = 'active';
      break;
    case 'archived':
      params.status = 'archived';
      break;
    case 'execution_open':
      params.status = 'active';
      params.executionState = 'open';
      break;
    case 'execution_closed':
      params.status = 'active';
      params.executionState = 'closed';
      break;
  }

  return params;
}

export function projectsFiltersActive(filters: ProjectsListFilterState): boolean {
  return (
    filters.q.trim() !== '' ||
    filters.type !== 'all' ||
    filters.stage !== 'all' ||
    filters.activeClosed !== 'active_only' ||
    Boolean(filters.consultantId) ||
    filters.country.trim() !== '' ||
    Boolean(filters.salesPersonId) ||
    filters.department !== 'all' ||
    filters.createdFrom !== '' ||
    filters.createdTo !== ''
  );
}

export function projectsFilterSummary(filters: ProjectsListFilterState): string {
  const parts: string[] = [];
  if (filters.q.trim()) parts.push(`Search: ${filters.q.trim()}`);
  if (filters.type !== 'all') parts.push(`Type: ${filters.type}`);
  if (filters.stage !== 'all') parts.push(`Stage: ${filters.stage}`);
  if (filters.consultantId) parts.push(`Consultant: ${filters.consultantId}`);
  if (filters.country.trim()) parts.push(`Country: ${filters.country.trim()}`);
  if (filters.salesPersonId) parts.push(`Salesperson: ${filters.salesPersonId}`);
  if (filters.department !== 'all') parts.push(`Department: ${filters.department}`);
  if (filters.createdFrom || filters.createdTo) {
    parts.push(`Created: ${filters.createdFrom || '…'} – ${filters.createdTo || '…'}`);
  }
  switch (filters.activeClosed) {
    case 'active_only':
      parts.push('Active only');
      break;
    case 'archived':
      parts.push('Archived');
      break;
    case 'execution_open':
      parts.push('Active · execution open');
      break;
    case 'execution_closed':
      parts.push('Active · execution closed');
      break;
    default:
      break;
  }
  return parts.length ? parts.join(' · ') : 'All projects';
}
