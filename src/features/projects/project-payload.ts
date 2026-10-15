import type { ProjectDepartment } from '@/api/projects/project-enums';
import type {
  CreateProjectRequest,
  ProjectDetail,
  ProjectItemWrite,
  UpdateProjectRequest,
} from '@/api/projects/projects.types';

import type { ProjectFormValues, ProjectItemFormValues } from './project.schema';

function toDateInput(value: string | null | undefined): string {
  if (!value) return '';
  return value.slice(0, 10);
}

function emptyToUndefined(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function idOrNull(value: string): string | null {
  return value.trim().length > 0 ? value : null;
}

export function projectToFormValues(project: ProjectDetail): ProjectFormValues {
  return {
    name: project.name,
    type: project.type,
    customer: project.customer ?? '',
    site: project.site ?? '',
    country: project.country ?? '',
    city: project.city ?? '',
    consultantId: project.consultantId ?? '',
    contractorId: project.contractorId ?? '',
    executionOwnerId: project.executionOwnerId ?? '',
    department: project.department ?? '',
    salesPersonIds: project.salesPersonIds,
    poContractRef: project.poContractRef ?? '',
    operationalStatus: project.operationalStatus ?? '',
    poDate: toDateInput(project.poDate),
    manufacturingClearanceOn: toDateInput(project.manufacturingClearanceOn),
    paymentDueOn: toDateInput(project.paymentDueOn),
    nextAction: project.nextAction ?? '',
    actionOwnerId: project.actionOwnerId ?? '',
    actionDueOn: toDateInput(project.actionDueOn),
    drawingSubmittedOn: toDateInput(project.milestones?.drawingSubmittedOn),
    drawingApprovedOn: toDateInput(project.milestones?.drawingApprovedOn),
    productionRequiredOn: toDateInput(project.milestones?.productionRequiredOn),
    deliveryTargetOn: toDateInput(project.milestones?.deliveryTargetOn),
    expectedClosingDate: toDateInput(project.expectedClosingDate),
    notes: project.notes ?? '',
    items: project.items.map(itemRowToFormValues),
  };
}

export function itemRowToFormValues(item: ProjectDetail['items'][number]): ProjectItemFormValues {
  return {
    id: item.id,
    itemType: item.itemType,
    rating: item.rating,
    conductor: item.conductor,
    plating: item.plating,
    poles: item.poles,
    meters: item.meters,
    meterPrice: item.meterPrice,
    allocatedClearedQuantityScaled: item.allocatedClearedQuantityScaled,
  };
}

export function buildItemsSyncPayload(rows: ProjectItemFormValues[]): ProjectItemWrite[] {
  return rows.map((row) => {
    const line: ProjectItemWrite = {
      itemType: row.itemType,
      rating: row.rating,
      conductor: row.conductor,
      plating: row.plating,
      poles: row.poles,
      meters: row.meters.trim(),
      meterPrice: row.meterPrice.trim(),
    };
    if (row.id) line.id = row.id;
    return line;
  });
}

function sharedFormFields(values: ProjectFormValues): ProjectFormWriteFields {
  return {
    customer: emptyToNull(values.customer),
    site: emptyToUndefined(values.site),
    country: emptyToUndefined(values.country),
    city: emptyToUndefined(values.city),
    contractorId: idOrNull(values.contractorId),
    executionOwnerId: idOrNull(values.executionOwnerId),
    department: values.department ? (values.department as ProjectDepartment) : null,
    poContractRef: emptyToNull(values.poContractRef),
    operationalStatus:
      values.operationalStatus && values.operationalStatus.length > 0
        ? values.operationalStatus
        : null,
    poDate: emptyToNull(values.poDate),
    manufacturingClearanceOn: emptyToNull(values.manufacturingClearanceOn),
    paymentDueOn: emptyToNull(values.paymentDueOn),
    nextAction: emptyToNull(values.nextAction),
    actionOwnerId: idOrNull(values.actionOwnerId),
    actionDueOn: emptyToNull(values.actionDueOn),
    drawingSubmittedOn: emptyToNull(values.drawingSubmittedOn),
    drawingApprovedOn: emptyToNull(values.drawingApprovedOn),
    productionRequiredOn: emptyToNull(values.productionRequiredOn),
    deliveryTargetOn: emptyToNull(values.deliveryTargetOn),
    expectedClosingDate: emptyToNull(values.expectedClosingDate),
    notes: emptyToUndefined(values.notes),
    items: buildItemsSyncPayload(values.items),
  };
}

type ProjectFormWriteFields = Omit<CreateProjectRequest, 'name' | 'type' | 'salesPersonIds'>;

export function formValuesToCreatePayload(values: ProjectFormValues): CreateProjectRequest {
  const shared = sharedFormFields(values);
  const consultantId = values.consultantId.trim();
  return {
    name: values.name.trim(),
    type: values.type,
    ...(values.salesPersonIds.length > 0 ? { salesPersonIds: values.salesPersonIds } : {}),
    ...shared,
    ...(consultantId ? { consultantId } : {}),
  };
}

export function formValuesToUpdatePayload(values: ProjectFormValues): UpdateProjectRequest {
  const shared = sharedFormFields(values);
  return {
    name: values.name.trim(),
    consultantId: idOrNull(values.consultantId),
    salesPersonIds: values.salesPersonIds,
    ...shared,
  };
}
