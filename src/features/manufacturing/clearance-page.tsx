import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { FilterBar } from '@/components/common/filter-bar';
import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { TableSkeleton } from '@/components/feedback/skeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PERMISSIONS } from '@/constants/permissions';
import { strings } from '@/constants/strings';
import { usePermission } from '@/hooks/use-permission';

import { toastManufacturingError } from './manufacturing-errors';
import { ManufacturingSubNav } from './manufacturing-sub-nav';
import { formatMeters, parseDecimalQuantity } from './manufacturing.utils';
import {
  useCreateManufacturingClearance,
  useManufacturingClearancePortfolio,
} from './use-manufacturing';

export function ClearancePage() {
  const [clearNowByItemId, setClearNowByItemId] = useState<Record<string, string>>({});
  const [projectSearch, setProjectSearch] = useState('');

  const canCreate = usePermission(PERMISSIONS.projects.update);
  const portfolio = useManufacturingClearancePortfolio();
  const createClearance = useCreateManufacturingClearance();

  const availableRows = useMemo(() => {
    const query = projectSearch.trim().toLocaleLowerCase();
    return (portfolio.data ?? []).flatMap(({ project, items: projectItems }) =>
      projectItems
        .filter(
          () =>
            !query ||
            project.name.toLocaleLowerCase().includes(query) ||
            project.number?.toLocaleLowerCase().includes(query),
        )
        .map((item) => ({ project, item })),
    );
  }, [portfolio.data, projectSearch]);

  const submit = (projectId: string, itemId: string, availableCleared: string) => {
    if (!canCreate) return;
    const cleared = (clearNowByItemId[itemId] ?? '').trim();
    const clearedQuantity = parseDecimalQuantity(cleared);
    const availableQuantity = parseDecimalQuantity(availableCleared);
    if (clearedQuantity === null || clearedQuantity <= 0) {
      toast.error(strings.manufacturing.noLinesToClear);
      return;
    }
    if (availableQuantity !== null && clearedQuantity > availableQuantity) {
      toast.error(strings.manufacturing.clearanceExceedsAvailable(availableCleared));
      return;
    }
    createClearance.mutate(
      {
        projectId,
        body: {
          lines: [{ projectItemId: itemId, cleared }],
        },
      },
      {
        onSuccess: () => {
          toast.success(strings.manufacturing.createdMc);
          setClearNowByItemId((previous) => ({ ...previous, [itemId]: '' }));
        },
        onError: toastManufacturingError,
      },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={strings.manufacturing.clearanceTitle}
        description={strings.manufacturing.clearanceSubtitle}
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
        <TableSkeleton rows={6} columns={5} />
      ) : portfolio.isError ? (
        <ErrorState error={portfolio.error} onRetry={() => void portfolio.refetch()} />
      ) : availableRows.length === 0 ? (
        <EmptyState
          title={strings.manufacturing.noAvailableClearance}
          description={strings.manufacturing.noAvailableClearanceHint}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>{strings.manufacturing.projectNumber}</TableHead>
                <TableHead>{strings.manufacturing.projectName}</TableHead>
                <TableHead>{strings.manufacturing.item}</TableHead>
                <TableHead>{strings.manufacturing.required}</TableHead>
                <TableHead>{strings.manufacturing.alreadyCleared}</TableHead>
                <TableHead>{strings.manufacturing.available}</TableHead>
                <TableHead>{strings.manufacturing.clearNow}</TableHead>
                <TableHead>{strings.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {availableRows.map(({ project, item }) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">
                    {project.number ?? strings.common.none}
                  </TableCell>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{item.label}</TableCell>
                  <TableCell>{formatMeters(item.meters)}</TableCell>
                  <TableCell>{formatMeters(item.allocatedCleared)}</TableCell>
                  <TableCell>{formatMeters(item.availableCleared)}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      max={item.availableCleared}
                      step="any"
                      className="h-8 w-28 tabular-nums"
                      value={clearNowByItemId[item.id] ?? ''}
                      onChange={(event) =>
                        setClearNowByItemId((previous) => ({
                          ...previous,
                          [item.id]: event.target.value,
                        }))
                      }
                      disabled={!canCreate}
                    />
                  </TableCell>
                  <TableCell className="text-end">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => submit(project.id, item.id, item.availableCleared)}
                      disabled={!canCreate || createClearance.isPending}
                    >
                      {strings.manufacturing.startClearance}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
