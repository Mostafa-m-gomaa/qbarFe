/**
 * Dashboard DTOs — mirror the backend `DashboardReport` exactly
 * (src/modules/reports/domain/report.types.ts). Do not add fields the API does not return.
 */

export interface MoneySummary {
  count: number;
  valueBaseAmountMinor: number;
}

export interface NamedCount {
  key: string;
  count: number;
}

export interface DashboardSummary {
  visibleProjects: number;
  openInHand: MoneySummary;
  overdueFollowUps: number;
  winRatePercent: number;
  wonCount: number;
  lostCount: number;
  issuedQuotations: MoneySummary;
}

export interface DashboardAttention {
  overdue: number;
  staleProjects: number;
  draftQuotesOlderThan7d: number;
  /** Null when the viewer lacks `quotations.view_cost`. */
  negativeMarginQuotes: number | null;
}

export interface ActivityBySalesperson {
  userId: string;
  count: number;
}

export interface Next7DaysItem {
  activityId: string;
  projectId: string;
  assignedUserId: string;
  type: string;
  nextFollowUpOn: string;
}

export interface DashboardResponse {
  asOf: string;
  baseCurrencyCode: string;
  summary: DashboardSummary;
  activityLast30BySalesperson: ActivityBySalesperson[];
  pipelineByStage: NamedCount[];
  attention: DashboardAttention;
  next7Days: Next7DaysItem[];
}
