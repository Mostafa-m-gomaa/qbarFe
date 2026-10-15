import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { isApiError } from '@/api/client/api-error';
import { DetailHeader } from '@/components/common/detail-header';
import { MoneyText } from '@/components/common/money-text';
import { ErrorState } from '@/components/feedback/error-state';
import { NotFound } from '@/components/feedback/status-views';
import { PageSkeleton } from '@/components/feedback/skeletons';
import { Button } from '@/components/ui/button';
import { strings } from '@/constants/strings';
import { useContractorMap, useUserMap } from '@/features/crm/lookups';
import { CustomerQuotationPreviewDialog } from '@/features/quotations/export/customer-quotation-preview-dialog';
import { formatDateTime } from '@/lib/format';

import { purchasedOrderToPreviewQuotation } from './purchased-order-preview.utils';
import { usePurchasedOrder } from './use-purchased-orders';

export function PurchasedOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError, error, refetch } = usePurchasedOrder(id);
  const contractorMap = useContractorMap();
  const userMap = useUserMap();
  const [previewOpen, setPreviewOpen] = useState(false);

  const previewQuotation = useMemo(
    () => (order ? purchasedOrderToPreviewQuotation(order) : null),
    [order],
  );

  if (isLoading) return <PageSkeleton />;
  if (isError) {
    if (isApiError(error) && (error.httpStatus === 404 || error.code === 'NOT_FOUND')) {
      return <NotFound />;
    }
    return <ErrorState error={error} onRetry={() => void refetch()} />;
  }
  if (!order || !previewQuotation) return <NotFound />;

  const contractor = contractorMap.get(order.contractorId) ?? order.contractorId;
  const wonByUser = userMap.get(order.wonBy);

  return (
    <div className="space-y-6">
      <DetailHeader
        backTo="/app/purchased-orders"
        title={order.quotationRef}
        subtitle={`Rev ${order.quotationRev} · ${contractor}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/app/quotations/${order.quotationId}`}>
                {strings.purchasedOrders.linkQuotation}
              </Link>
            </Button>
            <Button size="sm" onClick={() => setPreviewOpen(true)}>
              {strings.quotations.customerDocument}
            </Button>
          </div>
        }
      />

      <dl className="grid gap-4 rounded-lg border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs text-muted-foreground">{strings.purchasedOrders.grandTotal}</dt>
          <dd className="num text-lg font-medium">
            <MoneyText amountMinor={order.grandAmountMinor} currencyCode={order.currencyCode} />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{strings.purchasedOrders.wonAt}</dt>
          <dd className="text-sm">{formatDateTime(order.wonAt)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{strings.quotations.issuedBy}</dt>
          <dd className="text-sm">{wonByUser?.name ?? order.wonBy}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{strings.purchasedOrders.snapshot}</dt>
          <dd className="text-sm text-muted-foreground">{strings.purchasedOrders.subtitle}</dd>
        </div>
      </dl>

      <CustomerQuotationPreviewDialog
        quotation={previewQuotation}
        revision={order.revisionSnapshot}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  );
}
