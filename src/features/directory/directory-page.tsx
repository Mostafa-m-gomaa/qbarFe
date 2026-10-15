import { Plus } from 'lucide-react';
import { useState } from 'react';

import type { DirectoryEntry, DirectoryStatus } from '@/api/directory/directory.types';
import { FilterBar } from '@/components/common/filter-bar';
import { PageHeader } from '@/components/common/page-header';
import { Pagination } from '@/components/common/pagination';
import { PermissionGate } from '@/components/common/permission-gate';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { TableSkeleton } from '@/components/feedback/skeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { strings } from '@/constants/strings';

import type { DirectoryConfig } from './directory-config';
import { DirectoryFormDialog } from './directory-form-dialog';
import { DirectoryTable } from './directory-table';
import { useDirectoryList } from './use-directory';

type StatusFilter = 'all' | DirectoryStatus;

const PAGE_SIZE = 20;

interface DirectoryPageProps {
  config: DirectoryConfig;
}

/**
 * Shared list screen for the Consultants and Contractors directories, which have an identical
 * backend contract. The concrete route pages pass their `config`.
 */
export function DirectoryPage({ config }: DirectoryPageProps) {
  const [status, setStatus] = useState<StatusFilter>('all');
  const [country, setCountry] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DirectoryEntry | null>(null);

  const params = {
    page,
    limit: PAGE_SIZE,
    ...(status === 'all' ? {} : { status }),
    ...(country.trim() ? { country: country.trim() } : {}),
    ...(q.trim() ? { q: q.trim() } : {}),
  };
  const { data, isLoading, isError, error, refetch } = useDirectoryList(config, params);

  // Any filter change invalidates the current page cursor.
  const resetTo = <T,>(setter: (value: T) => void) => {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  };

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (entry: DirectoryEntry) => {
    setEditing(entry);
    setDialogOpen(true);
  };

  const createButton = (variant?: 'outline') => (
    <PermissionGate permission={config.permissions.create}>
      <Button onClick={openCreate} variant={variant}>
        <Plus />
        {strings.directory.create(config.noun)}
      </Button>
    </PermissionGate>
  );

  const entries = data?.items ?? [];
  const hasActiveFilters = status !== 'all' || country.trim() !== '' || q.trim() !== '';

  return (
    <div className="space-y-6">
      <PageHeader
        title={config.title}
        description={config.subtitle}
        actions={createButton()}
      />

      <FilterBar>
        <Input
          className="w-64"
          placeholder={strings.directory.searchPlaceholder}
          value={q}
          onChange={(e) => resetTo(setQ)(e.target.value)}
        />
        <Input
          className="w-48"
          placeholder={strings.directory.countryPlaceholder}
          value={country}
          onChange={(e) => resetTo(setCountry)(e.target.value)}
        />
        <Select
          value={status}
          onValueChange={(value) => resetTo<StatusFilter>(setStatus)(value as StatusFilter)}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{strings.common.all}</SelectItem>
            <SelectItem value="active">{strings.common.active}</SelectItem>
            <SelectItem value="inactive">{strings.common.inactive}</SelectItem>
            <SelectItem value="archived">{strings.common.archived}</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>

      {isLoading ? (
        <TableSkeleton rows={6} columns={6} />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={config.icon}
          title={strings.directory.emptyTitle(config.nounPlural)}
          description={
            hasActiveFilters ? strings.common.noResults : strings.directory.emptyHint(config.noun)
          }
          action={hasActiveFilters ? undefined : createButton('outline')}
        />
      ) : (
        <>
          <DirectoryTable config={config} entries={entries} onEdit={openEdit} />
          <Pagination
            page={data?.page ?? 1}
            limit={data?.limit ?? PAGE_SIZE}
            total={data?.total ?? entries.length}
            onPageChange={setPage}
          />
        </>
      )}

      <DirectoryFormDialog
        config={config}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        entry={editing}
      />
    </div>
  );
}
