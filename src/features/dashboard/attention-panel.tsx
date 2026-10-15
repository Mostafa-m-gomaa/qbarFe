import { AlarmClock, FileWarning, Hourglass, TrendingDown, type LucideIcon } from 'lucide-react';

import type { DashboardAttention } from '@/api/dashboard/dashboard.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { strings } from '@/constants/strings';
import { cn } from '@/lib/cn';

interface AttentionItem {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: string;
}

/**
 * "Attention" center. `negativeMarginQuotes` is only shown when the API returns a number
 * (i.e. the viewer has `quotations.view_cost`); when null it is omitted entirely.
 */
export function AttentionPanel({ attention }: { attention: DashboardAttention }) {
  const items: AttentionItem[] = [
    {
      label: strings.dashboard.attentionOverdue,
      value: attention.overdue,
      icon: AlarmClock,
      tone: 'text-destructive bg-destructive/10',
    },
    {
      label: strings.dashboard.attentionStale,
      value: attention.staleProjects,
      icon: Hourglass,
      tone: 'text-warning bg-warning/10',
    },
    {
      label: strings.dashboard.attentionDrafts,
      value: attention.draftQuotesOlderThan7d,
      icon: FileWarning,
      tone: 'text-info bg-info/10',
    },
  ];

  if (attention.negativeMarginQuotes !== null) {
    items.push({
      label: strings.dashboard.attentionNegativeMargin,
      value: attention.negativeMarginQuotes,
      icon: TrendingDown,
      tone: 'text-destructive bg-destructive/10',
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{strings.dashboard.attention}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5"
            >
              <div className="flex items-center gap-3">
                <span className={cn('flex size-8 items-center justify-center rounded-md', item.tone)}>
                  <Icon className="size-4" />
                </span>
                <span className="text-sm">{item.label}</span>
              </div>
              <span className="text-lg font-bold tabular-nums">{item.value}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
