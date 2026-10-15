import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import type { Opportunity } from '@/api/opportunities/opportunities.types';
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
import { Textarea } from '@/components/ui/textarea';
import { strings } from '@/constants/strings';
import { useActiveUserOptions } from '@/features/crm/lookups';
import { getErrorMessage, getFieldErrors } from '@/lib/get-error-message';

import { opportunityFormSchema, type OpportunityFormValues } from './opportunity.schema';
import { useCreateOpportunity, useUpdateOpportunity } from './use-opportunities';

interface OpportunityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present = edit; absent = create. */
  opportunity?: Opportunity | null;
}

export function OpportunityFormDialog({
  open,
  onOpenChange,
  opportunity,
}: OpportunityFormDialogProps) {
  const mode = opportunity ? 'edit' : 'create';
  const createMutation = useCreateOpportunity();
  const updateMutation = useUpdateOpportunity();

  const ownerOptions = useActiveUserOptions();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunityFormSchema),
    defaultValues: { name: '', description: '', type: 'Tender', salesOwnerId: '' },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      name: opportunity?.name ?? '',
      description: opportunity?.description ?? '',
      type: opportunity?.type ?? 'Tender',
      salesOwnerId: opportunity?.salesOwnerId ?? '',
    });
  }, [open, opportunity, reset]);

  const submitting = createMutation.isPending || updateMutation.isPending;

  const applyServerErrors = (error: unknown) => {
    const fieldErrors = getFieldErrors(error);
    let mapped = false;
    for (const [field, message] of Object.entries(fieldErrors)) {
      if (field === 'name' || field === 'description' || field === 'type' || field === 'salesOwnerId') {
        setError(field as keyof OpportunityFormValues, { message });
        mapped = true;
      }
    }
    if (!mapped) toast.error(getErrorMessage(error));
  };

  const onSubmit = (values: OpportunityFormValues) => {
    const descriptionTrimmed = values.description.trim();
    if (mode === 'create') {
      createMutation.mutate(
        {
          name: values.name.trim(),
          ...(descriptionTrimmed ? { description: descriptionTrimmed } : {}),
          type: values.type,
          salesOwnerId: values.salesOwnerId || undefined,
        },
        {
          onSuccess: () => {
            toast.success(strings.opportunities.created);
            onOpenChange(false);
          },
          onError: applyServerErrors,
        },
      );
    } else if (opportunity) {
      updateMutation.mutate(
        {
          id: opportunity.id,
          body: {
            name: values.name.trim(),
            description: descriptionTrimmed === '' ? null : descriptionTrimmed,
            salesOwnerId: values.salesOwnerId || undefined,
          },
        },
        {
          onSuccess: () => {
            toast.success(strings.opportunities.updated);
            onOpenChange(false);
          },
          onError: applyServerErrors,
        },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create'
              ? strings.opportunities.createTitle
              : strings.opportunities.editTitle}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? strings.opportunities.createSubtitle
              : strings.opportunities.editSubtitle}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="opp-name">{strings.opportunities.name}</Label>
            <Input
              id="opp-name"
              {...register('name')}
              aria-invalid={Boolean(errors.name)}
              autoComplete="off"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="opp-description">{strings.opportunities.description}</Label>
            <Textarea
              id="opp-description"
              rows={3}
              {...register('description')}
              aria-invalid={Boolean(errors.description)}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {mode === 'create' ? (
            <div className="space-y-2">
              <Label htmlFor="opp-type">{strings.opportunities.type}</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="opp-type" aria-invalid={Boolean(errors.type)}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tender">Tender</SelectItem>
                      <SelectItem value="In Hand">In Hand</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
            </div>
          ) : (
            opportunity && (
              <div className="space-y-2">
                <Label>{strings.opportunities.type}</Label>
                <p className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
                  {opportunity.type}
                </p>
              </div>
            )
          )}

          <div className="space-y-2">
            <Label htmlFor="opp-owner">{strings.opportunities.salesOwner}</Label>
            <Controller
              control={control}
              name="salesOwnerId"
              render={({ field }) => (
                <Combobox
                  id="opp-owner"
                  options={ownerOptions}
                  value={field.value || null}
                  onChange={(v) => field.onChange(v ?? '')}
                  placeholder={strings.opportunities.selectSalesOwner}
                  aria-invalid={Boolean(errors.salesOwnerId)}
                />
              )}
            />
            {mode === 'create' && (
              <p className="text-xs text-muted-foreground">{strings.opportunities.salesOwnerHint}</p>
            )}
            {errors.salesOwnerId && (
              <p className="text-sm text-destructive">{errors.salesOwnerId.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? strings.common.saving : strings.common.save}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              {strings.common.cancel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
