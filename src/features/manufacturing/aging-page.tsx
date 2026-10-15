import { useMemo, useState } from 'react';

import { PageHeader } from '@/components/common/page-header';
import { FilterBar } from '@/components/common/filter-bar';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { TableSkeleton } from '@/components/feedback/skeletons';
import { Input } from '@/components/ui/input';
import { strings } from '@/constants/strings';

import { ManufacturingSubNav } from './manufacturing-sub-nav';
import { PendingManufacturingTable } from './pending-manufacturing-table';
import { usePortfolioManufacturingPending } from './use-manufacturing';

export function AgingPage() {
  const [minAging, setMinAging] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const { data, isLoading, isError, error, refetch } = usePortfolioManufacturingPending(true);

  const rows = useMemo(() => {
    const list = [...(data ?? [])].sort((a, b) => b.agingDays - a.agingDays);
    const min = minAging.trim() === '' ? null : Number(minAging);
    const projectQuery = projectSearch.trim().toLocaleLowerCase();
    return list.filter(
      (row) =>
        (min === null || !Number.isFinite(min) || row.agingDays >= min) &&
        (!projectQuery ||
          row.projectName.toLocaleLowerCase().includes(projectQuery) ||
          row.projectNumber?.toLocaleLowerCase().includes(projectQuery)),
    );
  }, [data, minAging, projectSearch]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={strings.manufacturing.agingTitle}
        description={strings.manufacturing.agingSubtitle}
      />
      <ManufacturingSubNav />

      <FilterBar>
        <div className="flex w-full max-w-md flex-col gap-1">
          <span className="text-xs text-muted-foreground">
            {strings.manufacturing.filterProject}
          </span>
          <Input
            value={projectSearch}
            onChange={(event) => setProjectSearch(event.target.value)}
            placeholder={strings.manufacturing.filterProjectPlaceholder}
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">
            {strings.manufacturing.filterMinAging}
          </span>
          <Input
            type="number"
            min={0}
            className="h-9 w-32"
            value={minAging}
            onChange={(e) => setMinAging(e.target.value)}
          />
        </div>
        <p className="self-end text-xs text-muted-foreground">
          {strings.manufacturing.sortByAging}
        </p>
      </FilterBar>

      {isLoading ? (
        <TableSkeleton rows={8} columns={11} />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState
          title={strings.manufacturing.emptyPending}
          description={strings.manufacturing.emptyPendingHint}
        />
      ) : (
        <PendingManufacturingTable rows={rows} showProject showAging />
      )}
    </div>
  );
}
