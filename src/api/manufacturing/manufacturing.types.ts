/** Manufacturing DTOs — aligned with backend manufacturing clearance contract. */

export type ManufacturingClearanceStatus =
  | 'Cleared for Manufacturing'
  | 'Partially Produced'
  | 'Produced'
  | 'Partially Ready for Delivery'
  | 'Ready for Delivery'
  | 'Closed';

export interface ManufacturingProjectItemDto {
  id: string;
  label: string;
  itemType: string;
  rating: string;
  conductor: string;
  plating: string;
  poles: string;
  meters: string;
  quantityScaled: number;
  allocatedCleared: string;
  availableCleared: string;
  allocatedClearedQuantityScaled: number;
  availableClearedQuantityScaled: number;
}

export interface ManufacturingClearanceLineDto {
  id: string;
  projectItemId: string;
  itemType: string;
  rating: string;
  conductor: string;
  plating: string;
  poles: string;
  label: string;
  requiredQuantityScaled: number;
  clearedQuantityScaled: number;
  producedQuantityScaled: number;
  readyQuantityScaled: number;
  pendingQuantityScaled: number;
  availableQuantityScaled: number;
  required: string;
  cleared: string;
  produced: string;
  ready: string;
  pending: string;
  available: string;
}

export interface ManufacturingClearanceDto {
  id: string;
  projectId: string;
  number: string;
  status: ManufacturingClearanceStatus;
  clearanceDate: string;
  requiredProductionOn: string | null;
  remarks: string;
  revision: number;
  clearedQuantityScaled: number;
  producedQuantityScaled: number;
  readyQuantityScaled: number;
  pendingQuantityScaled: number;
  agingDays: number;
  clearedMeters: string;
  producedMeters: string;
  readyMeters: string;
  pendingMeters: string;
  lines: ManufacturingClearanceLineDto[];
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PendingManufacturingLineDto {
  projectId: string;
  projectNumber: string | null;
  projectName: string;
  clearanceId: string;
  clearanceNumber: string;
  clearanceDate: string;
  requiredProductionOn: string | null;
  status: ManufacturingClearanceStatus;
  lineId: string;
  projectItemId: string;
  itemLabel: string;
  requiredQuantityScaled: number;
  clearedQuantityScaled: number;
  producedQuantityScaled: number;
  pendingQuantityScaled: number;
  required: string;
  cleared: string;
  produced: string;
  pending: string;
  agingDays: number;
}

export interface CreateClearanceLineRequest {
  projectItemId: string;
  cleared: string | number;
}

export interface CreateClearanceRequest {
  number?: string;
  clearanceDate?: string;
  requiredProductionOn?: string;
  remarks?: string;
  lines: CreateClearanceLineRequest[];
}

export interface UpdateClearanceLineRequest {
  produced?: string | number;
  ready?: string | number;
}

export interface ProjectManufacturingSummaryDto {
  clearedQuantityScaled: number;
  producedQuantityScaled: number;
  readyQuantityScaled: number;
  manufacturingCompletionPercent: number;
  pendingProduction: string;
  pendingProductionQuantityScaled: number;
  timeline: {
    manufacturingClearanceOn: string | null;
  };
}
