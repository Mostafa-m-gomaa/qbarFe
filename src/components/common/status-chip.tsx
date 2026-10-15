import { Badge, type BadgeProps } from '@/components/ui/badge';
import {
  ACTIVITY_STATUS_LABELS,
  ACTIVITY_TYPE_LABELS,
  DIRECTORY_STATUS_LABELS,
  FOLLOW_UP_DUE_STATE_LABELS,
  FOLLOW_UP_STATUS_LABELS,
  OPPORTUNITY_STATUS_LABELS,
  PROJECT_STAGE_LABELS,
  PROJECT_TYPE_LABELS,
  MANUFACTURING_CLEARANCE_STATUS_LABELS,
  PURCHASE_ORDER_STATUS_LABELS,
  QUOTATION_COMMERCIAL_STATUS_LABELS,
  QUOTATION_STATUS_LABELS,
  labelFor,
} from '@/lib/enums';

type Variant = NonNullable<BadgeProps['variant']>;

type ChipKind =
  | 'projectStage'
  | 'projectType'
  | 'opportunityStatus'
  | 'quotationStatus'
  | 'quotationCommercialStatus'
  | 'purchaseOrderStatus'
  | 'directoryStatus'
  | 'activityType'
  | 'activityStatus'
  | 'followUpDueState'
  | 'followUpStatus'
  | 'lifecycle'
  | 'manufacturingClearance';

const LABELS: Record<ChipKind, Record<string, string>> = {
  projectStage: PROJECT_STAGE_LABELS,
  projectType: PROJECT_TYPE_LABELS,
  opportunityStatus: OPPORTUNITY_STATUS_LABELS,
  quotationStatus: QUOTATION_STATUS_LABELS,
  quotationCommercialStatus: QUOTATION_COMMERCIAL_STATUS_LABELS,
  purchaseOrderStatus: PURCHASE_ORDER_STATUS_LABELS,
  directoryStatus: DIRECTORY_STATUS_LABELS,
  activityType: ACTIVITY_TYPE_LABELS,
  activityStatus: ACTIVITY_STATUS_LABELS,
  followUpDueState: FOLLOW_UP_DUE_STATE_LABELS,
  followUpStatus: FOLLOW_UP_STATUS_LABELS,
  lifecycle: { active: 'Active', archived: 'Archived', cancelled: 'Cancelled' },
  manufacturingClearance: MANUFACTURING_CLEARANCE_STATUS_LABELS,
};

/** Semantic color per status value (falls back to neutral). */
const VARIANTS: Record<ChipKind, Record<string, Variant>> = {
  projectStage: {
    Lead: 'secondary',
    Quotation: 'info',
    Negotiation: 'warning',
    PO: 'success',
    Project: 'default',
  },
  projectType: { Tender: 'info', 'In Hand': 'default' },
  opportunityStatus: {
    Open: 'info',
    'Tender Closed': 'secondary',
    Won: 'success',
    Lost: 'destructive',
  },
  quotationStatus: { Draft: 'secondary', Issued: 'success', 'Revision Draft': 'warning' },
  quotationCommercialStatus: {
    Active: 'info',
    Won: 'success',
    Lost: 'destructive',
    Cancelled: 'outline',
    ConvertedToCables: 'secondary',
    OnHold: 'warning',
    ContractorChanged: 'info',
  },
  purchaseOrderStatus: { Active: 'success', Cancelled: 'destructive' },
  directoryStatus: { active: 'success', inactive: 'secondary', archived: 'outline' },
  activityType: {},
  activityStatus: {
    Open: 'info',
    Overdue: 'warning',
    Completed: 'success',
    Cancelled: 'outline',
  },
  followUpDueState: {
    overdue: 'warning',
    today: 'info',
    upcoming: 'secondary',
    none: 'outline',
  },
  followUpStatus: {
    open: 'info',
    completed: 'success',
    cancelled: 'outline',
  },
  lifecycle: { active: 'success', archived: 'outline', cancelled: 'destructive' },
  manufacturingClearance: {
    'Cleared for Manufacturing': 'info',
    'Partially Produced': 'warning',
    Produced: 'success',
    'Partially Ready for Delivery': 'warning',
    'Ready for Delivery': 'success',
    Closed: 'secondary',
  },
};

interface StatusChipProps {
  kind: ChipKind;
  value: string;
  className?: string;
}

/** Renders a backend enum value as a semantically colored, labeled badge. */
export function StatusChip({ kind, value, className }: StatusChipProps) {
  const variant = VARIANTS[kind][value] ?? 'secondary';
  return (
    <Badge variant={variant} className={className}>
      {labelFor(LABELS[kind], value)}
    </Badge>
  );
}
