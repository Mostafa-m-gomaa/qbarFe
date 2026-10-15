/** Activity DTOs — transcribed from the backend activity response contract (7.14).
 *  Activities are project-scoped only; there is no opportunityId. */

export type ActivityType =
  | 'Call'
  | 'Email'
  | 'Visit'
  | 'Site Visit'
  | 'Consultant Visit'
  | 'Procurement Visit';

export type ActivityLifecycle = 'active' | 'cancelled';

export interface Activity {
  id: string;
  projectId: string;
  type: ActivityType;
  occurredOn: string;
  notes: string;
  nextAction: string;
  nextFollowUpOn: string;
  assignedUserId: string | null;
  completed: boolean;
  completedAt: string | null;
  lifecycle: ActivityLifecycle;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateActivityRequest {
  projectId: string;
  type: ActivityType;
  occurredOn: string;
  nextAction: string;
  nextFollowUpOn: string;
  notes?: string;
  assignedUserId?: string;
}

export interface UpdateActivityRequest {
  type?: ActivityType;
  occurredOn?: string;
  nextAction?: string;
  nextFollowUpOn?: string;
  notes?: string;
  assignedUserId?: string;
}

export interface ListActivitiesParams {
  page?: number;
  limit?: number;
  q?: string;
  projectId?: string;
  assignedUserId?: string;
  type?: ActivityType;
  /** Backend expects the string 'true' | 'false'. */
  completed?: 'true' | 'false';
  dueFrom?: string;
  dueTo?: string;
}
