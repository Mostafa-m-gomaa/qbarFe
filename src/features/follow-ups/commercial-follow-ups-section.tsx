import { CalendarClock, Plus } from 'lucide-react';
import { useState } from 'react';

import type { FollowUp, FollowUpDueFilter, FollowUpStatus } from '@/api/follow-ups/follow-ups.types';
import { Combobox } from '@/components/common/combobox';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PERMISSIONS } from '@/constants/permissions';
import { strings } from '@/constants/strings';
import { useActiveUserOptions } from '@/features/crm/lookups';
import { OpportunityCombobox } from '@/features/opportunities/opportunity-combobox';
import { FOLLOW_UP_TYPE_OPTIONS } from '@/features/follow-ups/follow-up.schema';

import { FollowUpFormDialog } from './follow-up-form-dialog';
import { FollowUpsTable } from './follow-ups-table';
import { useFollowUps } from './use-follow-ups';

const PAGE_SIZE = 20;
const ALL = 'all';

type DueTab = typeof ALL | FollowUpDueFilter;

interface CommercialFollowUpsSectionProps {
  defaultOpportunityId?: string;
  lockOpportunity?: boolean;
  defaultQuotationId?: string;
  lockQuotation?: boolean;
  hideOpportunityColumn?: boolean;
}

export function CommercialFollowUpsSection({
  defaultOpportunityId,
  lockOpportunity,
  defaultQuotationId,
  lockQuotation,
  hideOpportunityColumn,
}: CommercialFollowUpsSectionProps) {
  const [dueTab, setDueTab] = useState<DueTab>(ALL);
  const [status, setStatus] = useState<FollowUpStatus | typeof ALL>(ALL);
  const [type, setType] = useState<(typeof FOLLOW_UP_TYPE_OPTIONS)[number] | typeof ALL>(ALL);
  const [assignedToId, setAssignedToId] = useState<string | null>(null);
  const [opportunityId, setOpportunityId] = useState<string | null>(
    defaultOpportunityId ?? null,
  );
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FollowUp | null>(null);

  const userOptions = useActiveUserOptions();

  const listParams = {
    page,
    limit: PAGE_SIZE,
    sortBy: 'dueAt' as const,
    sortOrder: 'asc' as const,
    ...(status === ALL ? {} : { status }),
    ...(type === ALL ? {} : { type }),
    ...(assignedToId ? { assignedToId } : {}),
    ...(opportunityId || defaultOpportunityId
      ? { opportunityId: opportunityId ?? defaultOpportunityId }
      : {}),
    ...(dueTab === ALL ? {} : { due: dueTab }),
    ...(search.trim() ? { q: search.trim() } : {}),
  };

  const { data, isLoading, isError, error, refetch } = useFollowUps(listParams);

  const kpiOverdue = useFollowUps({ due: 'overdue', limit: 1, page: 1, status: 'open' });
  const kpiToday = useFollowUps({ due: 'today', limit: 1, page: 1, status: 'open' });
  const kpiNext7 = useFollowUps({ due: 'next7days', limit: 1, page: 1, status: 'open' });

  const resetPage =
    <T,>(setter: (v: T) => void) =>
    (v: T) => {
      setter(v);
      setPage(1);
    };

  const items = data?.items ?? [];
  const hasFilters =
    dueTab !== ALL ||
    status !== ALL ||
    type !== ALL ||
    Boolean(assignedToId) ||
    Boolean(opportunityId) ||
    Boolean(search);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (fu: FollowUp) => {
    setEditing(fu);
    setDialogOpen(true);
  };

  const createButton = (variant?: 'outline') => (
    <PermissionGate permission={PERMISSIONS.followUps.create}>
      <Button onClick={openCreate} variant={variant}>
        <Plus />
        {strings.followUps.create}
      </Button>
    </PermissionGate>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard
          label={strings.followUps.kpiOverdue}
          value={kpiOverdue.data?.total ?? 0}
          variant="warning"
          active={dueTab === 'overdue'}
          onClick={() => resetPage(setDueTab)('overdue')}
        />
        <KpiCard
          label={strings.followUps.kpiToday}
          value={kpiToday.data?.total ?? 0}
          active={dueTab === 'today'}
          onClick={() => resetPage(setDueTab)('today')}
        />
        <KpiCard
          label={strings.followUps.kpiNext7}
          value={kpiNext7.data?.total ?? 0}
          active={dueTab === 'next7days'}
          onClick={() => resetPage(setDueTab)('next7days')}
        />
      </div>

      <Tabs
        value={dueTab}
        onValueChange={(v) => resetPage(setDueTab)(v as DueTab)}
      >
        <TabsList>
          <TabsTrigger value={ALL}>{strings.followUps.dueAll}</TabsTrigger>
          <TabsTrigger value="overdue">{strings.followUps.dueOverdue}</TabsTrigger>
          <TabsTrigger value="today">{strings.followUps.dueToday}</TabsTrigger>
          <TabsTrigger value="next7days">{strings.followUps.dueNext7}</TabsTrigger>
        </TabsList>
      </Tabs>

      <FilterBar>
        <Input
          className="w-52"
          placeholder={strings.followUps.searchPlaceholder}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') resetPage(setSearch)(q);
          }}
        />
        <Button variant="secondary" onClick={() => resetPage(setSearch)(q)}>
          {strings.common.search}
        </Button>
        {!lockOpportunity && (
          <OpportunityCombobox
            className="w-56"
            value={opportunityId}
            onChange={resetPage(setOpportunityId)}
            placeholder={strings.followUps.selectOpportunity}
            clearable
          />
        )}
        <Combobox
          className="w-44"
          options={userOptions}
          value={assignedToId}
          onChange={resetPage(setAssignedToId)}
          placeholder={strings.followUps.assignedTo}
          clearable
        />
        <Select
          value={status}
          onValueChange={(v) => resetPage(setStatus)(v as typeof status)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder={strings.followUps.filterStatus} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{strings.followUps.filterStatus}</SelectItem>
            <SelectItem value="open">{strings.followUps.status}: open</SelectItem>
            <SelectItem value="completed">completed</SelectItem>
            <SelectItem value="cancelled">cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={(v) => resetPage(setType)(v as typeof type)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder={strings.followUps.type} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{strings.followUps.type}</SelectItem>
            {FOLLOW_UP_TYPE_OPTIONS.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ms-auto">{createButton()}</div>
      </FilterBar>

      {isLoading ? (
        <TableSkeleton rows={6} columns={8} />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title={strings.followUps.emptyTitle}
          description={hasFilters ? strings.common.noResults : strings.followUps.emptyHint}
          action={hasFilters ? undefined : createButton('outline')}
        />
      ) : (
        <>
          <FollowUpsTable
            followUps={items}
            onEdit={openEdit}
            hideOpportunity={hideOpportunityColumn ?? Boolean(lockOpportunity)}
          />
          <Pagination
            page={data?.page ?? 1}
            limit={data?.limit ?? PAGE_SIZE}
            total={data?.total ?? items.length}
            onPageChange={setPage}
          />
        </>
      )}

      <FollowUpFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        followUp={editing}
        defaultOpportunityId={defaultOpportunityId ?? opportunityId ?? undefined}
        lockOpportunity={lockOpportunity}
        defaultQuotationId={defaultQuotationId}
        lockQuotation={lockQuotation}
      />
    </div>
  );
}

function KpiCard({
  label,
  value,
  variant,
  active,
  onClick,
}: {
  label: string;
  value: number;
  variant?: 'warning';
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border bg-card p-4 text-start transition-colors hover:bg-muted/40 ${
        active ? 'border-primary ring-1 ring-primary/30' : 'border-border'
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={`mt-1 text-2xl font-semibold tabular-nums ${
          variant === 'warning' && value > 0 ? 'text-amber-600 dark:text-amber-400' : ''
        }`}
      >
        {value}
      </p>
    </button>
  );
}
