import { MoreHorizontal, Pencil, Power, PowerOff } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import type { User } from '@/api/users/users.types';
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
import { useAnyPermission, usePermission } from '@/hooks/use-permission';
import { getErrorMessage } from '@/lib/get-error-message';

import { useActivateUser, useDeactivateUser } from './use-users';

interface UserRowActionsProps {
  user: User;
  onEdit: (user: User) => void;
}

export function UserRowActions({ user, onEdit }: UserRowActionsProps) {
  const canUpdate = usePermission(PERMISSIONS.users.update);
  const canActivate = usePermission(PERMISSIONS.users.activate);
  const canDeactivate = usePermission(PERMISSIONS.users.deactivate);
  const hasAny = useAnyPermission([
    PERMISSIONS.users.update,
    PERMISSIONS.users.activate,
    PERMISSIONS.users.deactivate,
  ]);

  const activate = useActivateUser();
  const deactivate = useDeactivateUser();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!hasAny) return null;

  const handleActivate = () => {
    activate.mutate(user.id, {
      onSuccess: () => toast.success(strings.users.activated),
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  };

  const handleDeactivate = () => {
    deactivate.mutate(user.id, {
      onSuccess: () => {
        toast.success(strings.users.deactivated);
        setConfirmOpen(false);
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
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
            <DropdownMenuItem onClick={() => onEdit(user)}>
              <Pencil />
              {strings.common.edit}
            </DropdownMenuItem>
          )}
          {user.isActive
            ? canDeactivate && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setConfirmOpen(true)}
                >
                  <PowerOff />
                  {strings.users.deactivate}
                </DropdownMenuItem>
              )
            : canActivate && (
                <DropdownMenuItem onClick={handleActivate} disabled={activate.isPending}>
                  <Power />
                  {strings.users.activate}
                </DropdownMenuItem>
              )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={strings.users.deactivateTitle}
        description={strings.users.deactivateBody(user.name)}
        confirmLabel={strings.users.deactivate}
        destructive
        loading={deactivate.isPending}
        onConfirm={handleDeactivate}
      />
    </>
  );
}
