import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import type { FollowUp } from '@/api/follow-ups/follow-ups.types';
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
import { strings } from '@/constants/strings';
import { getErrorMessage } from '@/lib/get-error-message';

import {
  completeFollowUpSchema,
  type CompleteFollowUpFormValues,
} from './follow-up.schema';
import { useCompleteFollowUp } from './use-follow-ups';

interface FollowUpCompleteDialogProps {
  followUp: FollowUp | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FollowUpCompleteDialog({
  followUp,
  open,
  onOpenChange,
}: FollowUpCompleteDialogProps) {
  const complete = useCompleteFollowUp();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompleteFollowUpFormValues>({
    resolver: zodResolver(completeFollowUpSchema),
    defaultValues: { outcome: '', notes: '' },
  });

  useEffect(() => {
    if (open && followUp) {
      reset({ outcome: '', notes: followUp.notes ?? '' });
    }
  }, [open, followUp, reset]);

  const onSubmit = (values: CompleteFollowUpFormValues) => {
    if (!followUp) return;
    complete.mutate(
      {
        id: followUp.id,
        body: {
          expectedRevision: followUp.revision,
          outcome: values.outcome.trim(),
          notes: values.notes.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(strings.followUps.completed);
          onOpenChange(false);
        },
        onError: (e) => toast.error(getErrorMessage(e)),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{strings.followUps.completeTitle}</DialogTitle>
          <DialogDescription>{strings.followUps.completeSubtitle}</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="fu-outcome">{strings.followUps.outcome}</Label>
            <textarea
              id="fu-outcome"
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              aria-invalid={Boolean(errors.outcome)}
              {...register('outcome')}
            />
            {errors.outcome && (
              <p className="text-sm text-destructive">{errors.outcome.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="fu-complete-notes">{strings.followUps.notes}</Label>
            <textarea
              id="fu-complete-notes"
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              {...register('notes')}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={complete.isPending}>
              {complete.isPending ? strings.common.saving : strings.followUps.complete}
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
