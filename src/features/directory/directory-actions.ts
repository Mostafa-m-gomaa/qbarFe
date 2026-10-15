import type { DirectoryStatus } from '@/api/directory/directory.types';

/**
 * Which lifecycle actions are valid from a given status, mirroring the backend state machine
 * (`set-*-status.use-case`): activate ← inactive|archived, deactivate ← active,
 * archive ← active|inactive. This is UX gating only — the backend stays authoritative and may
 * still reject (e.g. an entry referenced by a non-archived project).
 */
export interface DirectoryActionAvailability {
  canActivateFrom: boolean;
  canDeactivateFrom: boolean;
  canArchiveFrom: boolean;
}

export function directoryActionsFor(status: DirectoryStatus): DirectoryActionAvailability {
  return {
    canActivateFrom: status === 'inactive' || status === 'archived',
    canDeactivateFrom: status === 'active',
    canArchiveFrom: status === 'active' || status === 'inactive',
  };
}
