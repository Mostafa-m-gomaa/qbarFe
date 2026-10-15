import { z } from 'zod';

import type { ActivityType } from '@/api/activities/activities.types';

const ACTIVITY_TYPES: readonly [ActivityType, ...ActivityType[]] = [
  'Call',
  'Email',
  'Visit',
  'Site Visit',
  'Consultant Visit',
  'Procurement Visit',
];

export const ACTIVITY_TYPE_OPTIONS = ACTIVITY_TYPES;

export const activityFormSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  type: z.enum(ACTIVITY_TYPES),
  occurredOn: z.string().min(1, 'Occurred date is required'),
  nextAction: z.string().min(1, 'Next action is required').max(200, 'Next action is too long'),
  nextFollowUpOn: z.string().min(1, 'Next follow-up date is required'),
  notes: z.string().max(4000, 'Notes are too long'),
  assignedUserId: z.string(),
});

export type ActivityFormValues = z.infer<typeof activityFormSchema>;

export const emptyActivityForm: ActivityFormValues = {
  projectId: '',
  type: 'Call',
  occurredOn: '',
  nextAction: '',
  nextFollowUpOn: '',
  notes: '',
  assignedUserId: '',
};
