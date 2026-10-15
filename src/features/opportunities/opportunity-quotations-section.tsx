import { FileText, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import type { Opportunity } from '@/api/opportunities/opportunities.types';
import { MoneyText } from '@/components/common/money-text';
import { PermissionGate } from '@/components/common/permission-gate';
import { StatusChip } from '@/components/common/status-chip';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { TableSkeleton } from '@/components/feedback/skeletons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { CreateQuotationDialog } from '@/features/quotations/create-quotation-dialog';
import {
  dedupeQuotations,
  resolveListRevision,
} from '@/features/quotations/quotation-revision.utils';
import { useQuotations } from '@/features/quotations/use-quotations';
import { useContractorMap } from '@/features/crm/lookups';
import { formatDate } from '@/lib/format';

interface OpportunityQuotationsSectionProps {
  opportunity: Opportunity;
}

export function OpportunityQuotationsSection({ opportunity }: OpportunityQuotationsSectionProps) {
  const navigate = useNavigate();
  const contractorMap = useContractorMap();
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuotations({
    opportunityId: opportunity.id,
    page: 1,
    limit: 20,
  });

  // One row per quotation: collapse any duplicate entries to the latest revision.
  const quotations = dedupeQuotations(data?.items ?? []);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-base">{strings.quotations.opportunityQuotationsTitle}</CardTitle>
            <CardDescription>{strings.quotations.opportunityQuotationsHint}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/app/quotations?opportunityId=${opportunity.id}`}>
                {strings.quotations.viewAllQuotations}
              </Link>
            </Button>
            <PermissionGate permission={PERMISSIONS.quotations.create}>
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus />
                {strings.quotations.create}
              </Button>
            </PermissionGate>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={3} columns={6} />
          ) : isError ? (
            <ErrorState error={error} onRetry={() => void refetch()} />
          ) : quotations.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={strings.quotations.opportunityQuotationsEmpty}
              action={
                <PermissionGate permission={PERMISSIONS.quotations.create}>
                  <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}>
                    <Plus />
                    {strings.quotations.create}
                  </Button>
                </PermissionGate>
              }
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{strings.quotations.reference}</TableHead>
                    <TableHead>{strings.quotations.contractor}</TableHead>
                    <TableHead>{strings.quotations.currentRevision}</TableHead>
                    <TableHead>{strings.quotations.commercialStatus}</TableHead>
                    <TableHead>{strings.quotations.quotationDate}</TableHead>
                    <TableHead className="num">{strings.quotations.grandTotal}</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotations.map((q) => {
                    const rev = resolveListRevision(q);
                    const date = q.quotationDate ?? rev.date;
                    const totalMinor = q.valueMinor ?? rev.totals.grandAmountMinor;
                    return (
                      <TableRow key={q.id}>
                        <TableCell className="font-medium">
                          {q.ref}
                          <span className="block text-xs font-normal text-muted-foreground">
                            {q.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {q.contractor?.company ??
                            contractorMap.get(q.contractorId) ??
                            q.contractorId}
                        </TableCell>
                        <TableCell>
                          Rev {q.revisionNumber ?? rev.rev}{' '}
                          <StatusChip
                            kind="quotationStatus"
                            value={q.revisionStatus ?? rev.status}
                          />
                        </TableCell>
                        <TableCell>
                          <StatusChip
                            kind="quotationCommercialStatus"
                            value={q.commercialStatus}
                          />
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(date)}</TableCell>
                        <TableCell className="num font-medium">
                          <MoneyText amountMinor={totalMinor} currencyCode={q.currencyCode} />
                        </TableCell>
                        <TableCell className="text-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/app/quotations/${q.id}`)}
                          >
                            {strings.common.view}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateQuotationDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultOpportunityId={opportunity.id}
        onCreated={(id) => navigate(`/app/quotations/${id}`)}
      />
    </>
  );
}
