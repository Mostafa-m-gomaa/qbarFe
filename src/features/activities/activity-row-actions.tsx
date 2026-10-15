import { Archive, CheckCircle2, MoreHorizontal, Pencil } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import type { Activity } from '@/api/activities/activities.types';
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

import { activityActions } from './activity-actions';
import { useArchiveActivity, useCompleteActivity } from './use-activities';

interface ActivityRowActionsProps {
  activity: Activity;
  onEdit: (activity: Activity) => void;
}

export function ActivityRowActions({ activity, onEdit }: ActivityRowActionsProps) {
  const canUpdate = usePermission(PERMISSIONS.activities.update);
  const canComplete = usePermission(PERMISSIONS.activities.complete);
  const canArchive = usePermission(PERMISSIONS.activities.archive);
  const availability = activityActions(activity, { canUpdate, canComplete, canArchive });

  const complete = useCompleteActivity();
  const archive = useArchiveActivity();

  const [confirm, setConfirm] = useState<'complete' | 'archive' | null>(null);

  const hasAny = availability.canEdit || availability.canComplete || availability.canArchive;
  if (!hasAny) return null;

  const runComplete = () =>
    complete.mutate(activity.id, {
      onSuccess: () => {
        toast.success(strings.activities.completed);
        setConfirm(null);
      },
      onError: (e) => toast.error(getErrorMessage(e)),
    });

  const runArchive = () =>
    archive.mutate(activity.id, {
      onSuccess: () => {
        toast.success(strings.activities.archived);
        setConfirm(null);
      },
      onError: (e) => toast.error(getErrorMessage(e)),
    });

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
            <DropdownMenuItem onClick={() => onEdit(activity)}>
              <Pencil />
              {strings.common.edit}
            </DropdownMenuItem>
          )}
          {availability.canComplete && (
            <DropdownMenuItem onClick={() => setConfirm('complete')}>
              <CheckCircle2 />
              {strings.activities.complete}
            </DropdownMenuItem>
          )}
          {availability.canArchive && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setConfirm('archive')}
            >
              <Archive />
              {strings.activities.archive}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirm === 'complete'}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={strings.activities.completeTitle}
        description={strings.activities.completeBody}
        confirmLabel={strings.activities.complete}
        loading={complete.isPending}
        onConfirm={runComplete}
      />
      <ConfirmDialog
        open={confirm === 'archive'}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={strings.activities.archiveTitle}
        description={strings.activities.archiveBody}
        confirmLabel={strings.activities.archive}
        destructive
        loading={archive.isPending}
        onConfirm={runArchive}
      />
    </>
  );
}
