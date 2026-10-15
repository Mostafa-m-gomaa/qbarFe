import { FileText, Plus, ShoppingBag } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { Combobox } from '@/components/common/combobox';
import { ContractorCombobox } from '@/features/contractors/contractor-combobox';
import { PageHeader } from '@/components/common/page-header';
import { Pagination } from '@/components/common/pagination';
import { PermissionGate } from '@/components/common/permission-gate';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { TableSkeleton } from '@/components/feedback/skeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PERMISSIONS, PURCHASED_ORDERS_ACCESS } from '@/constants/permissions';
import { strings } from '@/constants/strings';
import { useActiveUserOptions } from '@/features/crm/lookups';
import { useCurrencies } from '@/features/currencies/use-currencies';
import { OpportunityCombobox } from '@/features/opportunities/opportunity-combobox';
import { QUOTATION_COMMERCIAL_STATUS_LABELS } from '@/lib/enums';

import { CreateQuotationDialog } from './create-quotation-dialog';
import { COMMERCIAL_STATUS_VALUES } from './quotation-commercial.utils';
import {
  QUOTATIONS_DEFAULT_DATE_SORT,
  QUOTATIONS_FILTER_ALL,
  quotationsListFiltersToParams,
  type QuotationOpportunityTypeFilter,
  type QuotationCommercialStatusFilter,
  type QuotationStatusFilter,
  type QuotationsDateSortOrder,
  type QuotationsTotalSort,
} from './quotations-list-params';
import { sortQuotationsForList } from './quotations-list-sort';
import { QuotationsTable } from './quotations-table';
import { useQuotations } from './use-quotations';

const PAGE_SIZE = 20;
const ALL = QUOTATIONS_FILTER_ALL;

