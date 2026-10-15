import { useMemo, useState } from 'react';

import { FilterBar } from '@/components/common/filter-bar';
import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { PageSkeleton } from '@/components/feedback/skeletons';
import { Input } from '@/components/ui/input';

import { strings } from '@/constants/strings';

import { ManufacturingSubNav } from './manufacturing-sub-nav';
import { ProductionClearanceCard } from './production-clearance-card';
import { useManufacturingProductionPortfolio } from './use-manufacturing';

export function ProductionPage() {
  const [projectSearch, setProjectSearch] = useState('');
  const portfolio = useManufacturingProductionPortfolio();

  const entries = useMemo(() => {
    const query = projectSearch.trim().toLocaleLowerCase();
    return (portfolio.data ?? []).filter(
      ({ project }) =>
        !query ||
        project.name.toLocaleLowerCase().includes(query) ||
        project.number?.toLocaleLowerCase().includes(query),
    );
  }, [portfolio.data, projectSearch]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={strings.manufacturing.productionTitle}
        description={strings.manufacturing.productionSubtitle}
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

      {portfolio.isLoading ? (
        <PageSkeleton />
      ) : portfolio.isError ? (
        <ErrorState error={portfolio.error} onRetry={() => void portfolio.refetch()} />
      ) : entries.length === 0 ? (
        <EmptyState
          title={strings.manufacturing.emptyClearances}
          description={strings.manufacturing.emptyClearancesHint}
        />
      ) : (
        <div className="space-y-6">
          {entries.map(({ project, clearances }) => (
            <section key={project.id} className="space-y-3">
              <div>
                <h2 className="text-lg font-semibold">{project.name}</h2>
                <p className="font-mono text-xs text-muted-foreground">
                  {project.number ?? strings.common.none}
                </p>
              </div>
              {clearances.map((clearance) => (
                <ProductionClearanceCard
                  key={clearance.id}
                  clearance={clearance}
                  projectId={project.id}
                />
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
