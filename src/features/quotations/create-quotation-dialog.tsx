import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import type { Opportunity } from '@/api/opportunities/opportunities.types';
import { Combobox } from '@/components/common/combobox';
import { ContractorCombobox } from '@/features/contractors/contractor-combobox';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { strings } from '@/constants/strings';
import { useActiveUserOptions } from '@/features/crm/lookups';
import { useCurrencies } from '@/features/currencies/use-currencies';
import { OpportunityCombobox } from '@/features/opportunities/opportunity-combobox';
import { useOpportunity } from '@/features/opportunities/use-opportunities';
import { getErrorMessage } from '@/lib/get-error-message';
import { parseFxInput } from '@/lib/quotation-decimals';

import { createQuotationSchema, type CreateQuotationFormValues } from './create-quotation.schema';
import { useCreateQuotation } from './use-quotations';

interface CreateQuotationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (quotationId: string) => void;
  /** Preselect and lock opportunity (e.g. from opportunity detail). */
  defaultOpportunityId?: string;
}

export function CreateQuotationDialog({
  open,
  onOpenChange,
  onCreated,
  defaultOpportunityId,
}: CreateQuotationDialogProps) {
  const createMutation = useCreateQuotation();
  const userOptions = useActiveUserOptions();
  const { data: currencies = [] } = useCurrencies();
  const lockOpportunity = Boolean(defaultOpportunityId);
  const { data: presetOpportunity } = useOpportunity(defaultOpportunityId);

  const currencyOptions = useMemo(
    () =>
      currencies
        .filter((c) => c.isActive)
        .map((c) => ({
          value: c.code,
          label: c.code,
          description: c.name,
        })),
    [currencies],
  );

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = useForm<CreateQuotationFormValues>({
    resolver: zodResolver(createQuotationSchema),
    defaultValues: {
      contractorId: '',
      opportunityId: '',
      salesOwnerId: '',
      currencyCode: '',
      fxRateToBase: '1.00000000',
    },
  });

  const currencyCode = watch('currencyCode');

  const selectedCurrency = currencies.find((c) => c.code === currencyCode);
  const isBase = selectedCurrency?.isBase === true;

  const applyOpportunity = (opp: Opportunity | null) => {
    if (opp?.salesOwnerId) {
      setValue('salesOwnerId', opp.salesOwnerId);
    }
  };

  useEffect(() => {
    if (!open) return;
    const baseCurrency = currencies.find((c) => c.isBase)?.code ?? '';
    reset({
      contractorId: '',
      opportunityId: defaultOpportunityId ?? '',
      salesOwnerId: presetOpportunity?.salesOwnerId ?? '',
      currencyCode: baseCurrency,
      fxRateToBase: '1.00000000',
    });
  }, [open, reset, currencies, defaultOpportunityId, presetOpportunity]);

  useEffect(() => {
    if (isBase) {
      setValue('fxRateToBase', '1.00000000');
    }
  }, [isBase, setValue]);

  const onSubmit = (values: CreateQuotationFormValues) => {
    if (!isBase && !parseFxInput(values.fxRateToBase)) {
      setError('fxRateToBase', { message: strings.quotations.fxRequired });
      return;
    }
    createMutation.mutate(
      {
        contractorId: values.contractorId,
        opportunityId: values.opportunityId,
        salesOwnerId: values.salesOwnerId || undefined,
        currencyCode: values.currencyCode,
        fxRateToBase: isBase ? undefined : parseFxInput(values.fxRateToBase) || undefined,
      },
      {
        onSuccess: (q) => {
          toast.success(strings.quotations.created);
          onOpenChange(false);
          onCreated(q.id);
        },
        onError: (error) => {
          toast.error(getErrorMessage(error));
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{strings.quotations.createTitle}</DialogTitle>
          <DialogDescription>{strings.quotations.createSubtitleOpportunityFirst}</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label>{strings.quotations.selectOpportunity}</Label>
            <Controller
              control={control}
              name="opportunityId"
              render={({ field }) => (
                <OpportunityCombobox
                  value={field.value || null}
                  onChange={(v) => field.onChange(v ?? '')}
                  onOpportunityChange={applyOpportunity}
                  disabled={lockOpportunity}
                  clearable={!lockOpportunity}
                  aria-invalid={Boolean(errors.opportunityId)}
                />
              )}
            />
            {errors.opportunityId && (
              <p className="text-sm text-destructive">{errors.opportunityId.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>{strings.quotations.contractor}</Label>
            <Controller
              control={control}
              name="contractorId"
              render={({ field }) => (
                <ContractorCombobox
                  value={field.value || null}
                  onChange={(v) => field.onChange(v ?? '')}
                  placeholder={strings.quotations.selectContractor}
                  aria-invalid={Boolean(errors.contractorId)}
                />
              )}
            />
            {errors.contractorId && (
              <p className="text-sm text-destructive">{errors.contractorId.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>{strings.quotations.selectSalesOwner}</Label>
            <Controller
              control={control}
              name="salesOwnerId"
              render={({ field }) => (
                <Combobox
                  options={userOptions}
                  value={field.value || null}
                  onChange={(v) => field.onChange(v ?? '')}
                  placeholder={strings.quotations.selectSalesOwner}
                />
              )}
            />
          </div>
          <div className="space-y-2">
            <Label>{strings.quotations.selectCurrency}</Label>
            <Controller
              control={control}
              name="currencyCode"
              render={({ field }) => (
                <Combobox
                  options={currencyOptions}
                  value={field.value || null}
                  onChange={(v) => field.onChange(v ?? '')}
                  placeholder={strings.quotations.selectCurrency}
                />
              )}
            />
          </div>
          {!isBase && (
            <div className="space-y-2">
              <Label htmlFor="fx-rate">{strings.quotations.fxRate}</Label>
              <Controller
                control={control}
                name="fxRateToBase"
                render={({ field }) => (
                  <Input id="fx-rate" {...field} inputMode="decimal" />
                )}
              />
              {errors.fxRateToBase && (
                <p className="text-sm text-destructive">{errors.fxRateToBase.message}</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? strings.common.saving : strings.common.create}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {strings.common.cancel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
