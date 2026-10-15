import { Plus, Target } from 'lucide-react';
import { useState } from 'react';

import { Combobox } from '@/components/common/combobox';
import { ContractorCombobox } from '@/features/contractors/contractor-combobox';
import { FilterBar } from '@/components/common/filter-bar';
import { PageHeader } from '@/components/common/page-header';
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
import { useActiveUserOptions } from '@/features/crm/lookups';

import {
  OPPORTUNITIES_FILTER_ALL,
  opportunitiesListFiltersToParams,
  type OpportunityLifecycleFilter,
  type OpportunityStatusFilter,
  type OpportunityTypeFilter,
} from './opportunities-list-params';
import { OpportunityFormDialog } from './opportunity-form-dialog';
import { OpportunitiesTable } from './opportunities-table';
import { useOpportunities } from './use-opportunities';

const PAGE_SIZE = 20;
const ALL = OPPORTUNITIES_FILTER_ALL;

export function OpportunitiesPage() {
  const [q, setQ] = useState('');
  const [contractorId, setContractorId] = useState<string | null>(null);
  const [type, setType] = useState<OpportunityTypeFilter>(ALL);
  const [status, setStatus] = useState<OpportunityStatusFilter>(ALL);
  const [salesOwnerId, setSalesOwnerId] = useState<string | null>(null);
  const [lifecycle, setLifecycle] = useState<OpportunityLifecycleFilter>(ALL);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);

  const userOptions = useActiveUserOptions();

  const params = opportunitiesListFiltersToParams({
    page,
    limit: PAGE_SIZE,
    q,
    contractorId,
    type,
    status,
    salesOwnerId,
    lifecycle,
  });
  const { data, isLoading, isError, error, refetch } = useOpportunities(params);

  const reset = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(1);
  };

  const opportunities = data?.items ?? [];
  const hasFilters =
    q.trim() !== '' ||
    Boolean(contractorId) ||
    type !== ALL ||
    status !== ALL ||
    Boolean(salesOwnerId) ||
    lifecycle !== ALL;

  const createButton = (variant?: 'outline') => (
    <PermissionGate permission={PERMISSIONS.opportunities.create}>
      <Button onClick={() => setDialogOpen(true)} variant={variant}>
        <Plus />
        {strings.opportunities.create}
      </Button>
    </PermissionGate>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={strings.opportunities.title}
        description={strings.opportunities.subtitle}
        actions={createButton()}
      />

      <FilterBar>
        <Input
          className="w-48"
          placeholder={strings.opportunities.searchPlaceholder}
          value={q}
          onChange={(e) => reset(setQ)(e.target.value)}
        />
        <ContractorCombobox
          className="w-48"
          value={contractorId}
          onChange={reset(setContractorId)}
          placeholder={strings.opportunities.contractor}
        />
        <Select value={type} onValueChange={(v) => reset(setType)(v as typeof type)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder={strings.opportunities.type} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{strings.opportunities.type}</SelectItem>
            <SelectItem value="Tender">Tender</SelectItem>
            <SelectItem value="In Hand">In Hand</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => reset(setStatus)(v as typeof status)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={strings.opportunities.status} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{strings.opportunities.status}</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="Tender Closed">Tender Closed</SelectItem>
            <SelectItem value="Won">Won</SelectItem>
            <SelectItem value="Lost">Lost</SelectItem>
          </SelectContent>
        </Select>
        <Combobox
          className="w-44"
          options={userOptions}
          value={salesOwnerId}
          onChange={reset(setSalesOwnerId)}
          placeholder={strings.opportunities.salesOwner}
        />
        <Select value={lifecycle} onValueChange={(v) => reset(setLifecycle)(v as typeof lifecycle)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder={strings.opportunities.lifecycle} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{strings.opportunities.lifecycle}</SelectItem>
            <SelectItem value="active">{strings.common.active}</SelectItem>
            <SelectItem value="archived">{strings.common.archived}</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>
      {contractorId ? (
        <p className="text-xs text-muted-foreground">{strings.opportunities.filterContractorHint}</p>
      ) : null}

      {isLoading ? (
        <TableSkeleton rows={6} columns={6} />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : opportunities.length === 0 ? (
        <EmptyState
          icon={Target}
          title={strings.opportunities.emptyTitle}
          description={hasFilters ? strings.common.noResults : strings.opportunities.emptyHint}
          action={hasFilters ? undefined : createButton('outline')}
        />
      ) : (
        <>
          <OpportunitiesTable opportunities={opportunities} />
          <Pagination
            page={data?.page ?? 1}
            limit={data?.limit ?? PAGE_SIZE}
            total={data?.total ?? opportunities.length}
            onPageChange={setPage}
          />
        </>
      )}

      <OpportunityFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
