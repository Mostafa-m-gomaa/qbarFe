import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { isApiError } from '@/api/client/api-error';
import type { Quotation, QuotationCommercialStatus } from '@/api/quotations/quotations.types';
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
import { ContractorCombobox } from '@/features/contractors/contractor-combobox';
import { useContractorOptions } from '@/features/crm/lookups';
import { getErrorMessage } from '@/lib/get-error-message';
import { QUOTATION_COMMERCIAL_STATUS_LABELS } from '@/lib/enums';

import {
  buildCommercialStatusPayload,
  type CommercialStatusFormValues,
} from './commercial-status.schema';
import { COMMERCIAL_STATUS_VALUES, commercialStatusRequiresForm } from './quotation-commercial.utils';
import { useSetCommercialStatus } from './use-quotations';

interface CommercialStatusDialogProps {
  quotation: Quotation;
  /** Fixed status when opening from a quick action; omit in pickerMode. */
  targetStatus: QuotationCommercialStatus | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (quotation: Quotation) => void;
  /** Lets user choose any commercial status (list “Status” button). */
  pickerMode?: boolean;
}

const emptyForm: CommercialStatusFormValues = {
  competitorName: '',
  reasonLost: '',
  details: '',
  cancellationReason: '',
  note: '',
  holdReason: '',
  newContractorId: '',
  reasonNote: '',
};

export function CommercialStatusDialog({
  quotation,
  targetStatus,
  open,
  onOpenChange,
  onSuccess,
  pickerMode = false,
}: CommercialStatusDialogProps) {
  const setStatus = useSetCommercialStatus(quotation.id);
  const contractorOptions = useContractorOptions();
  const contractorOptionsFiltered = useMemo(
    () => contractorOptions.filter((o) => o.value !== quotation.contractorId),
    [contractorOptions, quotation.contractorId],
  );
  const [form, setForm] = useState<CommercialStatusFormValues>(emptyForm);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [pickedStatus, setPickedStatus] = useState<QuotationCommercialStatus>(
    quotation.commercialStatus,
  );

  const effectiveStatus = pickerMode ? pickedStatus : targetStatus;

  useEffect(() => {
    if (open) {
      setForm(emptyForm);
      setFieldError(null);
      if (pickerMode) {
        setPickedStatus(quotation.commercialStatus);
      }
    }
  }, [open, targetStatus, pickerMode, quotation.commercialStatus]);

  if (!effectiveStatus) return null;

  const statusLabel = QUOTATION_COMMERCIAL_STATUS_LABELS[effectiveStatus] ?? effectiveStatus;
  const needsForm = commercialStatusRequiresForm(effectiveStatus);

  const submit = () => {
    if (pickerMode && pickedStatus === quotation.commercialStatus) {
      onOpenChange(false);
      return;
    }
    setFieldError(null);
    try {
      const body = buildCommercialStatusPayload(effectiveStatus, form);
      setStatus.mutate(body, {
        onSuccess: (q) => {
          toast.success(strings.quotations.commercialStatusUpdated);
          onOpenChange(false);
          onSuccess?.(q);
        },
        onError: (error) => {
          if (isApiError(error) && error.httpStatus === 403) {
            toast.error(strings.quotations.commercialStatusForbidden);
            return;
          }
          if (isApiError(error) && error.httpStatus === 400) {
            toast.error(strings.quotations.commercialStatusInvalid);
            return;
          }
          toast.error(getErrorMessage(error));
        },
      });
    } catch (e) {
      setFieldError(e instanceof Error ? e.message : strings.quotations.commercialStatusInvalid);
    }
  };

  const set = (key: keyof CommercialStatusFormValues, value: string | null) => {
    setForm((prev) => ({ ...prev, [key]: value ?? '' }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {pickerMode
              ? strings.quotations.commercialStatusChangeTitle
              : `${strings.quotations.commercialStatusChangeTitle} — ${statusLabel}`}
          </DialogTitle>
          <DialogDescription>
            {effectiveStatus === 'Won'
              ? strings.quotations.markCommercialWonBody
              : strings.quotations.commercialStatusChangeHint}
          </DialogDescription>
        </DialogHeader>

        {pickerMode && (
          <div className="space-y-2 py-1">
            <Label>{strings.quotations.commercialStatus}</Label>
            <Select
              value={pickedStatus}
              onValueChange={(v) => {
                setPickedStatus(v as QuotationCommercialStatus);
                setForm(emptyForm);
                setFieldError(null);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMMERCIAL_STATUS_VALUES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {QUOTATION_COMMERCIAL_STATUS_LABELS[status] ?? status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {needsForm && (
          <div className="space-y-4 py-2">
            {effectiveStatus === 'Lost' && (
              <>
                <Field label={strings.quotations.commercialLostCompetitor} required>
                  <Input
                    value={form.competitorName ?? ''}
                    onChange={(e) => set('competitorName', e.target.value)}
                  />
                </Field>
                <Field label={strings.quotations.commercialLostReason} required>
                  <Textarea
                    rows={3}
                    value={form.reasonLost ?? ''}
                    onChange={(e) => set('reasonLost', e.target.value)}
                  />
                </Field>
                <Field label={strings.quotations.commercialLostDetails}>
                  <Textarea
                    rows={2}
                    value={form.details ?? ''}
                    onChange={(e) => set('details', e.target.value)}
                  />
                </Field>
              </>
            )}
            {effectiveStatus === 'Cancelled' && (
              <Field label={strings.quotations.commercialCancelledReason} required>
                <Textarea
                  rows={3}
                  value={form.cancellationReason ?? ''}
                  onChange={(e) => set('cancellationReason', e.target.value)}
                />
              </Field>
            )}
            {effectiveStatus === 'ConvertedToCables' && (
              <Field label={strings.quotations.commercialConvertedNote}>
                <Textarea rows={3} value={form.note ?? ''} onChange={(e) => set('note', e.target.value)} />
              </Field>
            )}
            {effectiveStatus === 'OnHold' && (
              <Field label={strings.quotations.commercialOnHoldReason}>
                <Textarea
                  rows={3}
                  value={form.holdReason ?? ''}
                  onChange={(e) => set('holdReason', e.target.value)}
                />
              </Field>
            )}
            {effectiveStatus === 'ContractorChanged' && (
              <>
                <Field label={strings.quotations.commercialNewContractor} required>
                  <ContractorCombobox
                    value={form.newContractorId || null}
                    onChange={(id) => set('newContractorId', id ?? '')}
                    options={contractorOptionsFiltered}
                    placeholder={strings.quotations.selectContractor}
                  />
                </Field>
                <Field label={strings.quotations.commercialContractorReason} required>
                  <Textarea
                    rows={3}
                    value={form.reasonNote ?? ''}
                    onChange={(e) => set('reasonNote', e.target.value)}
                  />
                </Field>
              </>
            )}
            {fieldError && <p className="text-sm text-destructive">{fieldError}</p>}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {strings.common.cancel}
          </Button>
          <Button type="button" onClick={submit} disabled={setStatus.isPending}>
            {strings.common.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required ? ' *' : ''}
      </Label>
      {children}
    </div>
  );
}
