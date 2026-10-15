import type { Activity } from '@/api/activities/activities.types';

export interface ActivityActionPerms {
  canUpdate: boolean;
  canComplete: boolean;
  canArchive: boolean;
}

export interface ActivityActionAvailability {
  canEdit: boolean;
  canComplete: boolean;
  canArchive: boolean;
}

/**
 * Which activity actions to surface — mirrors the backend guards: completed or cancelled
 * activities cannot be edited or completed; a cancelled activity cannot be re-archived.
 */
export function activityActions(
  activity: Pick<Activity, 'completed' | 'lifecycle'>,
  perms: ActivityActionPerms,
): ActivityActionAvailability {
  const cancelled = activity.lifecycle === 'cancelled';
  const editable = !activity.completed && !cancelled;
  return {
    canEdit: perms.canUpdate && editable,
    canComplete: perms.canComplete && editable,
    canArchive: perms.canArchive && !cancelled,
  };
}

export type ActivityDisplayStatus = 'Cancelled' | 'Completed' | 'Overdue' | 'Open';

/**
 * Presentation-only status derived from `lifecycle`, `completed` and `nextFollowUpOn`
 * (activities have no backend status field). Overdue = an open activity whose next follow-up
 * date is before today. Not business state.
 */
export function activityDisplayStatus(
  activity: Pick<Activity, 'completed' | 'lifecycle' | 'nextFollowUpOn'>,
  now: Date = new Date(),
): ActivityDisplayStatus {
  if (activity.lifecycle === 'cancelled') return 'Cancelled';
  if (activity.completed) return 'Completed';
  const due = new Date(activity.nextFollowUpOn);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!Number.isNaN(due.getTime()) && due < startOfToday) return 'Overdue';
  return 'Open';
}
