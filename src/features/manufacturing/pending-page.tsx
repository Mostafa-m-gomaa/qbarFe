import { useMemo, useState } from 'react';

import { FilterBar } from '@/components/common/filter-bar';
import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { TableSkeleton } from '@/components/feedback/skeletons';
import { Input } from '@/components/ui/input';
import { strings } from '@/constants/strings';

import { ManufacturingSubNav } from './manufacturing-sub-nav';
import { PendingManufacturingTable } from './pending-manufacturing-table';
import { usePortfolioManufacturingPending } from './use-manufacturing';

export function PendingPage() {
  const [projectSearch, setProjectSearch] = useState('');
  const { data, isLoading, isError, error, refetch } = usePortfolioManufacturingPending(true);
  const rows = useMemo(() => {
    const query = projectSearch.trim().toLocaleLowerCase();
    return (data ?? []).filter(
      (row) =>
        !query ||
        row.projectName.toLocaleLowerCase().includes(query) ||
        row.projectNumber?.toLocaleLowerCase().includes(query),
    );
  }, [data, projectSearch]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={strings.manufacturing.pendingTitle}
        description={strings.manufacturing.pendingSubtitle}
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
      </FilterBar>

      {isLoading ? (
        <TableSkeleton rows={8} columns={10} />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState
          title={strings.manufacturing.emptyPending}
          description={strings.manufacturing.emptyPendingHint}
        />
      ) : (
        <PendingManufacturingTable rows={rows} showProject showAging={false} />
      )}
    </div>
  );
}