export function QuotationsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [contractorId, setContractorId] = useState<string | null>(null);
  const [opportunityId, setOpportunityId] = useState<string | null>(null);
  const [status, setStatus] = useState<QuotationStatusFilter>(ALL);
  const [commercialStatus, setCommercialStatus] = useState<QuotationCommercialStatusFilter>(ALL);
  const [currencyCode, setCurrencyCode] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');
  const [salesOwnerId, setSalesOwnerId] = useState<string | null>(null);
  const [opportunityType, setOpportunityType] = useState<QuotationOpportunityTypeFilter>(ALL);
  const [dateSortOrder, setDateSortOrder] = useState<QuotationsDateSortOrder>(
    QUOTATIONS_DEFAULT_DATE_SORT,
  );
  const [totalSort, setTotalSort] = useState<QuotationsTotalSort>(ALL);
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const userOptions = useActiveUserOptions();

  useEffect(() => {
    const oppParam = searchParams.get('opportunityId');
    if (oppParam) {
      setOpportunityId(oppParam);
      setPage(1);
    }
  }, [searchParams]);

  const { data: currencies = [] } = useCurrencies();

  const params = quotationsListFiltersToParams({
    page,
    limit: PAGE_SIZE,
    contractorId,
    opportunityId,
    status,
    commercialStatus,
    currencyCode,
    q,
    createdFrom,
    createdTo,
    salesOwnerId,
    opportunityType,
    dateSortOrder,
    totalSort,
  });

  const { data, isLoading, isError, error, refetch } = useQuotations(params);

  const reset = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(1);
  };

  const handleOpportunityFilter = (value: string | null) => {
    reset(setOpportunityId)(value);
    if (value) {
      setSearchParams({ opportunityId: value });
    } else {
      setSearchParams({});
    }
  };

  const quotations = useMemo(
    () =>
      sortQuotationsForList(data?.items ?? [], {
        dateSortOrder,
        totalSort,
      }),
    [data?.items, dateSortOrder, totalSort],
  );
  const hasFilters =
    Boolean(contractorId) ||
    Boolean(opportunityId) ||
    status !== ALL ||
    Boolean(currencyCode) ||
    q.trim() !== '' ||
    createdFrom !== '' ||
    createdTo !== '' ||
    Boolean(salesOwnerId) ||
    opportunityType !== ALL ||
    dateSortOrder !== QUOTATIONS_DEFAULT_DATE_SORT ||
    totalSort !== ALL;

  const createButton = (variant?: 'outline') => (
    <PermissionGate permission={PERMISSIONS.quotations.create}>
      <Button variant={variant} onClick={() => setCreateOpen(true)}>
        <Plus />
        {strings.quotations.create}
      </Button>
    </PermissionGate>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={strings.quotations.title}
        description={strings.quotations.subtitle}
        actions={
          <>
            <PermissionGate permission={[...PURCHASED_ORDERS_ACCESS]}>
              <Button variant="outline" size="sm" asChild>
                <Link to="/app/purchased-orders">
                  <ShoppingBag />
                  {strings.nav.purchasedOrders}
                </Link>
              </Button>
            </PermissionGate>
            {createButton()}
          </>
        }
      />

      <div className="rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          <div className="space-y-2 sm:col-span-2 xl:col-span-2">
            <Label htmlFor="quotations-search">{strings.quotations.filterSearch}</Label>
            <Input
              id="quotations-search"
              className="h-9 bg-background"
              placeholder={strings.quotations.searchRef}
              value={q}
              onChange={(e) => reset(setQ)(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{strings.quotations.filterOpportunity}</Label>
            <OpportunityCombobox
              className="h-9 bg-background"
              value={opportunityId}
              onChange={handleOpportunityFilter}
              contractorId={contractorId ?? undefined}
              placeholder={strings.quotations.filterOpportunity}
            />
          </div>
          <div className="space-y-2">
            <Label>{strings.quotations.filterContractor}</Label>
            <ContractorCombobox
              className="h-9 bg-background"
              value={contractorId}
              onChange={reset(setContractorId)}
              placeholder={strings.quotations.filterContractor}
            />
          </div>
          <div className="space-y-2">
            <Label>{strings.quotations.filterSalesOwner}</Label>
            <Combobox
              className="h-9 bg-background"
              options={userOptions}
              value={salesOwnerId}
              onChange={reset(setSalesOwnerId)}
              placeholder={strings.quotations.filterSalesOwner}
              clearable
            />
          </div>
          <div className="space-y-2">
            <Label>{strings.quotations.filterOpportunityType}</Label>
            <Select
              value={opportunityType}
              onValueChange={(v) => reset(setOpportunityType)(v as typeof opportunityType)}
            >
              <SelectTrigger className="h-9 bg-background">
                <SelectValue placeholder={strings.quotations.filterOpportunityType} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{strings.common.all}</SelectItem>
                <SelectItem value="Tender">Tender</SelectItem>
                <SelectItem value="In Hand">In Hand</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{strings.quotations.filterStatus}</Label>
            <Select value={status} onValueChange={(v) => reset(setStatus)(v as typeof status)}>
              <SelectTrigger className="h-9 bg-background">
                <SelectValue placeholder={strings.quotations.filterStatus} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{strings.common.all}</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Issued">Issued</SelectItem>
                <SelectItem value="Revision Draft">Revision Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{strings.quotations.filterCommercialStatus}</Label>
            <Select
              value={commercialStatus}
              onValueChange={(v) => reset(setCommercialStatus)(v as typeof commercialStatus)}
            >
              <SelectTrigger className="h-9 bg-background">
                <SelectValue placeholder={strings.quotations.filterCommercialStatus} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{strings.common.all}</SelectItem>
                {COMMERCIAL_STATUS_VALUES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {QUOTATION_COMMERCIAL_STATUS_LABELS[status] ?? status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{strings.quotations.filterCurrency}</Label>
            <Select
              value={currencyCode ?? ALL}
              onValueChange={(v) => reset(setCurrencyCode)(v === ALL ? null : v)}
            >
              <SelectTrigger className="h-9 bg-background">
                <SelectValue placeholder={strings.quotations.filterCurrency} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{strings.common.all}</SelectItem>
                {currencies.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quotations-from">{strings.quotations.createdFrom}</Label>
            <Input
              id="quotations-from"
              type="date"
              className="h-9 bg-background"
              value={createdFrom}
              onChange={(e) => reset(setCreatedFrom)(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quotations-to">{strings.quotations.createdTo}</Label>
            <Input
              id="quotations-to"
              type="date"
              className="h-9 bg-background"
              value={createdTo}
              onChange={(e) => reset(setCreatedTo)(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{strings.quotations.sortByCreated}</Label>
            <Select
              value={dateSortOrder}
              onValueChange={(v) => reset(setDateSortOrder)(v as QuotationsDateSortOrder)}
            >
              <SelectTrigger className="h-9 bg-background">
                <SelectValue placeholder={strings.quotations.sortByCreated} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">{strings.quotations.sortCreatedNewest}</SelectItem>
                <SelectItem value="asc">{strings.quotations.sortCreatedOldest}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{strings.quotations.sortByGrandTotal}</Label>
            <Select
              value={totalSort}
              onValueChange={(v) => reset(setTotalSort)(v as QuotationsTotalSort)}
            >
              <SelectTrigger className="h-9 bg-background">
                <SelectValue placeholder={strings.quotations.sortByGrandTotal} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{strings.quotations.sortTotalNone}</SelectItem>
                <SelectItem value="desc">{strings.quotations.sortTotalHighest}</SelectItem>
                <SelectItem value="asc">{strings.quotations.sortTotalLowest}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} columns={8} />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : quotations.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={strings.quotations.emptyTitle}
          description={hasFilters ? strings.common.noResults : strings.quotations.emptyHint}
          action={hasFilters ? undefined : createButton('outline')}
        />
      ) : (
        <>
          <QuotationsTable quotations={quotations} />
          <Pagination
            page={data?.page ?? 1}
            limit={data?.limit ?? PAGE_SIZE}
            total={data?.total ?? quotations.length}
            onPageChange={setPage}
          />
        </>
      )}

      <CreateQuotationDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(id) => navigate(`/app/quotations/${id}`)}
        defaultOpportunityId={opportunityId ?? undefined}
      />
    </div>
  );
}
