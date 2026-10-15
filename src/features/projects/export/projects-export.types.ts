/** Flat export row — one line per quantity item (project fields repeated). */

export const EXPORT_PROJECT_COLUMNS = [
  'number',
  'name',
  'stage',
  'type',
  'status',
  'executionState',
  'department',
  'customer',
  'site',
  'city',
  'country',
  'consultant',
  'contractor',
  'executionOwner',
  'salesOwners',
  'operationalStatus',
  'poContractRef',
  'poDate',
  'drawingSubmittedOn',
  'drawingApprovedOn',
  'productionRequiredOn',
  'deliveryTargetOn',
  'nextAction',
  'actionDueOn',
  'expectedClosingDate',
  'createdBy',
  'createdAt',
  'lineNo',
  'itemType',
  'rating',
  'conductor',
  'plating',
  'poles',
  'meters',
  'meterPrice',
  'value',
] as const;

export type ExportProjectColumn = (typeof EXPORT_PROJECT_COLUMNS)[number];

export type ExportProjectRow = Record<ExportProjectColumn, string>;

export interface ProjectsExportLookups {
  consultantName: (id: string | null) => string;
  contractorName: (id: string | null) => string;
  userName: (id: string | null) => string;
  usersNames: (ids: string[]) => string;
}
