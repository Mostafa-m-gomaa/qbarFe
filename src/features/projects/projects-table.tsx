import { Eye, MoreHorizontal, Pencil } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import type { Project } from '@/api/projects/projects.types';
import { StatusChip } from '@/components/common/status-chip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PERMISSIONS } from '@/constants/permissions';
import { strings } from '@/constants/strings';
import { useConsultantMap, useUserMap } from '@/features/crm/lookups';
import { usePermission } from '@/hooks/use-permission';
import { formatDate } from '@/lib/format';

import { executionStateLabel } from './project-actions';

interface ProjectsTableProps {
  projects: Project[];
  selectedIds: string[];
  allPageSelected: boolean;
  onToggleRow: (id: string, checked: boolean) => void;
  onToggleAllPage: (checked: boolean) => void;
}

export function ProjectsTable({
  projects,
  selectedIds,
  allPageSelected,
  onToggleRow,
  onToggleAllPage,
}: ProjectsTableProps) {
  const navigate = useNavigate();
  const userMap = useUserMap();
  const consultantMap = useConsultantMap();
  const canUpdate = usePermission(PERMISSIONS.projects.update);

  const ownerNames = (ids: string[]) => ids.map((id) => userMap.get(id)?.name ?? id);

  return (
    <div className="overflow-x-auto rounded-xl border border-border/60 bg-card/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-10">
              <Checkbox
                checked={allPageSelected}
                onCheckedChange={(v) => onToggleAllPage(v === true)}
                aria-label={strings.common.selectAll}
              />
            </TableHead>
            <TableHead>{strings.projects.number}</TableHead>
            <TableHead>{strings.projects.name}</TableHead>
            <TableHead>{strings.projects.type}</TableHead>
            <TableHead>{strings.projects.stage}</TableHead>
            <TableHead>{strings.projects.salesOwners}</TableHead>
            <TableHead>{strings.projects.consultant}</TableHead>
            <TableHead>{strings.projects.location}</TableHead>
            <TableHead>{strings.projects.expectedClose}</TableHead>
            <TableHead>{strings.common.status}</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            const owners = ownerNames(project.salesPersonIds);
            const location = [project.city, project.country].filter(Boolean).join(', ');
            const selected = selectedIds.includes(project.id);
            return (
              <TableRow
                key={project.id}
                className="cursor-pointer hover:bg-muted/30"
                onClick={() => navigate(`/app/projects/${project.id}`)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selected}
                    onCheckedChange={(v) => onToggleRow(project.id, v === true)}
                    aria-label={project.name}
                  />
                </TableCell>
                <TableCell>
                  {project.number ? (
                    <Badge variant="outline" className="font-mono text-xs font-normal">
                      {project.number}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">{strings.common.none}</span>
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  <Link
                    to={`/app/projects/${project.id}`}
                    className="hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {project.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <StatusChip kind="projectType" value={project.type} />
                </TableCell>
                <TableCell>
                  <StatusChip kind="projectStage" value={project.stage} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {owners.length === 0 ? (
                    strings.common.none
                  ) : owners.length <= 2 ? (
                    owners.join(', ')
                  ) : (
                    `${owners.slice(0, 2).join(', ')} +${owners.length - 2}`
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {project.consultantId
                    ? (consultantMap.get(project.consultantId) ?? project.consultantId)
                    : strings.common.none}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {location || strings.common.none}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(project.expectedClosingDate)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <StatusChip kind="directoryStatus" value={project.status} />
                    <span className="text-xs text-muted-foreground">
                      {executionStateLabel(project.executionState)}
                    </span>
                  </div>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label={strings.common.actions}>
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/app/projects/${project.id}`)}>
                        <Eye />
                        {strings.common.view}
                      </DropdownMenuItem>
                      {canUpdate && project.status === 'active' && project.executionState === 'open' && (
                        <DropdownMenuItem onClick={() => navigate(`/app/projects/${project.id}/edit`)}>
                          <Pencil />
                          {strings.common.edit}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
