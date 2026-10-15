import { useState } from 'react';

import type { Quotation, QuotationCommercialStatus } from '@/api/quotations/quotations.types';
import { StatusChip } from '@/components/common/status-chip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { QUOTATION_COMMERCIAL_STATUS_ACCESS } from '@/constants/permissions';
import { strings } from '@/constants/strings';
import { useAnyPermission } from '@/hooks/use-permission';
import { QUOTATION_COMMERCIAL_STATUS_LABELS } from '@/lib/enums';

import { CommercialStatusDialog } from './commercial-status-dialog';
import { COMMERCIAL_STATUS_VALUES } from './quotation-commercial.utils';

interface QuotationCommercialStatusControlProps {
  quotation: Quotation;
  variant?: 'compact' | 'full';
  onUpdated?: (quotation: Quotation) => void;
}

export function QuotationCommercialStatusControl({
  quotation,
  variant = 'compact',
  onUpdated,
}: QuotationCommercialStatusControlProps) {
  const canChange = useAnyPermission(QUOTATION_COMMERCIAL_STATUS_ACCESS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<QuotationCommercialStatus | null>(null);

  const stopRowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const openForStatus = (status: QuotationCommercialStatus) => {
    setTargetStatus(status);
    setDialogOpen(true);
  };

  if (!canChange) {
    return (
      <StatusChip
        kind="quotationCommercialStatus"
        value={quotation.commercialStatus}
        className={variant === 'compact' ? 'whitespace-nowrap' : undefined}
      />
    );
  }

  return (
    <div onClick={stopRowClick} onKeyDown={(e) => e.stopPropagation()} role="presentation">
      <Select
        value={quotation.commercialStatus}
        onValueChange={(value) => {
          const next = value as QuotationCommercialStatus;
          if (next !== quotation.commercialStatus) openForStatus(next);
        }}
      >
        <SelectTrigger
          className={variant === 'compact' ? 'h-8 min-w-[9rem]' : 'h-9 w-full max-w-xs'}
          aria-label={strings.quotations.commercialStatus}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {COMMERCIAL_STATUS_VALUES.map((status) => (
            <SelectItem key={status} value={status}>
              {QUOTATION_COMMERCIAL_STATUS_LABELS[status] ?? status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <CommercialStatusDialog
        quotation={quotation}
        targetStatus={targetStatus}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={onUpdated}
      />
    </div>
  );
}
