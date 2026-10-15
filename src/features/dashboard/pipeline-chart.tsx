import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/feedback/empty-state';
import { strings } from '@/constants/strings';

import type { PipelinePoint } from './dashboard.viewmodel';

interface PipelineChartProps {
  data: PipelinePoint[];
  hasData: boolean;
}

/** Projects by pipeline stage (LTR). */
export function PipelineChart({ data, hasData }: PipelineChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{strings.dashboard.pipeline}</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid hsl(var(--border))',
                    fontSize: 12,
                  }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Bar dataKey="count" name="Projects" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState
            title={strings.dashboard.pipelineEmpty}
            description={strings.dashboard.pipelineEmptyHint}
          />
        )}
      </CardContent>
    </Card>
  );
}
