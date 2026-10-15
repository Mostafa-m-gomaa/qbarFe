import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import type { Project } from '@/api/projects/projects.types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ErrorState } from '@/components/feedback/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { strings } from '@/constants/strings';
import { ActorLabel } from '@/components/common/actor-label';
import { formatOpportunityTypeStatus } from '@/features/opportunities/opportunity-label';
import { getErrorMessage } from '@/lib/get-error-message';

import { useCloseTender, useProjectOpportunities } from './use-projects';

interface CloseTenderDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CloseTenderDialog({ project, open, onOpenChange }: CloseTenderDialogProps) {
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const closeTender = useCloseTender();

  // Eligible winners = the project's active, Open Tender opportunities.
  const { data, isLoading, isError, error, refetch } = useProjectOpportunities(
    open ? project.id : undefined,
    { status: 'Open', type: 'Tender', lifecycle: 'active', limit: 100 },
  );

  useEffect(() => {
    if (!open) setWinnerId(null);
  }, [open]);

  const eligible = data?.items ?? [];

  const submit = () => {
    if (!winnerId) return;
    closeTender.mutate(
      { id: project.id, body: { winnerOpportunityId: winnerId } },
      {
        onSuccess: () => {
          toast.success(strings.projects.closeTenderSuccess);
          onOpenChange(false);
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{strings.projects.closeTenderTitle}</DialogTitle>
          <DialogDescription>{strings.projects.closeTenderIntro(project.name)}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-full" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState error={error} onRetry={() => void refetch()} />
        ) : eligible.length === 0 ? (
          <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
            {strings.projects.closeTenderNoEligible}
          </p>
        ) : (
          <fieldset className="space-y-2">
            <legend className="mb-1 text-sm font-medium">{strings.projects.selectWinner}</legend>
            {eligible.map((opp) => (
              <label
                key={opp.id}
                className="flex cursor-pointer items-center gap-3 rounded-md border border-border px-3 py-2.5 hover:bg-muted"
              >
                <input
                  type="radio"
                  name="tender-winner"
                  value={opp.id}
                  checked={winnerId === opp.id}
                  onChange={() => setWinnerId(opp.id)}
                  className="size-4"
                />
                <span className="flex flex-col gap-0.5 text-sm">
                  <span className="font-medium">{opp.name}</span>
                  <span className="text-muted-foreground">
                    {formatOpportunityTypeStatus(opp.type, opp.status)}
                  </span>
                  {opp.salesOwnerUser || opp.salesOwnerId ? (
                    <span className="text-xs text-muted-foreground">
                      <ActorLabel
                        user={opp.salesOwnerUser}
                        fallbackUserId={opp.salesOwnerId ?? undefined}
                      />
                    </span>
                  ) : null}
                </span>
              </label>
            ))}
          </fieldset>
        )}

        <DialogFooter>
          <Button
            onClick={submit}
            disabled={!winnerId || closeTender.isPending || eligible.length === 0}
          >
            {closeTender.isPending ? strings.common.saving : strings.projects.closeTender}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={closeTender.isPending}
          >
            {strings.common.cancel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
