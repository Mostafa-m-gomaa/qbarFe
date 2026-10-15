import { useNavigate } from 'react-router-dom';

import type { Quotation } from '@/api/quotations/quotations.types';
import { ActorLabel } from '@/components/common/actor-label';
import { MoneyText } from '@/components/common/money-text';
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
import { useContractorMap } from '@/features/crm/lookups';
import { opportunityDisplayName } from '@/features/opportunities/opportunity-label';
import { QuotationListRowActions } from '@/features/quotations/quotation-list-row-actions';
import {
  dedupeQuotations,
  resolveListRevision,
} from '@/features/quotations/quotation-revision.utils';
import { formatDateTime } from '@/lib/format';

interface QuotationsTableProps {
  quotations: Quotation[];
}

export function QuotationsTable({ quotations }: QuotationsTableProps) {
  const navigate = useNavigate();
  const contractorMap = useContractorMap();
  // One row per quotation: collapse any duplicate entries to the latest revision.
  const rows = dedupeQuotations(quotations);

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{strings.quotations.reference}</TableHead>
            <TableHead>{strings.quotations.contractor}</TableHead>
            <TableHead>{strings.quotations.opportunity}</TableHead>
            <TableHead>{strings.quotations.salesOwner}</TableHead>
            <TableHead>{strings.quotations.currency}</TableHead>
            <TableHead>{strings.common.status}</TableHead>
            <TableHead>{strings.quotations.commercialStatus}</TableHead>
            <TableHead>{strings.quotations.currentRevision}</TableHead>
            <TableHead>{strings.quotations.createdBy}</TableHead>
            <TableHead>{strings.quotations.createdAt}</TableHead>
            <TableHead>{strings.quotations.updatedAt}</TableHead>
            <TableHead className="num">{strings.quotations.grandTotal}</TableHead>
            <TableHead>{strings.common.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((q) => {
            const rev = resolveListRevision(q);
            const contractor =
              q.contractor?.company ?? contractorMap.get(q.contractorId) ?? q.contractorId;
            const oppLabel = opportunityDisplayName(q.opportunity ?? undefined);
            return (
              <TableRow
                key={q.id}
                className="cursor-pointer"
                onClick={() => navigate(`/app/quotations/${q.id}`)}
              >
                <TableCell className="font-medium">{q.ref}</TableCell>
                <TableCell>{contractor}</TableCell>
                <TableCell className="text-muted-foreground">{oppLabel}</TableCell>
                <TableCell className="text-muted-foreground">
                  <ActorLabel user={q.salesOwnerUser} fallbackUserId={q.salesOwnerId} />
                </TableCell>
                <TableCell>{q.currencyCode}</TableCell>
                <TableCell>
                  <StatusChip kind="quotationStatus" value={q.status} />
                </TableCell>
                <TableCell>
                  <StatusChip
                    kind="quotationCommercialStatus"
                    value={q.commercialStatus}
                    className="whitespace-nowrap"
                  />
                </TableCell>
                <TableCell>
                  Rev {rev.rev}{' '}
                  <span className="text-xs text-muted-foreground">({rev.status})</span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <ActorLabel user={q.createdByUser} fallbackUserId={q.createdBy} />
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDateTime(q.createdAt)}</TableCell>
                <TableCell className="text-muted-foreground">{formatDateTime(q.updatedAt)}</TableCell>
                <TableCell className="num font-medium">
                  <MoneyText
                    amountMinor={rev.totals.grandAmountMinor}
                    currencyCode={rev.currencyCode}
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap align-top">
                  <QuotationListRowActions quotation={q} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
