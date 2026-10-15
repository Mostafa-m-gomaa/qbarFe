import { Link } from 'react-router-dom';

import type { PendingManufacturingLineDto } from '@/api/manufacturing/manufacturing.types';
import { StatusChip } from '@/components/common/status-chip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { strings } from '@/constants/strings';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';

import { formatMeters } from './manufacturing.utils';

interface PendingManufacturingTableProps {
  rows: PendingManufacturingLineDto[];
  showProject?: boolean;
  showAging?: boolean;
}

export function PendingManufacturingTable({
  rows,
  showProject = true,
  showAging = false,
}: PendingManufacturingTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border/60">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            {showProject && (
              <>
                <TableHead>{strings.manufacturing.projectNumber}</TableHead>
                <TableHead>{strings.manufacturing.projectName}</TableHead>
              </>
            )}
            <TableHead>{strings.manufacturing.mcHash}</TableHead>
            <TableHead>{strings.manufacturing.clearanceDate}</TableHead>
            <TableHead>{strings.manufacturing.status}</TableHead>
            <TableHead>{strings.manufacturing.item}</TableHead>
            <TableHead>{strings.manufacturing.cleared}</TableHead>
            <TableHead>{strings.manufacturing.produced}</TableHead>
            <TableHead>{strings.manufacturing.pending}</TableHead>
            {showAging && <TableHead>{strings.manufacturing.agingDays}</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.lineId} className="hover:bg-muted/30">
              {showProject && (
                <>
                  <TableCell className="font-mono text-xs">
                    {row.projectNumber ?? strings.common.none}
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/app/projects/${row.projectId}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {row.projectName}
                    </Link>
                  </TableCell>
                </>
              )}
              <TableCell className="font-mono text-xs">{row.clearanceNumber}</TableCell>
              <TableCell>{formatDate(row.clearanceDate)}</TableCell>
              <TableCell>
                <StatusChip kind="manufacturingClearance" value={row.status} />
              </TableCell>
              <TableCell>{row.itemLabel}</TableCell>
              <TableCell>{formatMeters(row.cleared)}</TableCell>
              <TableCell>{formatMeters(row.produced)}</TableCell>
              <TableCell className="font-medium">{formatMeters(row.pending)}</TableCell>
              {showAging && (
                <TableCell
                  className={cn('tabular-nums', row.agingDays > 0 && 'font-semibold text-warning')}
                >
                  {row.agingDays}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
