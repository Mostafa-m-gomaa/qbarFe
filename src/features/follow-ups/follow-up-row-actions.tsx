import { Ban, CheckCircle2, MoreHorizontal, Pencil } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import type { FollowUp } from '@/api/follow-ups/follow-ups.types';
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
import { followUpActions } from '@/features/follow-ups/follow-up-actions';
import { usePermission } from '@/hooks/use-permission';
import { useAuthStore } from '@/stores/auth/auth.store';
import { getErrorMessage } from '@/lib/get-error-message';

import { FollowUpCompleteDialog } from './follow-up-complete-dialog';
import { useCancelFollowUp } from './use-follow-ups';

interface FollowUpRowActionsProps {
  followUp: FollowUp;
  onEdit: (followUp: FollowUp) => void;
}

export function FollowUpRowActions({ followUp, onEdit }: FollowUpRowActionsProps) {
  const userId = useAuthStore((s) => s.user?.id);
  const canUpdate = usePermission(PERMISSIONS.followUps.update);
  const canComplete = usePermission(PERMISSIONS.followUps.complete);
  const canCancel = usePermission(PERMISSIONS.followUps.cancel);
  const availability = followUpActions(followUp, {
    currentUserId: userId,
    canUpdate,
    canComplete,
    canCancel,
  });

  const cancelMutation = useCancelFollowUp();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);

  const hasAny = availability.canEdit || availability.canComplete || availability.canCancel;
  if (!hasAny) return null;

  const runCancel = () =>
    cancelMutation.mutate(
      { id: followUp.id, body: { expectedRevision: followUp.revision } },
      {
        onSuccess: () => {
          toast.success(strings.followUps.cancelled);
          setConfirmCancel(false);
        },
        onError: (e) => toast.error(getErrorMessage(e)),
      },
    );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={strings.common.actions}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {availability.canEdit && (
            <DropdownMenuItem onClick={() => onEdit(followUp)}>
              <Pencil />
              {strings.common.edit}
            </DropdownMenuItem>
          )}
          {availability.canComplete && (
            <DropdownMenuItem onClick={() => setCompleteOpen(true)}>
              <CheckCircle2 />
              {strings.followUps.complete}
            </DropdownMenuItem>
          )}
          {availability.canCancel && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setConfirmCancel(true)}
            >
              <Ban />
              {strings.followUps.cancel}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <FollowUpCompleteDialog
        followUp={followUp}
        open={completeOpen}
        onOpenChange={setCompleteOpen}
      />

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title={strings.followUps.cancelTitle}
        description={strings.followUps.cancelBody}
        confirmLabel={strings.followUps.cancel}
        destructive
        loading={cancelMutation.isPending}
        onConfirm={runCancel}
      />
    </>
  );
}
