import { Archive, Award, Lock, MoreHorizontal, RotateCcw, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { isApiError } from '@/api/client/api-error';
import type { Opportunity } from '@/api/opportunities/opportunities.types';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PERMISSIONS } from '@/constants/permissions';
import { strings } from '@/constants/strings';
import { usePermission } from '@/hooks/use-permission';
import { getErrorMessage } from '@/lib/get-error-message';

import { opportunityActions } from './opportunity-actions';
import { OpportunityLostDialog } from './opportunity-lost-dialog';
import {
  useArchiveOpportunity,
  useCloseOpportunity,
  useMarkOpportunityWon,
  useReopenOpportunity,
} from './use-opportunities';

interface OpportunityActionsProps {
  opportunity: Opportunity;
  /** `buttons` for the detail header, `menu` for a table row. */
  variant: 'buttons' | 'menu';
}

export function OpportunityActions({ opportunity, variant }: OpportunityActionsProps) {
  const canStage = usePermission(PERMISSIONS.opportunities.stage);
  const canArchive = usePermission(PERMISSIONS.opportunities.archive);
  const availability = opportunityActions(opportunity, { canStage, canArchive });

  const closeTender = useCloseOpportunity();
  const won = useMarkOpportunityWon();
  const reopen = useReopenOpportunity();
  const archive = useArchiveOpportunity();

  const [confirm, setConfirm] = useState<'close' | 'won' | 'reopen' | 'archive' | null>(null);
  const [lostOpen, setLostOpen] = useState(false);

  const anyPending =
    closeTender.isPending || won.isPending || reopen.isPending || archive.isPending;
  const hasAny =
    availability.canCloseTender ||
    availability.canWin ||
    availability.canLose ||
    availability.canReopen ||
    availability.canArchive;
  if (!hasAny) return null;

  const runCloseTender = () =>
    closeTender.mutate(opportunity.id, {
      onSuccess: () => {
        toast.success(strings.opportunities.closeTenderSuccess);
        setConfirm(null);
      },
      onError: (e) => toast.error(getErrorMessage(e)),
    });

  const runWon = () =>
    won.mutate(opportunity.id, {
      onSuccess: () => {
        toast.success(strings.opportunities.wonSuccess);
        setConfirm(null);
      },
      onError: (e) => toast.error(getErrorMessage(e)),
    });

  const runReopen = () =>
    reopen.mutate(opportunity.id, {
      onSuccess: () => {
        toast.success(strings.opportunities.reopenSuccess);
        setConfirm(null);
      },
      onError: (e) => {
        // 409 = an active purchase order blocks reopening.
        const blocked = isApiError(e) && (e.httpStatus === 409 || e.code === 'CONFLICT');
        toast.error(blocked ? strings.opportunities.reopenBlocked : getErrorMessage(e));
      },
    });

  const runArchive = () =>
    archive.mutate(opportunity.id, {
      onSuccess: () => {
        toast.success(strings.opportunities.archived);
        setConfirm(null);
      },
      onError: (e) => toast.error(getErrorMessage(e)),
    });

  const dialogs = (
    <>
      <ConfirmDialog
        open={confirm === 'close'}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={strings.opportunities.closeTenderTitle}
        description={strings.opportunities.closeTenderBody}
        confirmLabel={strings.opportunities.closeTender}
        loading={closeTender.isPending}
        onConfirm={runCloseTender}
      />
      <ConfirmDialog
        open={confirm === 'won'}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={strings.opportunities.wonTitle}
        description={strings.opportunities.wonBody}
        confirmLabel={strings.opportunities.won}
        loading={won.isPending}
        onConfirm={runWon}
      />
      <ConfirmDialog
        open={confirm === 'reopen'}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={strings.opportunities.reopenTitle}
        description={strings.opportunities.reopenBody}
        confirmLabel={strings.opportunities.reopen}
        loading={reopen.isPending}
        onConfirm={runReopen}
      />
      <ConfirmDialog
        open={confirm === 'archive'}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={strings.opportunities.archiveTitle}
        description={strings.opportunities.archiveBody}
        confirmLabel={strings.opportunities.archive}
        destructive
        loading={archive.isPending}
        onConfirm={runArchive}
      />
      <OpportunityLostDialog opportunity={opportunity} open={lostOpen} onOpenChange={setLostOpen} />
    </>
  );

  if (variant === 'menu') {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={strings.common.actions}>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {availability.canCloseTender && (
              <DropdownMenuItem onClick={() => setConfirm('close')}>
                <Lock />
                {strings.opportunities.closeTender}
              </DropdownMenuItem>
            )}
            {availability.canWin && (
              <DropdownMenuItem onClick={() => setConfirm('won')}>
                <Award />
                {strings.opportunities.won}
              </DropdownMenuItem>
            )}
            {availability.canLose && (
              <DropdownMenuItem onClick={() => setLostOpen(true)}>
                <XCircle />
                {strings.opportunities.lost}
              </DropdownMenuItem>
            )}
            {availability.canReopen && (
              <DropdownMenuItem onClick={() => setConfirm('reopen')}>
                <RotateCcw />
                {strings.opportunities.reopen}
              </DropdownMenuItem>
            )}
            {availability.canArchive && (
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setConfirm('archive')}
              >
                <Archive />
                {strings.opportunities.archive}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        {dialogs}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {availability.canCloseTender && (
          <Button size="sm" variant="outline" onClick={() => setConfirm('close')} disabled={anyPending}>
            <Lock />
            {strings.opportunities.closeTender}
          </Button>
        )}
        {availability.canWin && (
          <Button size="sm" onClick={() => setConfirm('won')} disabled={anyPending}>
            <Award />
            {strings.opportunities.won}
          </Button>
        )}
        {availability.canLose && (
          <Button size="sm" variant="outline" onClick={() => setLostOpen(true)} disabled={anyPending}>
            <XCircle />
            {strings.opportunities.lost}
          </Button>
        )}
        {availability.canReopen && (
          <Button size="sm" variant="outline" onClick={() => setConfirm('reopen')} disabled={anyPending}>
            <RotateCcw />
            {strings.opportunities.reopen}
          </Button>
        )}
        {availability.canArchive && (
          <Button
            size="sm"
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={() => setConfirm('archive')}
            disabled={anyPending}
          >
            <Archive />
            {strings.opportunities.archive}
          </Button>
        )}
      </div>
      {dialogs}
    </>
  );
}
