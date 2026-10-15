import { z } from 'zod';

import type { FollowUpType } from '@/api/follow-ups/follow-ups.types';

const FOLLOW_UP_TYPES: readonly [FollowUpType, ...FollowUpType[]] = [
  'Call',
  'Email',
  'Visit',
  'Site Visit',
  'Consultant Visit',
  'Procurement Visit',
];

export const FOLLOW_UP_TYPE_OPTIONS = FOLLOW_UP_TYPES;

export const followUpFormSchema = z.object({
  opportunityId: z.string().min(1, 'Opportunity is required'),
  quotationId: z.string(),
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  type: z.enum(FOLLOW_UP_TYPES),
  assignedToId: z.string().min(1, 'Assignee is required'),
  dueAt: z.string().min(1, 'Due date is required'),
  notes: z.string().max(4000, 'Notes are too long'),
});

export type FollowUpFormValues = z.infer<typeof followUpFormSchema>;

export const emptyFollowUpForm: FollowUpFormValues = {
  opportunityId: '',
  quotationId: '',
  title: '',
  type: 'Call',
  assignedToId: '',
  dueAt: '',
  notes: '',
};

export const completeFollowUpSchema = z.object({
  outcome: z.string().min(1, 'Outcome is required').max(2000, 'Outcome is too long'),
  notes: z.string().max(4000, 'Notes are too long'),
});

export type CompleteFollowUpFormValues = z.infer<typeof completeFollowUpSchema>;
