import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { isApiError } from '@/api/client/api-error';
import type { Quotation, QuotationCommercialStatus } from '@/api/quotations/quotations.types';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Button } from '@/components/ui/button';
import {
  PERMISSIONS,
  PURCHASED_ORDERS_ACCESS,
  QUOTATION_COMMERCIAL_STATUS_ACCESS,
} from '@/constants/permissions';
import { strings } from '@/constants/strings';
import { useAnyPermission, usePermission } from '@/hooks/use-permission';
import { getErrorMessage } from '@/lib/get-error-message';

import { CommercialStatusDialog } from './commercial-status-dialog';
import { useReviseQuotation, useSetCommercialStatus } from './use-quotations';

interface QuotationListRowActionsProps {
  quotation: Quotation;
}

export function QuotationListRowActions({ quotation }: QuotationListRowActionsProps) {
  const navigate = useNavigate();
  const canRevise = usePermission(PERMISSIONS.quotations.revise);
  const canChangeCommercial = useAnyPermission(QUOTATION_COMMERCIAL_STATUS_ACCESS);
  const canViewPurchasedOrders = useAnyPermission(PURCHASED_ORDERS_ACCESS);

  const revise = useReviseQuotation(quotation.id);
  const setCommercial = useSetCommercialStatus(quotation.id);

  const [commercialOpen, setCommercialOpen] = useState(false);
  const [commercialTarget, setCommercialTarget] = useState<QuotationCommercialStatus | null>(null);
  const [commercialPicker, setCommercialPicker] = useState(false);
  const [wonConfirmOpen, setWonConfirmOpen] = useState(false);
  const [activeConfirmOpen, setActiveConfirmOpen] = useState(false);

  const isActive = quotation.commercialStatus === 'Active';
  const isIssued = quotation.status === 'Issued';
  const showRevise = canRevise && isIssued;
  const showWon = canChangeCommercial && isActive && isIssued;
  const showLost = canChangeCommercial && isActive;
  const showReturnActive = canChangeCommercial && !isActive;
  const showStatusPicker = canChangeCommercial;
  const showViewPo = canViewPurchasedOrders && quotation.commercialStatus === 'Won';

  const stopRowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const openCommercial = (status: QuotationCommercialStatus) => {
    setCommercialPicker(false);
    setCommercialTarget(status);
    setCommercialOpen(true);
  };

  const openStatusPicker = () => {
    setCommercialTarget(null);
    setCommercialPicker(true);
    setCommercialOpen(true);
  };

  const runRevise = () => {
    revise.mutate(undefined, {
      onSuccess: (q) => {
        toast.success(strings.quotations.revisionSuccess);
        navigate(`/app/quotations/${q.id}`);
      },
      onError: (e) => toast.error(getErrorMessage(e)),
    });
  };

  const runSetStatus = (body: { status: 'Won' } | { status: 'Active' }) => {
    setCommercial.mutate(body, {
      onSuccess: () => {
        toast.success(strings.quotations.commercialStatusUpdated);
        setWonConfirmOpen(false);
        setActiveConfirmOpen(false);
      },
      onError: (error) => {
        if (isApiError(error) && error.httpStatus === 403) {
          toast.error(strings.quotations.commercialStatusForbidden);
          return;
        }
        if (isApiError(error) && error.httpStatus === 400) {
          toast.error(strings.quotations.commercialWonNotEligible);
          return;
        }
        toast.error(getErrorMessage(error));
      },
    });
  };

  return (
    <div
      className="flex flex-wrap gap-1"
      onClick={stopRowClick}
      onKeyDown={(e) => e.stopPropagation()}
      role="presentation"
    >
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => navigate(`/app/quotations/${quotation.id}`)}
      >
        {strings.quotations.rowOpen}
      </Button>

      {showRevise && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={revise.isPending}
          onClick={runRevise}
        >
          {strings.quotations.rowRevise}
        </Button>
      )}

      {showWon && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-emerald-600/40 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
          onClick={() => setWonConfirmOpen(true)}
        >
          {strings.quotations.rowWon}
        </Button>
      )}

      {showLost && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-destructive/40 text-destructive hover:bg-destructive/10"
          onClick={() => openCommercial('Lost')}
        >
          {strings.quotations.rowLost}
        </Button>
      )}

      {showReturnActive && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setActiveConfirmOpen(true)}
        >
          {strings.quotations.rowActive}
        </Button>
      )}

      {showStatusPicker && (
        <Button type="button" size="sm" variant="outline" onClick={openStatusPicker}>
          {strings.quotations.rowStatus}
        </Button>
      )}

      {showViewPo && (
        <Button type="button" size="sm" variant="outline" asChild>
          <Link
            to={`/app/purchased-orders?quotationId=${quotation.id}`}
            onClick={stopRowClick}
          >
            {strings.quotations.viewPurchasedOrder}
          </Link>
        </Button>
      )}

      <CommercialStatusDialog
        quotation={quotation}
        targetStatus={commercialTarget}
        open={commercialOpen}
        onOpenChange={(open) => {
          setCommercialOpen(open);
          if (!open) {
            setCommercialTarget(null);
            setCommercialPicker(false);
          }
        }}
        pickerMode={commercialPicker}
      />

      <ConfirmDialog
        open={wonConfirmOpen}
        onOpenChange={setWonConfirmOpen}
        title={strings.quotations.markCommercialWonTitle}
        description={strings.quotations.markCommercialWonBody}
        confirmLabel={strings.quotations.rowWon}
        loading={setCommercial.isPending}
        onConfirm={() => runSetStatus({ status: 'Won' })}
      />

      <ConfirmDialog
        open={activeConfirmOpen}
        onOpenChange={setActiveConfirmOpen}
        title={strings.quotations.returnToActiveTitle}
        description={strings.quotations.returnToActiveBody}
        confirmLabel={strings.quotations.rowActive}
        loading={setCommercial.isPending}
        onConfirm={() => runSetStatus({ status: 'Active' })}
      />
    </div>
  );
}
