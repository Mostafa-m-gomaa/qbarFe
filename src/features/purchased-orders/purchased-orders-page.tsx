import { ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { isApiError } from '@/api/client/api-error';
import { PageHeader } from '@/components/common/page-header';
import { Pagination } from '@/components/common/pagination';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { TableSkeleton } from '@/components/feedback/skeletons';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { strings } from '@/constants/strings';
import { ContractorCombobox } from '@/features/contractors/contractor-combobox';
import { OpportunityCombobox } from '@/features/opportunities/opportunity-combobox';

import { PurchasedOrdersTable } from './purchased-orders-table';
import { usePurchasedOrders } from './use-purchased-orders';

const PAGE_SIZE = 20;

export function PurchasedOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [contractorId, setContractorId] = useState<string | null>(null);
  const [opportunityId, setOpportunityId] = useState<string | null>(null);
  const [quotationId, setQuotationId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const qId = searchParams.get('quotationId');
    setQuotationId(qId);
    if (qId) setPage(1);
  }, [searchParams]);

  const reset = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(1);
  };

  const clearQuotationFilter = () => {
    setQuotationId(null);
    setPage(1);
    const next = new URLSearchParams(searchParams);
    next.delete('quotationId');
    setSearchParams(next, { replace: true });
  };

  const { data, isLoading, isError, error, refetch } = usePurchasedOrders({
    page,
    limit: PAGE_SIZE,
    ...(contractorId ? { contractorId } : {}),
    ...(opportunityId ? { opportunityId } : {}),
    ...(quotationId ? { quotationId } : {}),
  });

  const orders = data?.items ?? [];
  const apiForbidden =
    isError && isApiError(error) && (error.httpStatus === 403 || error.httpStatus === 404);

  return (
    <div className="space-y-6">
      <PageHeader
        title={strings.purchasedOrders.title}
        description={strings.purchasedOrders.subtitle}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link to="/app/quotations">{strings.quotations.backToList}</Link>
          </Button>
        }
      />

      <div className="rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>{strings.quotations.contractor}</Label>
            <ContractorCombobox
              className="h-9 bg-background"
              value={contractorId}
              onChange={reset(setContractorId)}
              placeholder={strings.quotations.filterContractor}
            />
          </div>
          <div className="space-y-2">
            <Label>{strings.quotations.opportunity}</Label>
            <OpportunityCombobox
              className="h-9 bg-background"
              value={opportunityId}
              onChange={(v) => {
                reset(setOpportunityId)(v);
                if (v) clearQuotationFilter();
              }}
              placeholder={strings.quotations.selectOpportunity}
            />
          </div>
          {quotationId && (
            <div className="space-y-2">
              <Label>{strings.quotations.reference}</Label>
              <div className="flex h-9 items-center gap-2 rounded-md border bg-background px-3 text-sm">
                <span className="truncate text-muted-foreground">{quotationId}</span>
                <Button type="button" variant="ghost" size="sm" className="ms-auto h-7 px-2" onClick={clearQuotationFilter}>
                  ×
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} columns={8} />
      ) : isError ? (
        <ErrorState
          error={
            apiForbidden
              ? new Error(`${strings.errors.permissionDenied}. ${strings.purchasedOrders.permissionHint}`)
              : error
          }
          onRetry={() => void refetch()}
        />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title={strings.purchasedOrders.emptyTitle}
          description={
            quotationId
              ? strings.purchasedOrders.emptyFilteredByQuotation
              : strings.purchasedOrders.emptyHint
          }
        />
      ) : (
        <>
          <PurchasedOrdersTable orders={orders} />
          <Pagination page={page} limit={PAGE_SIZE} total={data?.total ?? 0} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
