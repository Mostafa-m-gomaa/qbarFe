import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import type {
  ManufacturingClearanceDto,
  ManufacturingClearanceLineDto,
} from '@/api/manufacturing/manufacturing.types';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { StatusChip } from '@/components/common/status-chip';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { formatDate } from '@/lib/format';

import { toastManufacturingError } from './manufacturing-errors';
import { formatDecimalQuantity, formatMeters, isClearanceReadOnly } from './manufacturing.utils';
import {
  useCloseManufacturingClearance,
  useMarkClearanceFullyProduced,
  useUpdateManufacturingClearanceLine,
} from './use-manufacturing';

interface ProductionClearanceCardProps {
  clearance: ManufacturingClearanceDto;
  projectId: string;
}

function ProductionLineRow({
  line,
  readOnly,
  projectId,
  clearanceId,
}: {
  line: ManufacturingClearanceLineDto;
  readOnly: boolean;
  projectId: string;
  clearanceId: string;
}) {
  const updateLine = useUpdateManufacturingClearanceLine();
  const serverProduced = formatDecimalQuantity(line.produced);
  const serverReady = formatDecimalQuantity(line.ready);
  const [produced, setProduced] = useState(serverProduced);
  const [ready, setReady] = useState(serverReady);

  useEffect(() => {
    setProduced(serverProduced);
    setReady(serverReady);
  }, [serverProduced, serverReady]);

  const changed = produced !== serverProduced || ready !== serverReady;

  const save = () => {
    if (readOnly || !changed) return;
    updateLine.mutate(
      {
        projectId,
        clearanceId,
        lineId: line.id,
        body: { produced, ready },
      },
      {
        onSuccess: () => toast.success(strings.manufacturing.lineSaved),
        onError: (e) => toastManufacturingError(e),
      },
    );
  };

  return (
    <TableRow>
      <TableCell>{line.label}</TableCell>
      <TableCell>{formatMeters(line.required)}</TableCell>
      <TableCell>{formatMeters(line.cleared)}</TableCell>
      <TableCell>
        {readOnly ? (
          formatMeters(line.produced)
        ) : (
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min="0"
              step="any"
              className="h-8 w-24 tabular-nums"
              value={produced}
              onChange={(event) => setProduced(event.target.value)}
              disabled={updateLine.isPending}
            />
            <span className="text-xs text-muted-foreground">m</span>
          </div>
        )}
      </TableCell>
      <TableCell>
        {readOnly ? (
          formatMeters(line.ready)
        ) : (
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min="0"
              step="any"
              className="h-8 w-24 tabular-nums"
              value={ready}
              onChange={(event) => setReady(event.target.value)}
              disabled={updateLine.isPending}
            />
            <span className="text-xs text-muted-foreground">m</span>
          </div>
        )}
      </TableCell>
      <TableCell>{formatMeters(line.pending)}</TableCell>
      <TableCell className="text-end">
        {!readOnly && (
          <Button size="sm" onClick={save} disabled={!changed || updateLine.isPending}>
            {strings.manufacturing.saveProduction}
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}

export function ProductionClearanceCard({ clearance, projectId }: ProductionClearanceCardProps) {
  const canUpdate = usePermission(PERMISSIONS.projects.update);
  const readOnly = isClearanceReadOnly(clearance.status) || !canUpdate;

  const markProduced = useMarkClearanceFullyProduced();
  const closeClearance = useCloseManufacturingClearance();
  const [closeOpen, setCloseOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">
            {clearance.number}
            <span className="ms-2 font-normal text-muted-foreground">
              {formatDate(clearance.clearanceDate)}
            </span>
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <StatusChip kind="manufacturingClearance" value={clearance.status} />
            <span>
              {strings.manufacturing.agingDays}: {clearance.agingDays}
            </span>
            <span>
              {strings.manufacturing.pending}: {formatMeters(clearance.pendingMeters)}
            </span>
          </div>
        </div>
        {!readOnly && (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={markProduced.isPending}
              onClick={() =>
                markProduced.mutate(
                  { projectId, clearanceId: clearance.id },
                  {
                    onSuccess: () => toast.success(strings.manufacturing.markFullyProducedSuccess),
                    onError: toastManufacturingError,
                  },
                )
              }
            >
              {strings.manufacturing.markFullyProduced}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={closeClearance.isPending}
              onClick={() => setCloseOpen(true)}
            >
              {strings.manufacturing.closeClearance}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto rounded-lg border border-border/60">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>{strings.manufacturing.item}</TableHead>
                <TableHead>{strings.manufacturing.required}</TableHead>
                <TableHead>{strings.manufacturing.cleared}</TableHead>
                <TableHead>{strings.manufacturing.produced}</TableHead>
                <TableHead>{strings.manufacturing.ready}</TableHead>
                <TableHead>{strings.manufacturing.pending}</TableHead>
                <TableHead>{strings.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clearance.lines.map((line) => (
                <ProductionLineRow
                  key={line.id}
                  line={line}
                  readOnly={readOnly}
                  projectId={projectId}
                  clearanceId={clearance.id}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <ConfirmDialog
        open={closeOpen}
        onOpenChange={setCloseOpen}
        title={strings.manufacturing.closeClearanceTitle}
        description={strings.manufacturing.closeClearanceBody(clearance.number)}
        confirmLabel={strings.manufacturing.closeClearance}
        loading={closeClearance.isPending}
        onConfirm={() =>
          closeClearance.mutate(
            { projectId, clearanceId: clearance.id },
            {
              onSuccess: () => {
                toast.success(strings.manufacturing.closeClearanceSuccess);
                setCloseOpen(false);
              },
              onError: toastManufacturingError,
            },
          )
        }
      />
    </Card>
  );
}
