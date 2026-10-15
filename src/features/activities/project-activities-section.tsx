import { ClipboardList, Plus } from 'lucide-react';
import { useState } from 'react';

import type { Activity } from '@/api/activities/activities.types';
import { Combobox } from '@/components/common/combobox';
import { DateField } from '@/components/common/date-field';
import { FilterBar } from '@/components/common/filter-bar';
import { Pagination } from '@/components/common/pagination';
import { PermissionGate } from '@/components/common/permission-gate';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { TableSkeleton } from '@/components/feedback/skeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PERMISSIONS } from '@/constants/permissions';
import { strings } from '@/constants/strings';
import { useActiveUserOptions, useProjectOptions } from '@/features/crm/lookups';

import { ACTIVITY_TYPE_OPTIONS } from './activity.schema';
import { ActivityFormDialog } from './activity-form-dialog';
import { ActivitiesTable } from './activities-table';
import {
  ACTIVITIES_FILTER_ALL,
  projectActivitiesListFiltersToParams,
  type ActivityCompletedFilter,
  type ActivityTypeFilter,
} from './project-activities-list-params';
import { useActivities } from './use-activities';

const PAGE_SIZE = 20;
const ALL = ACTIVITIES_FILTER_ALL;

interface ProjectActivitiesSectionProps {
  defaultProjectId?: string;
  lockProject?: boolean;
  hideProjectColumn?: boolean;
}

export function ProjectActivitiesSection({
  defaultProjectId,
  lockProject,
  hideProjectColumn,
}: ProjectActivitiesSectionProps) {
  const [q, setQ] = useState('');
  const [projectId, setProjectId] = useState<string | null>(defaultProjectId ?? null);
  const [assignedUserId, setAssignedUserId] = useState<string | null>(null);
  const [type, setType] = useState<ActivityTypeFilter>(ALL);
  const [completed, setCompleted] = useState<ActivityCompletedFilter>(ALL);
  const [dueFrom, setDueFrom] = useState('');
  const [dueTo, setDueTo] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);

  const projectOptions = useProjectOptions();
  const userOptions = useActiveUserOptions();

  const params = projectActivitiesListFiltersToParams({
    page,
    limit: PAGE_SIZE,
    q,
    projectId,
    defaultProjectId,
    assignedUserId,
    type,
    completed,
    dueFrom,
    dueTo,
  });
  const { data, isLoading, isError, error, refetch } = useActivities(params);

  const reset =
    <T,>(setter: (v: T) => void) =>
    (v: T) => {
      setter(v);
      setPage(1);
    };

  const activities = data?.items ?? [];
  const hasFilters =
    q.trim() !== '' ||
    Boolean(projectId) ||
    Boolean(assignedUserId) ||
    type !== ALL ||
    completed !== ALL ||
    Boolean(dueFrom) ||
    Boolean(dueTo);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (activity: Activity) => {
    setEditing(activity);
    setDialogOpen(true);
  };

  const createButton = (variant?: 'outline') => (
    <PermissionGate permission={PERMISSIONS.activities.create}>
      <Button onClick={openCreate} variant={variant}>
        <Plus />
        {strings.activities.create}
      </Button>
    </PermissionGate>
  );

  return (
    <div className="space-y-6">
      <FilterBar>
        <Input
          className="w-48"
          placeholder={strings.activities.searchPlaceholder}
          value={q}
          onChange={(e) => reset(setQ)(e.target.value)}
        />
        {!lockProject && (
          <Combobox
            className="w-48"
            options={projectOptions}
            value={projectId}
            onChange={reset(setProjectId)}
            placeholder={strings.activities.project}
            clearable
          />
        )}
        <Combobox
          className="w-44"
          options={userOptions}
          value={assignedUserId}
          onChange={reset(setAssignedUserId)}
          placeholder={strings.activities.assignedTo}
          clearable
        />
        <Select value={type} onValueChange={(v) => reset(setType)(v as typeof type)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder={strings.activities.type} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{strings.activities.type}</SelectItem>
            {ACTIVITY_TYPE_OPTIONS.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={completed}
          onValueChange={(v) => reset(setCompleted)(v as ActivityCompletedFilter)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder={strings.activities.filterCompleted} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{strings.activities.filterCompleted}</SelectItem>
            <SelectItem value="true">{strings.activities.completedYes}</SelectItem>
            <SelectItem value="false">{strings.activities.completedNo}</SelectItem>
          </SelectContent>
        </Select>
        <DateField
          className="w-40"
          value={dueFrom}
          onChange={(e) => reset(setDueFrom)(e.target.value)}
          aria-label={strings.activities.dueFrom}
          title={strings.activities.dueFrom}
        />
        <DateField
          className="w-40"
          value={dueTo}
          onChange={(e) => reset(setDueTo)(e.target.value)}
          aria-label={strings.activities.dueTo}
          title={strings.activities.dueTo}
        />
        <div className="ms-auto">{createButton()}</div>
      </FilterBar>

      {isLoading ? (
        <TableSkeleton rows={6} columns={7} />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : activities.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={strings.activities.emptyTitle}
          description={hasFilters ? strings.common.noResults : strings.activities.emptyHint}
          action={hasFilters ? undefined : createButton('outline')}
        />
      ) : (
        <>
          <ActivitiesTable
            activities={activities}
            onEdit={openEdit}
            hideProject={hideProjectColumn ?? Boolean(lockProject)}
          />
          <Pagination
            page={data?.page ?? 1}
            limit={data?.limit ?? PAGE_SIZE}
            total={data?.total ?? activities.length}
            onPageChange={setPage}
          />
        </>
      )}

      <ActivityFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        activity={editing}
        defaultProjectId={defaultProjectId ?? projectId ?? undefined}
        lockProject={lockProject}
      />
    </div>
  );
}
