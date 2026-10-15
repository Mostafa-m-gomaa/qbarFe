import type { ProjectDetail, ProjectItem } from '@/api/projects/projects.types';
import { formatDate, formatDateTime } from '@/lib/format';

import type {
  ExportProjectColumn,
  ExportProjectRow,
  ProjectsExportLookups,
} from './projects-export.types';

const empty = '';

function baseRow(project: ProjectDetail, lookups: ProjectsExportLookups): ExportProjectRow {
  const m = project.milestones;
  return {
    number: project.number ?? empty,
    name: project.name,
    stage: project.stage,
    type: project.type,
    status: project.status,
    executionState: project.executionState,
    department: project.department ?? empty,
    customer: project.customer ?? empty,
    site: project.site ?? empty,
    city: project.city ?? empty,
    country: project.country ?? empty,
    consultant: lookups.consultantName(project.consultantId),
    contractor: lookups.contractorName(project.contractorId),
    executionOwner: lookups.userName(project.executionOwnerId),
    salesOwners: lookups.usersNames(project.salesPersonIds),
    operationalStatus: project.operationalStatus ?? empty,
    poContractRef: project.poContractRef ?? empty,
    poDate: formatDate(project.poDate),
    drawingSubmittedOn: formatDate(m.drawingSubmittedOn),
    drawingApprovedOn: formatDate(m.drawingApprovedOn),
    productionRequiredOn: formatDate(m.productionRequiredOn),
    deliveryTargetOn: formatDate(m.deliveryTargetOn),
    nextAction: project.nextAction ?? empty,
    actionDueOn: formatDate(project.actionDueOn),
    expectedClosingDate: formatDate(project.expectedClosingDate),
    createdBy: project.createdByUser?.name ?? lookups.userName(project.createdBy),
    createdAt: formatDateTime(project.createdAt),
    lineNo: empty,
    itemType: empty,
    rating: empty,
    conductor: empty,
    plating: empty,
    poles: empty,
    meters: empty,
    meterPrice: empty,
    value: empty,
  };
}

function itemFields(item: ProjectItem): Pick<
  ExportProjectRow,
  'lineNo' | 'itemType' | 'rating' | 'conductor' | 'plating' | 'poles' | 'meters' | 'meterPrice' | 'value'
> {
  return {
    lineNo: String(item.lineNo),
    itemType: item.itemType,
    rating: item.rating,
    conductor: item.conductor,
    plating: item.plating,
    poles: item.poles,
    meters: item.meters,
    meterPrice: item.meterPrice,
    value: item.value,
  };
}

export function detailToExportRows(
  project: ProjectDetail,
  lookups: ProjectsExportLookups,
): ExportProjectRow[] {
  const header = baseRow(project, lookups);
  const items = [...(project.items ?? [])].sort((a, b) => a.lineNo - b.lineNo);
  if (items.length === 0) return [header];
  return items.map((item) => ({ ...header, ...itemFields(item) }));
}

export function projectsToExportRows(
  projects: ProjectDetail[],
  lookups: ProjectsExportLookups,
): ExportProjectRow[] {
  return projects.flatMap((p) => detailToExportRows(p, lookups));
}

export function exportColumnLabels(): Record<ExportProjectColumn, string> {
  return {
    number: 'Number',
    name: 'Name',
    stage: 'Stage',
    type: 'Type',
    status: 'Status',
    executionState: 'Execution',
    department: 'Department',
    customer: 'Customer',
    site: 'Site',
    city: 'City',
    country: 'Country',
    consultant: 'Consultant',
    contractor: 'Contractor',
    executionOwner: 'Execution owner',
    salesOwners: 'Sales owners',
    operationalStatus: 'Operational status',
    poContractRef: 'PO / contract ref',
    poDate: 'PO date',
    drawingSubmittedOn: 'Drawing submitted',
    drawingApprovedOn: 'Drawing approved',
    productionRequiredOn: 'Production required',
    deliveryTargetOn: 'Delivery target',
    nextAction: 'Next action',
    actionDueOn: 'Action due',
    expectedClosingDate: 'Expected closing',
    createdBy: 'Created by',
    createdAt: 'Created at',
    lineNo: 'Line',
    itemType: 'Item type',
    rating: 'Rating',
    conductor: 'Conductor',
    plating: 'Plating',
    poles: 'Poles',
    meters: 'Meters',
    meterPrice: 'Meter price',
    value: 'Value',
  };
}
