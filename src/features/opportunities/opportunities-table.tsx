import { useNavigate } from 'react-router-dom';

import type { Opportunity } from '@/api/opportunities/opportunities.types';
import { ActorLabel } from '@/components/common/actor-label';
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

import { OpportunityActions } from './opportunity-actions-menu';

interface OpportunitiesTableProps {
  opportunities: Opportunity[];
}

export function OpportunitiesTable({ opportunities }: OpportunitiesTableProps) {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{strings.opportunities.name}</TableHead>
            <TableHead>{strings.opportunities.type}</TableHead>
            <TableHead>{strings.opportunities.status}</TableHead>
            <TableHead>{strings.opportunities.salesOwner}</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {opportunities.map((opp) => (
            <TableRow
              key={opp.id}
              className="cursor-pointer"
              onClick={() => navigate(`/app/opportunities/${opp.id}`)}
            >
              <TableCell className="max-w-[240px] font-medium">
                <span className="line-clamp-2">{opp.name}</span>
              </TableCell>
              <TableCell>
                <StatusChip kind="projectType" value={opp.type} />
              </TableCell>
              <TableCell>
                <StatusChip kind="opportunityStatus" value={opp.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {opp.salesOwnerUser ? (
                  <ActorLabel user={opp.salesOwnerUser} />
                ) : opp.salesOwnerId ? (
                  <ActorLabel fallbackUserId={opp.salesOwnerId} />
                ) : (
                  strings.opportunities.noSalesOwner
                )}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <OpportunityActions opportunity={opp} variant="menu" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
