import { useState } from 'react';
import { toast } from 'sonner';

import { isApiError } from '@/api/client/api-error';
import type { Quotation } from '@/api/quotations/quotations.types';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Button } from '@/components/ui/button';
import { PERMISSIONS } from '@/constants/permissions';
import { strings } from '@/constants/strings';
import {
  draftRevision,
  revisionHasPendingCost,
} from '@/features/quotations/quotation-revision.utils';
import {
  useBelowCostOverride,
  useIssueQuotation,
  useReviseQuotation,
} from '@/features/quotations/use-quotations';
import { usePermission } from '@/hooks/use-permission';
import { getErrorMessage } from '@/lib/get-error-message';

interface QuotationIssueActionsProps {
  quotation: Quotation;
  readOnly: boolean;
  onReviseSuccess: (rev: number) => void;
}

export function QuotationIssueActions({
  quotation,
  readOnly,
  onReviseSuccess,
}: QuotationIssueActionsProps) {
  const canIssue = usePermission(PERMISSIONS.quotations.issue);
  const canRevise = usePermission(PERMISSIONS.quotations.revise);
  const canViewCost = usePermission(PERMISSIONS.quotations.viewCost);
  const canOverrideBelowCost = usePermission(PERMISSIONS.quotations.overrideBelowCost);
  const issue = useIssueQuotation(quotation.id);
  const revise = useReviseQuotation(quotation.id);
  const belowCostOverrideMutation = useBelowCostOverride(quotation.id);
  const [pendingCostConfirm, setPendingCostConfirm] = useState(false);

  const draft = draftRevision(quotation);
  const showIssue = canIssue && !readOnly && draft !== null;
  const showRevise = canRevise && quotation.status === 'Issued';
  const isBelowCost = Boolean(draft?.isBelowCost);
  const hasOverride = Boolean(draft?.belowCostOverride);
  const showBelowCostOverride =
    canViewCost &&
    canOverrideBelowCost &&
    !readOnly &&
    draft !== null &&
    isBelowCost &&
    !hasOverride;

  const runIssue = (acknowledgePendingCost?: boolean) => {
    if (!draft) return;
    issue.mutate(
      {
        expectedRevisionVersion: draft.version,
        ...(acknowledgePendingCost ? { acknowledgePendingCost: true } : {}),
      },
      {
        onSuccess: () => {
          toast.success(strings.quotations.issueSuccess);
          setPendingCostConfirm(false);
        },
        onError: (error) => {
          if (
            isApiError(error) &&
            (error.httpStatus === 409 || error.code === 'CONFLICT') &&
            draft &&
            revisionHasPendingCost(draft)
          ) {
            setPendingCostConfirm(true);
            return;
          }
          if (isApiError(error) && error.httpStatus === 409 && isBelowCost && !hasOverride) {
            toast.error(strings.quotations.belowCostBody);
            return;
          }
          if (!isApiError(error) || error.httpStatus !== 409) {
            toast.error(getErrorMessage(error));
          }
        },
      },
    );
  };

  const runRevise = () => {
    revise.mutate(undefined, {
      onSuccess: (q) => {
        toast.success(strings.quotations.revisionSuccess);
        const newDraft = draftRevision(q);
        if (newDraft) onReviseSuccess(newDraft.rev);
      },
    });
  };

  const runBelowCostOverride = () => {
    if (!draft) return;
    belowCostOverrideMutation.mutate(
      { expectedRevisionVersion: draft.version },
      {
        onSuccess: () => toast.success(strings.quotations.belowCostOverrideSuccess),
      },
    );
  };

  return (
    <>
      {showBelowCostOverride && (
        <Button
          variant="outline"
          onClick={runBelowCostOverride}
          disabled={belowCostOverrideMutation.isPending}
        >
          {strings.quotations.belowCostOverride}
        </Button>
      )}
      {showIssue && (
        <Button onClick={() => runIssue()} disabled={issue.isPending}>
          {strings.quotations.issue}
        </Button>
      )}
      {showRevise && (
        <Button variant="outline" onClick={runRevise} disabled={revise.isPending}>
          {strings.quotations.newRevision}
        </Button>
      )}
      <ConfirmDialog
        open={pendingCostConfirm}
        onOpenChange={setPendingCostConfirm}
        title={strings.quotations.issuePendingCostTitle}
        description={strings.quotations.issuePendingCostBody}
        confirmLabel={strings.quotations.issue}
        loading={issue.isPending}
        onConfirm={() => runIssue(true)}
      />
    </>
  );
}
