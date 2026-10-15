import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import type { FollowUp } from '@/api/follow-ups/follow-ups.types';
import { Combobox } from '@/components/common/combobox';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { strings } from '@/constants/strings';
import { OpportunityCombobox } from '@/features/opportunities/opportunity-combobox';
import { opportunityDisplayName } from '@/features/opportunities/opportunity-label';
import { useOpportunity } from '@/features/opportunities/use-opportunities';
import { useActiveUserOptions, useContractorMap } from '@/features/crm/lookups';
import { useQuotations } from '@/features/quotations/use-quotations';
import { getErrorMessage, getFieldErrors } from '@/lib/get-error-message';

import { dueAtToInputValue, dueAtToIso } from './follow-up-datetime';
import {
  emptyFollowUpForm,
  FOLLOW_UP_TYPE_OPTIONS,
  followUpFormSchema,
  type FollowUpFormValues,
} from './follow-up.schema';
import { useCreateFollowUp, useUpdateFollowUp } from './use-follow-ups';

interface FollowUpFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  followUp?: FollowUp | null;
  defaultOpportunityId?: string;
  lockOpportunity?: boolean;
  defaultQuotationId?: string;
  lockQuotation?: boolean;
}

export function FollowUpFormDialog({
  open,
  onOpenChange,
  followUp,
  defaultOpportunityId,
  lockOpportunity,
  defaultQuotationId,
  lockQuotation,
}: FollowUpFormDialogProps) {
  const mode = followUp ? 'edit' : 'create';
  const createMutation = useCreateFollowUp();
  const updateMutation = useUpdateFollowUp();

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = useForm<FollowUpFormValues>({
    resolver: zodResolver(followUpFormSchema),
    defaultValues: emptyFollowUpForm,
  });

  const contractorMap = useContractorMap();
  const opportunityId = watch('opportunityId');
  const { data: opportunity } = useOpportunity(opportunityId || undefined);
  const assigneeOptions = useActiveUserOptions();

  const { data: quotationsData } = useQuotations(
    { opportunityId, limit: 100, page: 1 },
    { enabled: Boolean(opportunityId) },
  );

  const quotationOptions = useMemo(() => {
    if (!opportunityId) return [{ value: '', label: strings.followUps.noQuotation }];
    const items = (quotationsData?.items ?? []).filter((q) => q.opportunityId === opportunityId);
    return [
      { value: '', label: strings.followUps.noQuotation },
      ...items.map((q) => {
        const company = q.contractor?.company ?? contractorMap.get(q.contractorId) ?? q.contractorId;
        return {
          value: q.id,
          label: `${q.ref} — ${company} (${q.status})`,
        };
      }),
    ];
  }, [quotationsData, opportunityId, contractorMap]);

  useEffect(() => {
    if (!open) return;
    if (followUp) {
      reset({
        opportunityId: followUp.opportunityId,
        quotationId: followUp.quotationId ?? '',
        title: followUp.title,
        type: followUp.type,
        assignedToId: followUp.assignedToId,
        dueAt: dueAtToInputValue(followUp.dueAt),
        notes: followUp.notes ?? '',
      });
      return;
    }
    reset({
      ...emptyFollowUpForm,
      opportunityId: defaultOpportunityId ?? '',
      quotationId: defaultQuotationId ?? '',
      dueAt: dueAtToInputValue(new Date(Date.now() + 7 * 86400000).toISOString()),
    });
  }, [open, followUp, defaultOpportunityId, defaultQuotationId, reset]);

  useEffect(() => {
    if (mode !== 'create' || !open || !opportunity?.salesOwnerId) return;
    const current = watch('assignedToId');
    if (!current) {
      setValue('assignedToId', opportunity.salesOwnerId);
    }
  }, [mode, open, opportunity?.salesOwnerId, setValue, watch]);

  const submitting = createMutation.isPending || updateMutation.isPending;

  const applyServerErrors = (error: unknown) => {
    const fieldErrors = getFieldErrors(error);
    let mapped = false;
    for (const [field, message] of Object.entries(fieldErrors)) {
      if (field in emptyFollowUpForm) {
        setError(field as keyof FollowUpFormValues, { message });
        mapped = true;
      }
    }
    if (!mapped) toast.error(getErrorMessage(error));
  };

  const onSubmit = (values: FollowUpFormValues) => {
    const quotationId = values.quotationId.trim() ? values.quotationId : null;
    if (mode === 'create') {
      createMutation.mutate(
        {
          opportunityId: values.opportunityId,
          quotationId,
          title: values.title.trim(),
          type: values.type,
          assignedToId: values.assignedToId,
          dueAt: dueAtToIso(values.dueAt),
          notes: values.notes.trim() || undefined,
        },
        {
          onSuccess: () => {
            toast.success(strings.followUps.created);
            onOpenChange(false);
          },
          onError: applyServerErrors,
        },
      );
    } else if (followUp) {
      updateMutation.mutate(
        {
          id: followUp.id,
          body: {
            expectedRevision: followUp.revision,
            title: values.title.trim(),
            type: values.type,
            assignedToId: values.assignedToId,
            dueAt: dueAtToIso(values.dueAt),
            notes: values.notes.trim(),
            quotationId,
          },
        },
        {
          onSuccess: () => {
            toast.success(strings.followUps.updated);
            onOpenChange(false);
          },
          onError: applyServerErrors,
        },
      );
    }
  };

  const opportunityLabel = opportunity
    ? opportunityDisplayName(opportunity)
    : opportunityId
      ? '…'
      : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? strings.followUps.createTitle : strings.followUps.editTitle}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' ? strings.followUps.createSubtitle : strings.followUps.editSubtitle}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label>{strings.followUps.opportunity}</Label>
            {mode === 'edit' || lockOpportunity ? (
              <p className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
                {opportunityLabel}
              </p>
            ) : (
              <Controller
                control={control}
                name="opportunityId"
                render={({ field }) => (
                  <OpportunityCombobox
                    value={field.value || null}
                    onChange={(v) => {
                      field.onChange(v ?? '');
                      setValue('quotationId', '');
                    }}
                    aria-invalid={Boolean(errors.opportunityId)}
                  />
                )}
              />
            )}
            {errors.opportunityId && (
              <p className="text-sm text-destructive">{errors.opportunityId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{strings.followUps.quotation}</Label>
            {lockQuotation ? (
              <p className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
                {followUp?.quotation?.ref ??
                  quotationOptions.find((o) => o.value === (defaultQuotationId ?? ''))?.label ??
                  strings.followUps.noQuotation}
              </p>
            ) : (
              <Controller
                control={control}
                name="quotationId"
                render={({ field }) => (
                  <Combobox
                    options={quotationOptions}
                    value={field.value || null}
                    onChange={(v) => field.onChange(v ?? '')}
                    placeholder={strings.followUps.selectQuotation}
                    disabled={!opportunityId}
                  />
                )}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fu-title">{strings.followUps.title}</Label>
            <Input id="fu-title" aria-invalid={Boolean(errors.title)} {...register('title')} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{strings.followUps.type}</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FOLLOW_UP_TYPE_OPTIONS.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fu-due">{strings.followUps.dueAt}</Label>
              <Input
                id="fu-due"
                type="datetime-local"
                aria-invalid={Boolean(errors.dueAt)}
                {...register('dueAt')}
              />
              {errors.dueAt && (
                <p className="text-sm text-destructive">{errors.dueAt.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{strings.followUps.assignedTo}</Label>
            <Controller
              control={control}
              name="assignedToId"
              render={({ field }) => (
                <Combobox
                  options={assigneeOptions}
                  value={field.value || null}
                  onChange={(v) => field.onChange(v ?? '')}
                  placeholder={strings.followUps.selectAssignee}
                  disabled={!opportunityId}
                />
              )}
            />
            <p className="text-xs text-muted-foreground">{strings.followUps.assigneeDefaultHint}</p>
            {errors.assignedToId && (
              <p className="text-sm text-destructive">{errors.assignedToId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fu-notes">{strings.followUps.notes}</Label>
            <textarea
              id="fu-notes"
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              {...register('notes')}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? strings.common.saving : strings.common.save}
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
