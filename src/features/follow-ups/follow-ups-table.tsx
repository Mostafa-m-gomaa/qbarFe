import { Link } from 'react-router-dom';

import type { FollowUp } from '@/api/follow-ups/follow-ups.types';
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
import { useContractorMap, useUserMap } from '@/features/crm/lookups';
import { opportunityDisplayName } from '@/features/opportunities/opportunity-label';
import { formatDateTime } from '@/lib/format';

import { FollowUpRowActions } from './follow-up-row-actions';

interface FollowUpsTableProps {
  followUps: FollowUp[];
  onEdit: (followUp: FollowUp) => void;
  hideOpportunity?: boolean;
}

export function FollowUpsTable({ followUps, onEdit, hideOpportunity }: FollowUpsTableProps) {
  const contractorMap = useContractorMap();
  const userMap = useUserMap();

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {!hideOpportunity && <TableHead>{strings.followUps.opportunity}</TableHead>}
            <TableHead>{strings.followUps.title}</TableHead>
            <TableHead>{strings.followUps.type}</TableHead>
            <TableHead>{strings.followUps.quotation}</TableHead>
            <TableHead>{strings.followUps.dueAt}</TableHead>
            <TableHead>{strings.followUps.dueState}</TableHead>
            <TableHead>{strings.followUps.assignedTo}</TableHead>
            <TableHead>{strings.followUps.status}</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {followUps.map((fu) => {
            const oppLabel = opportunityDisplayName(fu.opportunity ?? undefined);
            const quotationLabel = fu.quotation
              ? (() => {
                  const company =
                    fu.quotation.contractor?.company ??
                    (fu.quotation.contractorId
                      ? contractorMap.get(fu.quotation.contractorId) ?? fu.quotation.contractorId
                      : null);
                  return company ? `${fu.quotation.ref} — ${company}` : fu.quotation.ref;
                })()
              : strings.followUps.noQuotation;
            return (
              <TableRow key={fu.id}>
                {!hideOpportunity && (
                  <TableCell className="font-medium">
                    <Link to={`/app/opportunities/${fu.opportunityId}`} className="hover:underline">
                      {oppLabel}
                    </Link>
                  </TableCell>
                )}
                <TableCell>{fu.title}</TableCell>
                <TableCell>
                  <StatusChip kind="activityType" value={fu.type} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {fu.quotation ? (
                    <Link to={`/app/quotations/${fu.quotation.id}`} className="hover:underline">
                      {quotationLabel}
                    </Link>
                  ) : (
                    strings.followUps.noQuotation
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDateTime(fu.dueAt)}</TableCell>
                <TableCell>
                  {fu.status === 'open' ? (
                    <StatusChip kind="followUpDueState" value={fu.dueState} />
                  ) : (
                    <StatusChip kind="followUpDueState" value="none" />
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {fu.assignedToUser?.name ??
                    userMap.get(fu.assignedToId)?.name ??
                    fu.assignedToId}
                </TableCell>
                <TableCell>
                  <StatusChip kind="followUpStatus" value={fu.status} />
                </TableCell>
                <TableCell>
                  <FollowUpRowActions followUp={fu} onEdit={onEdit} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
