import type { User } from '@/api/users/users.types';
import { ActiveBadge } from '@/components/common/status-badge';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { strings } from '@/constants/strings';
import { formatDate, formatDateTime } from '@/lib/format';
import { useRoleMap } from '@/features/roles/use-roles';

import { UserRowActions } from './user-row-actions';

interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
}

export function UsersTable({ users, onEdit }: UsersTableProps) {
  const roleMap = useRoleMap();

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{strings.users.name}</TableHead>
            <TableHead>{strings.auth.email}</TableHead>
            <TableHead>{strings.users.roles}</TableHead>
            <TableHead>{strings.common.status}</TableHead>
            <TableHead>{strings.users.lastLogin}</TableHead>
            <TableHead>{strings.users.createdAt}</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell className="text-muted-foreground" dir="ltr">
                <span className="block text-start">{user.email}</span>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {user.roleIds.length === 0 ? (
                    <span className="text-sm text-muted-foreground">—</span>
                  ) : (
                    user.roleIds.map((id) => (
                      <Badge key={id} variant="secondary">
                        {roleMap.get(id)?.name ?? id}
                      </Badge>
                    ))
                  )}
                </div>
              </TableCell>
              <TableCell>
                <ActiveBadge active={user.isActive} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDateTime(user.lastLoginAt)}
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
              <TableCell>
                <UserRowActions user={user} onEdit={onEdit} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
