import type { Quotation } from '@/api/quotations/quotations.types';
import { ActorLabel } from '@/components/common/actor-label';
import { MoneyText } from '@/components/common/money-text';
import { StatusChip } from '@/components/common/status-chip';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { strings } from '@/constants/strings';
import { formatDate, formatDateTime } from '@/lib/format';

interface RevisionHistoryDialogProps {
  quotation: Quotation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectRev: (rev: number) => void;
}

export function RevisionHistoryDialog({
  quotation,
  open,
  onOpenChange,
  onSelectRev,
}: RevisionHistoryDialogProps) {
  const rows = [...quotation.revisions].sort((a, b) => b.rev - a.rev);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{strings.quotations.revisionHistory}</DialogTitle>
        </DialogHeader>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rev</TableHead>
                <TableHead>{strings.common.status}</TableHead>
                <TableHead>{strings.quotations.quotationDate}</TableHead>
                <TableHead>{strings.quotations.issuedBy}</TableHead>
                <TableHead>{strings.quotations.grandTotal}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.rev}>
                  <TableCell>Rev {r.rev}</TableCell>
                  <TableCell>
                    <StatusChip kind="quotationStatus" value={r.status} />
                  </TableCell>
                  <TableCell>{formatDate(r.date)}</TableCell>
                  <TableCell>
                    {r.issuedByUser || r.issuedBy ? (
                      <ActorLabel user={r.issuedByUser} fallbackUserId={r.issuedBy ?? undefined} />
                    ) : (
                      strings.common.none
                    )}
                    {r.issuedAt && (
                      <span className="block text-xs text-muted-foreground">
                        {formatDateTime(r.issuedAt)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <MoneyText
                      amountMinor={r.totals.grandAmountMinor}
                      currencyCode={r.currencyCode}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onSelectRev(r.rev);
                        onOpenChange(false);
                      }}
                    >
                      {strings.common.view}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {strings.common.close}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
