/** Display labels for backend enum values. Keys must match backend strings exactly. */

export const PROJECT_STAGE_LABELS: Record<string, string> = {
  Lead: 'Lead',
  Quotation: 'Quotation',
  Negotiation: 'Negotiation',
  PO: 'PO',
  Project: 'Project',
};

export const PROJECT_TYPE_LABELS: Record<string, string> = {
  Tender: 'Tender',
  'In Hand': 'In Hand',
};

export const OPPORTUNITY_STATUS_LABELS: Record<string, string> = {
  Open: 'Open',
  'Tender Closed': 'Tender Closed',
  Won: 'Won',
  Lost: 'Lost',
};

export const QUOTATION_STATUS_LABELS: Record<string, string> = {
  Draft: 'Draft',
  Issued: 'Issued',
  'Revision Draft': 'Revision Draft',
};

export const QUOTATION_COMMERCIAL_STATUS_LABELS: Record<string, string> = {
  Active: 'Active',
  Won: 'Won',
  Lost: 'Lost',
  Cancelled: 'Cancelled',
  ConvertedToCables: 'Converted to cables',
  OnHold: 'On hold',
  ContractorChanged: 'Contractor changed',
};

export const PURCHASE_ORDER_STATUS_LABELS: Record<string, string> = {
  Active: 'Active',
  Cancelled: 'Cancelled',
};

export const DIRECTORY_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  archived: 'Archived',
};

export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  Call: 'Call',
  Email: 'Email',
  Visit: 'Visit',
  'Site Visit': 'Site Visit',
  'Consultant Visit': 'Consultant Visit',
  'Procurement Visit': 'Procurement Visit',
};

export const OPPORTUNITY_LIFECYCLE_LABELS: Record<string, string> = {
  active: 'Active',
  archived: 'Archived',
};

/**
 * Derived, presentation-only activity status (activities have no backend status field — they
 * carry `completed`, `completedAt`, `lifecycle` and `nextFollowUpOn`). Not business state.
 */
export const ACTIVITY_STATUS_LABELS: Record<string, string> = {
  Open: 'Open',
  Overdue: 'Overdue',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
};

export const FOLLOW_UP_DUE_STATE_LABELS: Record<string, string> = {
  overdue: 'Overdue',
  today: 'Today',
  upcoming: 'Upcoming',
  none: '—',
};

export const FOLLOW_UP_STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const MANUFACTURING_CLEARANCE_STATUS_LABELS: Record<string, string> = {
  'Cleared for Manufacturing': 'Cleared for Manufacturing',
  'Partially Produced': 'Partially Produced',
  Produced: 'Produced',
  'Partially Ready for Delivery': 'Partially Ready for Delivery',
  'Ready for Delivery': 'Ready for Delivery',
  Closed: 'Closed',
};

/** Returns a display label for a value, falling back to the raw value. */
export function labelFor(map: Record<string, string>, value: string): string {
  return map[value] ?? value;
}
