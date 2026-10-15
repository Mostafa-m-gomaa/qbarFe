import { Plus, Users as UsersIcon } from 'lucide-react';
import { useState } from 'react';

import type { User } from '@/api/users/users.types';
import { PageHeader } from '@/components/common/page-header';
import { PermissionGate } from '@/components/common/permission-gate';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { TableSkeleton } from '@/components/feedback/skeletons';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PERMISSIONS } from '@/constants/permissions';
import { strings } from '@/constants/strings';

import { UserFormDialog } from './user-form-dialog';
import { UsersTable } from './users-table';
import { useUsers } from './use-users';

type StatusFilter = 'all' | 'active' | 'inactive';

export function UsersPage() {
  const [status, setStatus] = useState<StatusFilter>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  const params = status === 'all' ? {} : { isActive: status === 'active' };
  const { data: users, isLoading, isError, error, refetch } = useUsers(params);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={strings.users.title}
        description={strings.users.subtitle}
        actions={
          <PermissionGate permission={PERMISSIONS.users.create}>
            <Button onClick={openCreate}>
              <Plus />
              {strings.users.create}
            </Button>
          </PermissionGate>
        }
      />

      <div className="flex items-center gap-3">
        <Select value={status} onValueChange={(value) => setStatus(value as StatusFilter)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{strings.common.all}</SelectItem>
            <SelectItem value="active">{strings.common.active}</SelectItem>
            <SelectItem value="inactive">{strings.common.inactive}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} columns={7} />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : !users || users.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title={strings.users.emptyTitle}
          description={strings.users.emptyHint}
          action={
            <PermissionGate permission={PERMISSIONS.users.create}>
              <Button onClick={openCreate} variant="outline">
                <Plus />
                {strings.users.create}
              </Button>
            </PermissionGate>
          }
        />
      ) : (
        <UsersTable users={users} onEdit={openEdit} />
      )}

      <UserFormDialog open={dialogOpen} onOpenChange={setDialogOpen} user={editing} />
    </div>
  );
}
