import type { Opportunity } from '@/api/opportunities/opportunities.types';

export interface OpportunityActionPerms {
  canStage: boolean;
  canArchive: boolean;
}

export interface OpportunityActionAvailability {
  canCloseTender: boolean;
  canWin: boolean;
  canLose: boolean;
  canReopen: boolean;
  canArchive: boolean;
}

/**
 * Which opportunity actions to surface — mirrors backend stage guards. Presentation only.
 */
export function opportunityActions(
  opp: Pick<Opportunity, 'type' | 'status' | 'lifecycle'>,
  perms: OpportunityActionPerms,
): OpportunityActionAvailability {
  const active = opp.lifecycle === 'active';
  const tenderOpen = opp.type === 'Tender' && opp.status === 'Open';
  const inHandOpen = opp.type === 'In Hand' && opp.status === 'Open';
  const decided = opp.status === 'Won' || opp.status === 'Lost';
  return {
    canCloseTender: perms.canStage && active && tenderOpen,
    canWin: perms.canStage && active && inHandOpen,
    canLose: perms.canStage && active && inHandOpen,
    canReopen: perms.canStage && active && decided,
    canArchive: perms.canArchive && active,
  };
}
