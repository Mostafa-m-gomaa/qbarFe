import { ShieldCheck } from 'lucide-react';

import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { TableSkeleton } from '@/components/feedback/skeletons';
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

import { useRoles } from './use-roles';

export function RolesPage() {
  const { data: roles, isLoading, isError, error, refetch } = useRoles();

  return (
    <div className="space-y-6">
      <PageHeader title={strings.roles.title} description={strings.roles.subtitle} />

      {isLoading ? (
        <TableSkeleton rows={4} columns={3} />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : !roles || roles.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title={strings.roles.emptyTitle}
          description={strings.roles.emptyHint}
        />
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{strings.roles.name}</TableHead>
                <TableHead>{strings.roles.description}</TableHead>
                <TableHead>{strings.roles.permissionCount}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell className="text-muted-foreground">{role.description || '—'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{role.permissions.length}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
