import { CalendarClock } from 'lucide-react';

import type { Next7DaysItem } from '@/api/dashboard/dashboard.types';
import type { User } from '@/api/users/users.types';
import { EmptyState } from '@/components/feedback/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { strings } from '@/constants/strings';
import { ACTIVITY_TYPE_LABELS, labelFor } from '@/lib/enums';
import { formatDate } from '@/lib/format';

interface Next7DaysPanelProps {
  items: Next7DaysItem[];
  userMap: Map<string, User>;
}

/** Upcoming follow-ups within the next 7 days. */
export function Next7DaysPanel({ items, userMap }: Next7DaysPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{strings.dashboard.next7}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title={strings.dashboard.next7Empty}
            description={strings.dashboard.next7EmptyHint}
          />
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.activityId} className="flex items-center justify-between gap-3 py-2.5">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <CalendarClock className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">
                      {labelFor(ACTIVITY_TYPE_LABELS, item.type)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {userMap.get(item.assignedUserId)?.name ?? '—'}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(item.nextFollowUpOn)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
