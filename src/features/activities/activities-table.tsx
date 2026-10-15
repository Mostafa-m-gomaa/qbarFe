import { Link } from 'react-router-dom';

import type { Activity } from '@/api/activities/activities.types';
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
import { useProjectMap, useUserMap } from '@/features/crm/lookups';
import { formatDate } from '@/lib/format';

import { activityDisplayStatus } from './activity-actions';
import { ActivityRowActions } from './activity-row-actions';

interface ActivitiesTableProps {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  /** Hide the project column when rendered inside a single project. */
  hideProject?: boolean;
}

export function ActivitiesTable({ activities, onEdit, hideProject }: ActivitiesTableProps) {
  const projectMap = useProjectMap();
  const userMap = useUserMap();

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {!hideProject && <TableHead>{strings.activities.project}</TableHead>}
            <TableHead>{strings.activities.type}</TableHead>
            <TableHead>{strings.activities.occurredOn}</TableHead>
            <TableHead>{strings.activities.nextAction}</TableHead>
            <TableHead>{strings.activities.nextFollowUp}</TableHead>
            <TableHead>{strings.activities.assignedTo}</TableHead>
            <TableHead>{strings.activities.status}</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.map((activity) => {
            const displayStatus = activityDisplayStatus(activity);
            return (
              <TableRow key={activity.id}>
                {!hideProject && (
                  <TableCell className="font-medium">
                    <Link to={`/app/projects/${activity.projectId}`} className="hover:underline">
                      {projectMap.get(activity.projectId)?.name ?? activity.projectId}
                    </Link>
                  </TableCell>
                )}
                <TableCell>
                  <StatusChip kind="activityType" value={activity.type} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(activity.occurredOn)}
                </TableCell>
                <TableCell className={hideProject ? 'font-medium' : undefined}>
                  {activity.nextAction}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(activity.nextFollowUpOn)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {activity.assignedUserId
                    ? (userMap.get(activity.assignedUserId)?.name ?? activity.assignedUserId)
                    : strings.activities.unassigned}
                </TableCell>
                <TableCell>
                  <StatusChip kind="activityStatus" value={displayStatus} />
                </TableCell>
                <TableCell>
                  <ActivityRowActions activity={activity} onEdit={onEdit} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
