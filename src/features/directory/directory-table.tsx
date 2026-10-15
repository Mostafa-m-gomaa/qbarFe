import type { DirectoryEntry } from '@/api/directory/directory.types';
import { StatusChip } from '@/components/common/status-chip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { strings } from '@/constants/strings';
import { useUserMap } from '@/features/crm/lookups';
import { formatDateTime } from '@/lib/format';

import type { DirectoryConfig } from './directory-config';
import { DirectoryRowActions } from './directory-row-actions';

interface DirectoryTableProps {
  config: DirectoryConfig;
  entries: DirectoryEntry[];
  onEdit: (entry: DirectoryEntry) => void;
}

export function DirectoryTable({ config, entries, onEdit }: DirectoryTableProps) {
  const userMap = useUserMap();

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{strings.directory.company}</TableHead>
            <TableHead>{strings.directory.country}</TableHead>
            <TableHead>{strings.directory.contacts}</TableHead>
            <TableHead>{strings.common.status}</TableHead>
            <TableHead>{strings.directory.createdBy}</TableHead>
            <TableHead>{strings.directory.updatedBy}</TableHead>
            <TableHead>{strings.directory.createdAt}</TableHead>
            <TableHead>{strings.directory.updatedAt}</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="font-medium">{entry.company}</TableCell>
              <TableCell className="text-muted-foreground">
                {entry.country || strings.common.none}
              </TableCell>
              <TableCell className="text-muted-foreground">
                <ContactsCell contacts={entry.contacts} />
              </TableCell>
              <TableCell>
                <StatusChip kind="directoryStatus" value={entry.status} />
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {userMap.get(entry.createdBy)?.name ?? entry.createdBy}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {userMap.get(entry.updatedBy)?.name ?? entry.updatedBy}
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDateTime(entry.createdAt)}</TableCell>
              <TableCell className="text-muted-foreground">{formatDateTime(entry.updatedAt)}</TableCell>
              <TableCell>
                <DirectoryRowActions config={config} entry={entry} onEdit={onEdit} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/** Primary contact plus a count of the rest — keeps the row scannable without a nested table. */
function ContactsCell({ contacts }: { contacts: DirectoryEntry['contacts'] }) {
  if (contacts.length === 0) {
    return <span>{strings.directory.noContacts}</span>;
  }
  const [first, ...rest] = contacts;
  return (
    <span>
      <span className="text-foreground">{first.name}</span>
      {rest.length > 0 && ` +${rest.length}`}
    </span>
  );
}
