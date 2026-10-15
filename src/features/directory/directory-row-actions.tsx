import { Archive, MoreHorizontal, Pencil, Power, PowerOff } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import type { DirectoryEntry } from '@/api/directory/directory.types';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { strings } from '@/constants/strings';
import { useAnyPermission, usePermission } from '@/hooks/use-permission';
import { getErrorMessage } from '@/lib/get-error-message';

import { directoryActionsFor } from './directory-actions';
import type { DirectoryConfig } from './directory-config';
import { useDirectoryLifecycle } from './use-directory';

interface DirectoryRowActionsProps {
  config: DirectoryConfig;
  entry: DirectoryEntry;
  onEdit: (entry: DirectoryEntry) => void;
}

type ConfirmKind = 'deactivate' | 'archive' | null;

export function DirectoryRowActions({ config, entry, onEdit }: DirectoryRowActionsProps) {
  const { permissions, noun } = config;
  const canUpdate = usePermission(permissions.update);
  const canActivate = usePermission(permissions.activate);
  const canDeactivate = usePermission(permissions.deactivate);
  const canArchive = usePermission(permissions.archive);
  const hasAny = useAnyPermission([
    permissions.update,
    permissions.activate,
    permissions.deactivate,
    permissions.archive,
  ]);

  const lifecycle = useDirectoryLifecycle(config);
  const [confirm, setConfirm] = useState<ConfirmKind>(null);

  if (!hasAny) return null;

  const available = directoryActionsFor(entry.status);
  const showActivate = canActivate && available.canActivateFrom;
  const showDeactivate = canDeactivate && available.canDeactivateFrom;
  const showArchive = canArchive && available.canArchiveFrom;

  const run = (action: 'activate' | 'deactivate' | 'archive', successMessage: string) => {
    lifecycle.mutate(
      { id: entry.id, action },
      {
        onSuccess: () => {
          toast.success(successMessage);
          setConfirm(null);
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={strings.common.actions}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canUpdate && (
            <DropdownMenuItem onClick={() => onEdit(entry)}>
              <Pencil />
              {strings.common.edit}
            </DropdownMenuItem>
          )}
          {showActivate && (
            <DropdownMenuItem
              onClick={() => run('activate', strings.directory.activated(noun))}
              disabled={lifecycle.isPending}
            >
              <Power />
              {strings.directory.activate}
            </DropdownMenuItem>
          )}
          {showDeactivate && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setConfirm('deactivate')}
            >
              <PowerOff />
              {strings.directory.deactivate}
            </DropdownMenuItem>
          )}
          {showArchive && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setConfirm('archive')}
            >
              <Archive />
              {strings.directory.archive}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirm === 'deactivate'}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={strings.directory.deactivateTitle(noun)}
        description={strings.directory.deactivateBody(entry.company)}
        confirmLabel={strings.directory.deactivate}
        destructive
        loading={lifecycle.isPending}
        onConfirm={() => run('deactivate', strings.directory.deactivated(noun))}
      />

      <ConfirmDialog
        open={confirm === 'archive'}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={strings.directory.archiveTitle(noun)}
        description={strings.directory.archiveBody(entry.company)}
        confirmLabel={strings.directory.archive}
        destructive
        loading={lifecycle.isPending}
        onConfirm={() => run('archive', strings.directory.archived(noun))}
      />
    </>
  );
}
