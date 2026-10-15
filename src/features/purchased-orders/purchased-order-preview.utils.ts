import type { PurchasedOrder } from '@/api/purchased-orders/purchased-orders.types';
import type { Quotation } from '@/api/quotations/quotations.types';

/** Minimal quotation shell for read-only customer document preview from a purchased snapshot. */
export function purchasedOrderToPreviewQuotation(order: PurchasedOrder): Quotation {
  const rev = order.revisionSnapshot;
  return {
    id: order.quotationId,
    ref: order.quotationRef,
    contractorId: order.contractorId,
    opportunityId: order.opportunityId,
    salesOwnerId: order.salesOwnerId,
    currencyCode: order.currencyCode,
    status: 'Issued',
    commercialStatus: 'Won',
    lifecycle: order.lifecycle,
    contractor: null,
    opportunity: null,
    salesOwnerUser: null,
    currentRevision: rev,
    revisions: [rev],
    createdBy: order.wonBy,
    updatedBy: order.wonBy,
    createdByUser: null,
    updatedByUser: null,
    archivedAt: null,
    archivedBy: null,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}
