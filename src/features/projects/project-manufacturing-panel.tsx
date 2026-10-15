import { Factory, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { StatusChip } from '@/components/common/status-chip';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { TableSkeleton } from '@/components/feedback/skeletons';
import { Button } from '@/components/ui/button';
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
import { formatMeters, scaledToMetersString } from '@/features/manufacturing/manufacturing.utils';
import {
  useManufacturingClearances,
  useProjectManufacturingSummary,
} from '@/features/manufacturing/use-manufacturing';
import { usePermission } from '@/hooks/use-permission';
import { formatDate, formatPercent } from '@/lib/format';

const MINI_TABLE_LIMIT = 5;

interface ProjectManufacturingPanelProps {
  projectId: string;
}

function KpiTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function ProjectManufacturingPanel({ projectId }: ProjectManufacturingPanelProps) {
  const canUpdate = usePermission(PERMISSIONS.projects.update);
  const summaryQuery = useProjectManufacturingSummary(projectId);
  const clearancesQuery = useManufacturingClearances(projectId);

  const summary = summaryQuery.data;
  const clearances = (clearancesQuery.data ?? []).slice(0, MINI_TABLE_LIMIT);
  const detailTableWrap = 'overflow-x-auto rounded-xl border border-border/60 bg-background/50';

  const loading = summaryQuery.isLoading || clearancesQuery.isLoading;
  const error = summaryQuery.error ?? clearancesQuery.error;

  if (loading) return <TableSkeleton rows={4} columns={5} />;
  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={() => {
          void summaryQuery.refetch();
          void clearancesQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-end gap-2">
        {canUpdate && (
          <Button size="sm" variant="outline" asChild>
            <Link to={`/app/manufacturing/clearance?projectId=${projectId}`}>
              <Plus />
              {strings.projects.manufacturingNewClearance}
            </Link>
          </Button>
        )}
        <Button size="sm" variant="outline" asChild>
          <Link to={`/app/manufacturing/production?projectId=${projectId}`}>
            <Factory />
            {strings.projects.manufacturingViewProduction}
          </Link>
        </Button>
      </div>

      {summary && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <KpiTile
            label={strings.projects.manufacturingKpiCleared}
            value={formatMeters(scaledToMetersString(summary.clearedQuantityScaled))}
          />
          <KpiTile
            label={strings.projects.manufacturingKpiProduced}
            value={formatMeters(scaledToMetersString(summary.producedQuantityScaled))}
          />
          <KpiTile
            label={strings.projects.manufacturingKpiReady}
            value={formatMeters(scaledToMetersString(summary.readyQuantityScaled))}
          />
          <KpiTile
            label={strings.projects.manufacturingKpiPending}
            value={formatMeters(summary.pendingProduction)}
          />
          <KpiTile
            label={strings.projects.manufacturingKpiCompletion}
            value={formatPercent(summary.manufacturingCompletionPercent)}
          />
        </div>
      )}

      {clearances.length === 0 ? (
        <EmptyState title={strings.projects.manufacturingNoClearances} />
      ) : (
        <div className={detailTableWrap}>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>{strings.manufacturing.mcHash}</TableHead>
                <TableHead>{strings.manufacturing.clearanceDate}</TableHead>
                <TableHead>{strings.manufacturing.status}</TableHead>
                <TableHead>{strings.manufacturing.pending}</TableHead>
                <TableHead>{strings.manufacturing.agingDays}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clearances.map((mc) => (
                <TableRow key={mc.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-xs">{mc.number}</TableCell>
                  <TableCell>{formatDate(mc.clearanceDate)}</TableCell>
                  <TableCell>
                    <StatusChip kind="manufacturingClearance" value={mc.status} />
                  </TableCell>
                  <TableCell>{formatMeters(mc.pendingMeters)}</TableCell>
                  <TableCell>{mc.agingDays}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
