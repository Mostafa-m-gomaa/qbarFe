import { Download, FolderKanban, Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { PageHeader } from '@/components/common/page-header';
import { Pagination } from '@/components/common/pagination';
import { PermissionGate } from '@/components/common/permission-gate';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { TableSkeleton } from '@/components/feedback/skeletons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PERMISSIONS } from '@/constants/permissions';
import { strings } from '@/constants/strings';
import { useConsultantMap, useContractorMap, useUserMap } from '@/features/crm/lookups';

import type { ProjectsExportFormat, ProjectsExportScope } from './export/run-projects-export';
import { runProjectsExport } from './export/run-projects-export';
import { ProjectsFilterBar } from './projects-filter-bar';
import {
  defaultProjectsListFilters,
  projectsFiltersActive,
  projectsFiltersToListParams,
  projectsFilterSummary,
  type ProjectsListFilterState,
} from './projects-list-filters';
import { ProjectsTable } from './projects-table';
import { ProjectsPageShell } from './ui/projects-page-shell';
import { useProjects } from './use-projects';

const PAGE_SIZE = 20;

export function ProjectsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ProjectsListFilterState>(defaultProjectsListFilters);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);

  const userMap = useUserMap();
  const consultantMap = useConsultantMap();
  const contractorMap = useContractorMap();

  const listParams = useMemo(
    () => projectsFiltersToListParams(filters, { page, limit: PAGE_SIZE }),
    [filters, page],
  );

  const { data, isLoading, isError, error, refetch } = useProjects(listParams);

  const onFiltersChange = (next: ProjectsListFilterState) => {
    setFilters(next);
    setPage(1);
    setSelectedIds([]);
  };

  const projects = data?.items ?? [];
  const hasFilters = projectsFiltersActive(filters);

  const exportLookups = useMemo(
    () => ({
      consultantName: (id: string | null) =>
        id ? (consultantMap.get(id) ?? id) : '',
      contractorName: (id: string | null) =>
        id ? (contractorMap.get(id) ?? id) : '',
      userName: (id: string | null) => (id ? (userMap.get(id)?.name ?? id) : ''),
      usersNames: (ids: string[]) =>
        ids.map((id) => userMap.get(id)?.name ?? id).filter(Boolean).join('; '),
    }),
    [consultantMap, contractorMap, userMap],
  );

  const handleExport = useCallback(
    async (format: ProjectsExportFormat, scope: ProjectsExportScope) => {
      if (scope === 'selected' && selectedIds.length === 0) return;
      setExporting(true);
      const toastId = toast.loading(strings.projects.exportInProgress);
      try {
        const { projectCount } = await runProjectsExport({
          format,
          scope,
          listParams,
          selectedIds,
          lookups: exportLookups,
          filterSummary: projectsFilterSummary(filters),
        });
        toast.success(strings.projects.exportSuccess(projectCount), { id: toastId });
      } catch {
        toast.error(strings.projects.exportFailed, { id: toastId });
      } finally {
        setExporting(false);
      }
    },
    [exportLookups, filters, listParams, selectedIds],
  );

  const toggleSelection = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) return prev.includes(id) ? prev : [...prev, id];
      return prev.filter((x) => x !== id);
    });
  };

  const toggleAllOnPage = (checked: boolean) => {
    const pageIds = projects.map((p) => p.id);
    if (!checked) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
      return;
    }
    setSelectedIds((prev) => [...new Set([...prev, ...pageIds])]);
  };

  const allPageSelected =
    projects.length > 0 && projects.every((p) => selectedIds.includes(p.id));

  const createButton = (variant?: 'outline') => (
    <PermissionGate permission={PERMISSIONS.projects.create}>
      <Button
        onClick={() => navigate('/app/projects/new')}
        variant={variant}
        className={variant ? undefined : 'shadow-sm'}
      >
        <Plus />
        {strings.projects.create}
      </Button>
    </PermissionGate>
  );

  const exportMenu = (
    <PermissionGate permission={[PERMISSIONS.projects.read, PERMISSIONS.projects.readAll]}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={exporting} className="shadow-sm">
            <Download />
            {strings.projects.export}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{strings.projects.exportCsv}</DropdownMenuLabel>
          <DropdownMenuItem
            disabled={selectedIds.length === 0 || exporting}
            onClick={() => void handleExport('csv', 'selected')}
          >
            {strings.projects.exportSelected(selectedIds.length)}
          </DropdownMenuItem>
          <DropdownMenuItem disabled={exporting} onClick={() => void handleExport('csv', 'filtered')}>
            {strings.projects.exportAllFiltered}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>{strings.projects.exportPdf}</DropdownMenuLabel>
          <DropdownMenuItem
            disabled={selectedIds.length === 0 || exporting}
            onClick={() => void handleExport('pdf', 'selected')}
          >
            {strings.projects.exportSelected(selectedIds.length)}
          </DropdownMenuItem>
          <DropdownMenuItem disabled={exporting} onClick={() => void handleExport('pdf', 'filtered')}>
            {strings.projects.exportAllFiltered}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </PermissionGate>
  );

  return (
    <ProjectsPageShell>
      <PageHeader
        title={strings.projects.title}
        description={strings.projects.subtitle}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {exportMenu}
            {createButton()}
          </div>
        }
      />

      <ProjectsFilterBar filters={filters} onChange={onFiltersChange} />

      {isLoading ? (
        <TableSkeleton rows={6} columns={10} />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={strings.projects.emptyTitle}
          description={hasFilters ? strings.common.noResults : strings.projects.emptyHint}
          action={hasFilters ? undefined : createButton('outline')}
        />
      ) : (
        <>
          <ProjectsTable
            projects={projects}
            selectedIds={selectedIds}
            allPageSelected={allPageSelected}
            onToggleRow={toggleSelection}
            onToggleAllPage={toggleAllOnPage}
          />
          <Pagination
            page={data?.page ?? 1}
            limit={data?.limit ?? PAGE_SIZE}
            total={data?.total ?? projects.length}
            onPageChange={setPage}
          />
        </>
      )}
    </ProjectsPageShell>
  );
}
