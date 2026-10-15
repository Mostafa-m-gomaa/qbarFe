import type { FollowUp } from '@/api/follow-ups/follow-ups.types';

export interface FollowUpActionContext {
  currentUserId: string | undefined;
  canUpdate: boolean;
  canComplete: boolean;
  canCancel: boolean;
}

function isOwnerOrAssignee(followUp: FollowUp, userId: string | undefined): boolean {
  if (!userId) return false;
  const ownerId = followUp.opportunity?.salesOwnerId;
  return followUp.assignedToId === userId || ownerId === userId;
}

export function followUpActions(followUp: FollowUp, ctx: FollowUpActionContext) {
  const open = followUp.status === 'open';
  const canMutate = isOwnerOrAssignee(followUp, ctx.currentUserId);

  return {
    canEdit: open && ctx.canUpdate && canMutate,
    canComplete: open && ctx.canComplete && canMutate,
    canCancel: open && ctx.canCancel && canMutate,
  };
}
