import { AlertTriangle, CalendarPlus, ExternalLink } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { isApiError } from '@/api/client/api-error';
import type { UpdateQuotationRequest } from '@/api/quotations/quotations.types';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { DetailHeader } from '@/components/common/detail-header';
import { PermissionGate } from '@/components/common/permission-gate';
import { StatusChip } from '@/components/common/status-chip';
import { ErrorState } from '@/components/feedback/error-state';
import { NotFound } from '@/components/feedback/status-views';
import { PageSkeleton } from '@/components/feedback/skeletons';
import { Button } from '@/components/ui/button';
import { PERMISSIONS, PURCHASED_ORDERS_ACCESS } from '@/constants/permissions';
import { strings } from '@/constants/strings';
import { opportunityDisplayName } from '@/features/opportunities/opportunity-label';
import { useQuotationSchedule } from '@/features/quotation-schedule/use-quotation-schedule';
import { useCurrencies } from '@/features/currencies/use-currencies';
import { useQuotationPurchasedOrder } from '@/features/purchased-orders/use-purchased-orders';
import { QuotationCommercialStatusControl } from '@/features/quotations/quotation-commercial-status-control';
import {
  editableDraftRevision,
  isRevisionReadOnly,
  resolveViewRevision,
  revisionHasPendingCost,
} from '@/features/quotations/quotation-revision.utils';
import {
  useAddItem,
  useAddRun,
  useApplyPerAmp,
  useApplyStdPrice,
  useArchiveQuotation,
  useCompleteRun,
  useDeleteItem,
  useDeleteRun,
  useQuotation,
  useReopenRun,
  useUpdateItem,
  useUpdateQuotation,
  useUpdateRun,
} from '@/features/quotations/use-quotations';

import { QuotationInfoSection } from './builder/quotation-info-section';
import { QuotationIssueActions } from './builder/quotation-issue-actions';
import { QuotationRunsSection } from './builder/quotation-runs-section';
import { QuotationSummarySection } from './builder/quotation-summary-section';
import { RevisionHistoryDialog } from './builder/revision-history-dialog';
import { CustomerQuotationPreviewDialog } from './export/customer-quotation-preview-dialog';
import { FollowUpFormDialog } from '@/features/follow-ups/follow-up-form-dialog';
import { useAnyPermission, usePermission } from '@/hooks/use-permission';

