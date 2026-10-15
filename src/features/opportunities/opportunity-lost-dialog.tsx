import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import type { LossReason, Opportunity } from '@/api/opportunities/opportunities.types';
import { LOSS_REASONS } from '@/api/opportunities/opportunities.types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { strings } from '@/constants/strings';
import { getErrorMessage } from '@/lib/get-error-message';

import { useMarkOpportunityLost } from './use-opportunities';

interface OpportunityLostDialogProps {
  opportunity: Opportunity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OpportunityLostDialog({
  opportunity,
  open,
  onOpenChange,
}: OpportunityLostDialogProps) {
  const [lossReason, setLossReason] = useState<LossReason | ''>('');
  const [lossDetails, setLossDetails] = useState('');
  const [reasonError, setReasonError] = useState(false);
  const mutation = useMarkOpportunityLost();

  useEffect(() => {
    if (open) {
      setLossReason('');
      setLossDetails('');
      setReasonError(false);
    }
  }, [open]);

  const submit = () => {
    if (!lossReason) {
      setReasonError(true);
      return;
    }
    mutation.mutate(
      { id: opportunity.id, body: { lossReason, lossDetails: lossDetails.trim() || undefined } },
      {
        onSuccess: () => {
          toast.success(strings.opportunities.lostSuccess);
          onOpenChange(false);
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{strings.opportunities.lostTitle}</DialogTitle>
          <DialogDescription>{strings.opportunities.editSubtitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="loss-reason">{strings.opportunities.lostReasonLabel}</Label>
            <Select
              value={lossReason || undefined}
              onValueChange={(v) => {
                setLossReason(v as LossReason);
                setReasonError(false);
              }}
            >
              <SelectTrigger id="loss-reason" className="w-full" aria-invalid={reasonError}>
                <SelectValue placeholder={strings.opportunities.lostReasonPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {LOSS_REASONS.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {reasonError && (
              <p className="text-sm text-destructive">{strings.opportunities.lostReasonLabel}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="loss-details">{strings.opportunities.lostDetailsLabel}</Label>
            <textarea
              id="loss-details"
              rows={3}
              value={lossDetails}
              onChange={(e) => setLossDetails(e.target.value)}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="destructive" onClick={submit} disabled={mutation.isPending}>
            {mutation.isPending ? strings.common.saving : strings.opportunities.lostSubmit}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            {strings.common.cancel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
