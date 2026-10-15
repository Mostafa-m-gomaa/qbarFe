import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { strings } from '@/constants/strings';
import { cn } from '@/lib/cn';

interface DetailHeaderProps {
  title: string;
  /** Optional secondary line (e.g. ref code, breadcrumb-ish context). */
  subtitle?: ReactNode;
  /** Status chips / meta rendered under the title. */
  meta?: ReactNode;
  /** Right-aligned action buttons. */
  actions?: ReactNode;
  /** Optional explicit back target; defaults to browser back. */
  backTo?: string;
  className?: string;
}

/** Entity detail-page header used by Project / Quotation / PO detail views. */
export function DetailHeader({
  title,
  subtitle,
  meta,
  actions,
  backTo,
  className,
}: DetailHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className={cn('space-y-3', className)}>
      <Button
        variant="ghost"
        size="sm"
        className="-ms-2 h-8 gap-1 text-muted-foreground"
        onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
      >
        <ArrowLeft className="size-4" />
        {strings.common.back}
      </Button>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle && <div className="text-sm text-muted-foreground">{subtitle}</div>}
          {meta && <div className="flex flex-wrap items-center gap-2 pt-1">{meta}</div>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