export function QuotationBuilderPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const revParam = searchParams.get('rev');
  const viewRev = revParam !== null ? Number(revParam) : null;

  const { data: quotation, isLoading, isError, error, refetch } = useQuotation(id);
  const { data: schedule } = useQuotationSchedule();
  const { data: currencies = [] } = useCurrencies();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [customerDocOpen, setCustomerDocOpen] = useState(false);
  const [scheduleFollowUpOpen, setScheduleFollowUpOpen] = useState(false);
  const canScheduleFollowUp = usePermission(PERMISSIONS.followUps.create);
  const canReadPurchasedOrders = useAnyPermission(PURCHASED_ORDERS_ACCESS);
  const { data: purchasedOrderSnapshot } = useQuotationPurchasedOrder(id, {
    enabled: canReadPurchasedOrders && Boolean(id),
  });

  const updateQuotation = useUpdateQuotation(id ?? '');
  const addRun = useAddRun(id ?? '');
  const updateRun = useUpdateRun(id ?? '');
  const deleteRun = useDeleteRun(id ?? '');
  const completeRun = useCompleteRun(id ?? '');
  const reopenRun = useReopenRun(id ?? '');
  const applyStd = useApplyStdPrice(id ?? '');
  const applyPerAmp = useApplyPerAmp(id ?? '');
  const addItem = useAddItem(id ?? '');
  const updateItem = useUpdateItem(id ?? '');
  const deleteItem = useDeleteItem(id ?? '');
  const archiveQuotation = useArchiveQuotation(id ?? '');

  const draft = quotation ? editableDraftRevision(quotation) : null;
  const revision = useMemo(
    () => (quotation ? resolveViewRevision(quotation, viewRev) : null),
    [quotation, viewRev],
  );
  const readOnly = quotation && revision ? isRevisionReadOnly(quotation, revision) : true;

  const isBaseCurrency = useMemo(() => {
    if (!quotation || !revision) return true;
    return currencies.find((c) => c.code === revision.currencyCode)?.isBase === true;
  }, [currencies, quotation, revision]);

  const patchRevision = (body: Omit<UpdateQuotationRequest, 'expectedRevisionVersion'>) => {
    if (!draft || readOnly) return;
    updateQuotation.mutate({
      expectedRevisionVersion: draft.version,
      ...body,
    });
  };

  const version = draft?.version ?? 0;

  const runMutation = <T,>(
    mutation: { mutate: (args: T) => void },
    args: T,
  ) => {
    if (!draft || readOnly) return;
    mutation.mutate(args);
  };

  if (isLoading) return <PageSkeleton />;
  if (isError) {
    if (isApiError(error) && (error.httpStatus === 404 || error.code === 'NOT_FOUND')) {
      return <NotFound />;
    }
    return <ErrorState error={error} onRetry={() => void refetch()} />;
  }
  if (!quotation || !revision) return <NotFound />;

  const contractorLabel =
    quotation.contractor?.company ?? quotation.contractorId;
  const oppLabel = opportunityDisplayName(quotation.opportunity ?? undefined);

  return (
    <div className="space-y-6 print:space-y-4">
      <DetailHeader
        backTo="/app/quotations"
        title={`${quotation.ref} — Rev ${revision.rev}`}
        subtitle={`${contractorLabel} • ${oppLabel}`}
        meta={
          <>
            <StatusChip kind="quotationStatus" value={quotation.status} />
            <StatusChip kind="quotationCommercialStatus" value={quotation.commercialStatus} />
            <StatusChip kind="lifecycle" value={quotation.lifecycle} />
            <StatusChip kind="quotationStatus" value={revision.status} />
          </>
        }
        actions={
          <div className="flex flex-wrap gap-2 print:hidden">
            <QuotationCommercialStatusControl quotation={quotation} variant="full" />
            {canReadPurchasedOrders && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate(
                    purchasedOrderSnapshot
                      ? `/app/purchased-orders/${purchasedOrderSnapshot.id}`
                      : `/app/purchased-orders?quotationId=${quotation.id}`,
                  )
                }
              >
                <ExternalLink />
                {strings.quotations.viewPurchasedOrder}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setHistoryOpen(true)}>
              {strings.quotations.revisionHistory}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCustomerDocOpen(true)}>
              {strings.quotations.customerDocument}
            </Button>
            {canScheduleFollowUp && quotation.lifecycle === 'active' && (
              <Button variant="outline" size="sm" onClick={() => setScheduleFollowUpOpen(true)}>
                <CalendarPlus />
                {strings.followUps.create}
              </Button>
            )}
            <PermissionGate permission={PERMISSIONS.quotations.archive}>
              {quotation.lifecycle === 'active' && (
                <Button variant="outline" size="sm" onClick={() => setArchiveOpen(true)}>
                  {strings.quotations.archive}
                </Button>
              )}
            </PermissionGate>
            <QuotationIssueActions
              quotation={quotation}
              readOnly={readOnly}
              onReviseSuccess={(rev) => setSearchParams({ rev: String(rev) })}
            />
          </div>
        }
      />

      <p className="text-sm text-muted-foreground print:hidden">{strings.quotations.builderHint}</p>

      {readOnly && (
        <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
          <AlertTriangle className="size-4 shrink-0" aria-hidden />
          <div>
            <strong>{strings.quotations.lockedRevisionTitle}:</strong>{' '}
            {strings.quotations.lockedRevisionBody}
          </div>
        </div>
      )}

      {!readOnly && draft?.isBelowCost && !draft.belowCostOverride && (
        <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950 dark:border-red-900 dark:bg-red-950/30 dark:text-red-100">
          <AlertTriangle className="size-4 shrink-0" aria-hidden />
          <div>
            <strong>{strings.quotations.belowCostTitle}:</strong> {strings.quotations.belowCostBody}
          </div>
        </div>
      )}

      {!readOnly && revisionHasPendingCost(revision) && (
        <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
          <AlertTriangle className="size-4 shrink-0" aria-hidden />
          <div>
            <strong>{strings.quotations.costPendingTitle}:</strong>{' '}
            {strings.quotations.costPendingBody}
          </div>
        </div>
      )}

      <QuotationInfoSection
        quotation={quotation}
        revision={revision}
        readOnly={readOnly}
        isBaseCurrency={isBaseCurrency}
        onPatch={patchRevision}
      />

      <QuotationRunsSection
        revision={revision}
        schedule={schedule}
        readOnly={readOnly}
        expectedVersion={version}
        onAddRun={() =>
          runMutation(addRun, { expectedRevisionVersion: version })
        }
        onUpdateRun={(runId, body) =>
          runMutation(updateRun, {
            runId,
            body: { expectedRevisionVersion: version, ...body },
          })
        }
        onDeleteRun={(runId) =>
          runMutation(deleteRun, { runId, body: { expectedRevisionVersion: version } })
        }
        onCompleteRun={(runId) =>
          runMutation(completeRun, { runId, body: { expectedRevisionVersion: version } })
        }
        onReopenRun={(runId) =>
          runMutation(reopenRun, { runId, body: { expectedRevisionVersion: version } })
        }
        onApplyStd={(runId, itemId, itemKey) =>
          runMutation(applyStd, {
            runId,
            body: {
              expectedRevisionVersion: version,
              ...(itemId ? { itemId } : {}),
              ...(itemKey ? { itemKey } : {}),
            },
          })
        }
        onApplyPerAmp={(runId) =>
          runMutation(applyPerAmp, {
            runId,
            body: { expectedRevisionVersion: version },
          })
        }
        onAddItem={(runId, kind, defaults) => {
          const accessoryKey = schedule?.lists.accessories?.[0]?.value;
          runMutation(addItem, {
            runId,
            body: {
              expectedRevisionVersion: version,
              kind,
              quantity: String(defaults.quantity ?? '1.0000'),
              ...(kind === 'accessory' && accessoryKey ? { itemKey: accessoryKey } : {}),
              ...(defaults.description ? { description: String(defaults.description) } : {}),
            },
          });
        }}
        onUpdateItem={(runId, itemId, body) =>
          runMutation(updateItem, {
            runId,
            itemId,
            body: { expectedRevisionVersion: version, ...body },
          })
        }
        onDeleteItem={(runId, itemId) =>
          runMutation(deleteItem, {
            runId,
            itemId,
            body: { expectedRevisionVersion: version },
          })
        }
      />

      <QuotationSummarySection revision={revision} readOnly={readOnly} onPatch={patchRevision} />

      <RevisionHistoryDialog
        quotation={quotation}
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        onSelectRev={(rev) => setSearchParams({ rev: String(rev) })}
      />

      <CustomerQuotationPreviewDialog
        quotation={quotation}
        revision={revision}
        open={customerDocOpen}
        onOpenChange={setCustomerDocOpen}
      />

      <FollowUpFormDialog
        open={scheduleFollowUpOpen}
        onOpenChange={setScheduleFollowUpOpen}
        defaultOpportunityId={quotation.opportunityId}
        lockOpportunity
        defaultQuotationId={quotation.id}
        lockQuotation
      />

      <ConfirmDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        title={strings.quotations.archiveTitle}
        description={strings.quotations.archiveBody}
        confirmLabel={strings.quotations.archive}
        destructive
        loading={archiveQuotation.isPending}
        onConfirm={() => {
          archiveQuotation.mutate(undefined, {
            onSuccess: () => {
              toast.success(strings.quotations.archiveSuccess);
              navigate('/app/quotations');
            },
          });
        }}
      />
    </div>
  );
}
