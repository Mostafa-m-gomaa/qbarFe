import { CalendarPlus, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { isApiError } from '@/api/client/api-error';
import { ActorLabel } from '@/components/common/actor-label';
import { DetailHeader } from '@/components/common/detail-header';
import { StatusChip } from '@/components/common/status-chip';
import { ErrorState } from '@/components/feedback/error-state';
import { NotFound } from '@/components/feedback/status-views';
import { PageSkeleton } from '@/components/feedback/skeletons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PERMISSIONS } from '@/constants/permissions';
import { strings } from '@/constants/strings';
import { useAnyPermission, usePermission } from '@/hooks/use-permission';
import { formatDate, formatDateTime } from '@/lib/format';

import { PermissionGate } from '@/components/common/permission-gate';

import { OpportunityActions } from './opportunity-actions-menu';
import { OpportunityFormDialog } from './opportunity-form-dialog';
import { OpportunityQuotationsSection } from './opportunity-quotations-section';
import { formatOpportunityTypeStatus } from './opportunity-label';
import { useOpportunity } from './use-opportunities';
import { CommercialFollowUpsSection } from '@/features/follow-ups/commercial-follow-ups-section';
import { FollowUpFormDialog } from '@/features/follow-ups/follow-up-form-dialog';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

export function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: opp, isLoading, isError, error, refetch } = useOpportunity(id);
  const canUpdate = usePermission(PERMISSIONS.opportunities.update);
  const [editOpen, setEditOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const canFollowUps = useAnyPermission([
    PERMISSIONS.followUps.read,
    PERMISSIONS.followUps.readAll,
  ]);
  const canSchedule = usePermission(PERMISSIONS.followUps.create);

  if (isLoading) return <PageSkeleton />;
  if (isError) {
    if (isApiError(error) && (error.httpStatus === 404 || error.code === 'NOT_FOUND')) {
      return <NotFound />;
    }
    return <ErrorState error={error} onRetry={() => void refetch()} />;
  }
  if (!opp) return <NotFound />;

  return (
    <div className="space-y-6">
      <DetailHeader
        title={opp.name}
        backTo="/app/opportunities"
        subtitle={formatOpportunityTypeStatus(opp.type, opp.status) ?? undefined}
        meta={
          <>
            <StatusChip kind="projectType" value={opp.type} />
            <StatusChip kind="opportunityStatus" value={opp.status} />
            <StatusChip kind="lifecycle" value={opp.lifecycle} />
          </>
        }
        actions={
          <>
            {canUpdate && opp.lifecycle === 'active' && (
              <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
                <Pencil />
                {strings.common.edit}
              </Button>
            )}
            {canSchedule && opp.lifecycle === 'active' && (
              <Button size="sm" variant="outline" onClick={() => setScheduleOpen(true)}>
                <CalendarPlus />
                {strings.followUps.create}
              </Button>
            )}
            <OpportunityActions opportunity={opp} variant="buttons" />
          </>
        }
      />

      <Card>
        <CardContent className="grid gap-5 py-6 sm:grid-cols-2 lg:grid-cols-3">
          {opp.description ? (
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label={strings.opportunities.description}>{opp.description}</Field>
            </div>
          ) : null}
          <Field label={strings.opportunities.type}>
            <StatusChip kind="projectType" value={opp.type} />
          </Field>
          <Field label={strings.opportunities.status}>
            <StatusChip kind="opportunityStatus" value={opp.status} />
          </Field>
          <Field label={strings.opportunities.salesOwner}>
            {opp.salesOwnerUser || opp.salesOwnerId ? (
              <ActorLabel user={opp.salesOwnerUser} fallbackUserId={opp.salesOwnerId ?? undefined} />
            ) : (
              strings.opportunities.noSalesOwner
            )}
          </Field>
          <Field label={strings.opportunities.resultDate}>{formatDate(opp.resultDate)}</Field>
          {opp.lossReason && (
            <Field label={strings.opportunities.lossReason}>{opp.lossReason}</Field>
          )}
          {opp.lossDetails && (
            <Field label={strings.opportunities.lossDetails}>{opp.lossDetails}</Field>
          )}
          <Field label={strings.opportunities.createdBy}>
            <ActorLabel user={opp.createdByUser} fallbackUserId={opp.createdBy} />
          </Field>
          <Field label={strings.opportunities.updatedBy}>
            <ActorLabel user={opp.updatedByUser} fallbackUserId={opp.updatedBy} />
          </Field>
          <Field label={strings.opportunities.createdAt}>{formatDateTime(opp.createdAt)}</Field>
          <Field label={strings.opportunities.updatedAt}>{formatDateTime(opp.updatedAt)}</Field>
        </CardContent>
      </Card>

      <PermissionGate permission={[PERMISSIONS.quotations.read, PERMISSIONS.quotations.readAll]}>
        <OpportunityQuotationsSection opportunity={opp} />
      </PermissionGate>

      {canFollowUps && (
        <CommercialFollowUpsSection
          defaultOpportunityId={opp.id}
          lockOpportunity
          hideOpportunityColumn
        />
      )}

      <OpportunityFormDialog open={editOpen} onOpenChange={setEditOpen} opportunity={opp} />

      <FollowUpFormDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        defaultOpportunityId={opp.id}
        lockOpportunity
      />
    </div>
  );
}
