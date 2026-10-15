/** Mirrors backend project / project-item enums (7.12). */

export const PROJECT_DEPARTMENTS = [
  'Sales',
  'Technical',
  'Factory',
  'Commercial',
  'Finance',
  'Logistics',
  'Management',
] as const;

export type ProjectDepartment = (typeof PROJECT_DEPARTMENTS)[number];

export const PROJECT_OPERATIONAL_STATUSES = [
  'PO Received',
  'Advance Payment Received',
  'Ready for Delivery',
  'Fully Delivered',
  'Invoiced',
  'Closed',
] as const;

export type ProjectOperationalStatus = (typeof PROJECT_OPERATIONAL_STATUSES)[number];

export const PROJECT_EXECUTION_STATES = ['open', 'closed'] as const;

export type ProjectExecutionState = (typeof PROJECT_EXECUTION_STATES)[number];

export const PROJECT_ITEM_TYPES = ['Sandwich Busbar', 'Medium Power', 'Custom'] as const;

export type ProjectItemType = (typeof PROJECT_ITEM_TYPES)[number];

export const PROJECT_ITEM_RATINGS = [
  '125A',
  '160A',
  '250A',
  '400A',
  '630A',
  '800A',
  '1000A',
  '1250A',
  '1600A',
  '2000A',
  '3200A',
  '4000A',
  '5000A',
] as const;

export type ProjectItemRating = (typeof PROJECT_ITEM_RATINGS)[number];

export const PROJECT_ITEM_CONDUCTORS = ['Copper', 'Aluminum'] as const;

export type ProjectItemConductor = (typeof PROJECT_ITEM_CONDUCTORS)[number];

export const PROJECT_ITEM_PLATINGS = ['Tin', 'Silver', 'Bare', 'Copper'] as const;

export type ProjectItemPlating = (typeof PROJECT_ITEM_PLATINGS)[number];

export const PROJECT_ITEM_POLES = ['4', '4.5', '5'] as const;

export type ProjectItemPoles = (typeof PROJECT_ITEM_POLES)[number];
