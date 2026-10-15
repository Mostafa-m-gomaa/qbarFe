import { useNavigate } from 'react-router-dom';

import type { PurchasedOrder } from '@/api/purchased-orders/purchased-orders.types';
import { ActorLabel } from '@/components/common/actor-label';
import { MoneyText } from '@/components/common/money-text';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { strings } from '@/constants/strings';
import { useContractorMap, useOpportunityMap, useUserMap } from '@/features/crm/lookups';
import { opportunityDisplayName } from '@/features/opportunities/opportunity-label';
import { formatDateTime } from '@/lib/format';

interface PurchasedOrdersTableProps {
  orders: PurchasedOrder[];
}

export function PurchasedOrdersTable({ orders }: PurchasedOrdersTableProps) {
  const navigate = useNavigate();
  const contractorMap = useContractorMap();
  const opportunityMap = useOpportunityMap();
  const userMap = useUserMap();

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{strings.purchasedOrders.quotationRef}</TableHead>
            <TableHead>{strings.quotations.currentRevision}</TableHead>
            <TableHead>{strings.quotations.contractor}</TableHead>
            <TableHead>{strings.quotations.opportunity}</TableHead>
            <TableHead className="num">{strings.purchasedOrders.grandTotal}</TableHead>
            <TableHead>{strings.quotations.currency}</TableHead>
            <TableHead>{strings.purchasedOrders.wonAt}</TableHead>
            <TableHead>{strings.quotations.salesOwner}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const contractor = contractorMap.get(order.contractorId) ?? order.contractorId;
            const opp = opportunityMap.get(order.opportunityId);
            const oppLabel = opportunityDisplayName(
              opp
                ? { name: opp.name, type: opp.type, status: opp.status }
                : undefined,
            );
            return (
              <TableRow
                key={order.id}
                className="cursor-pointer"
                onClick={() => navigate(`/app/purchased-orders/${order.id}`)}
              >
                <TableCell className="font-medium">{order.quotationRef}</TableCell>
                <TableCell className="text-muted-foreground">Rev {order.quotationRev}</TableCell>
                <TableCell>{contractor}</TableCell>
                <TableCell className="text-muted-foreground">{oppLabel}</TableCell>
                <TableCell className="num font-medium">
                  <MoneyText
                    amountMinor={order.grandAmountMinor}
                    currencyCode={order.currencyCode}
                  />
                </TableCell>
                <TableCell>{order.currencyCode}</TableCell>
                <TableCell className="text-muted-foreground">{formatDateTime(order.wonAt)}</TableCell>
                <TableCell className="text-muted-foreground">
                  <ActorLabel
                    user={userMap.get(order.salesOwnerId) ?? null}
                    fallbackUserId={order.salesOwnerId}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
