import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/cn';

interface KpiCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: LucideIcon;
  /** Semantic accent for the icon chip. */
  tone?: 'primary' | 'success' | 'warning' | 'info' | 'destructive';
  /** When set, the card navigates to this route on click. */
  to?: string;
}

const toneClasses: Record<NonNullable<KpiCardProps['tone']>, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-info/10 text-info',
  destructive: 'bg-destructive/10 text-destructive',
};

export function KpiCard({ label, value, hint, icon: Icon, tone = 'primary', to }: KpiCardProps) {
  const content = (
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0 space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="truncate text-2xl font-bold tracking-tight">{value}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-lg',
            toneClasses[tone],
          )}
        >
          <Icon className="size-5" />
        </span>
      </CardContent>
  );

  if (to) {
    return (
      <Link to={to} className="block rounded-xl transition-opacity hover:opacity-90">
        <Card className="h-full cursor-pointer">{content}</Card>
      </Link>
    );
  }

  return <Card>{content}</Card>;
}
