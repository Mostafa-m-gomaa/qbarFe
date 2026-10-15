import type { ProjectExecutionState } from '@/api/projects/project-enums';
import type { Project } from '@/api/projects/projects.types';

/** Resolved permission booleans for the current user. */
export interface ProjectActionPerms {
  canUpdate: boolean;
  canStage: boolean;
  canCloseTender: boolean;
  canArchive: boolean;
  canCloseExecution: boolean;
  canReopenExecution: boolean;
}

export interface ProjectActionAvailability {
  canEdit: boolean;
  canChangeStage: boolean;
  canCloseTender: boolean;
  canArchive: boolean;
  canCloseExecution: boolean;
  canReopenExecution: boolean;
}

/**
 * Which project actions to surface. Presentation gating only — the backend is authoritative and
 * may still reject. Close Tender is only meaningful for an active Tender project that has not
 * already been closed (afterwards type becomes In Hand).
 */
export function projectActions(
  project: Pick<Project, 'status' | 'type' | 'tenderClosed' | 'executionState'>,
  perms: ProjectActionPerms,
): ProjectActionAvailability {
  const active = project.status === 'active';
  const executionOpen = project.executionState === 'open';
  const executionClosed = project.executionState === 'closed';
  return {
    canEdit: perms.canUpdate && active && executionOpen,
    canChangeStage: perms.canStage && active,
    canCloseTender:
      perms.canCloseTender && active && project.type === 'Tender' && !project.tenderClosed,
    canArchive: perms.canArchive && active,
    canCloseExecution: perms.canCloseExecution && active && executionOpen,
    canReopenExecution: perms.canReopenExecution && active && executionClosed,
  };
}

export const PROJECT_STAGES: readonly Project['stage'][] = [
  'Lead',
  'Quotation',
  'Negotiation',
  'PO',
  'Project',
];

export function executionStateLabel(state: ProjectExecutionState): string {
  return state === 'closed' ? 'Closed' : 'Open';
}
