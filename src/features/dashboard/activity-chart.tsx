import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/feedback/empty-state';
import { strings } from '@/constants/strings';

import type { SalespersonActivity } from './dashboard.viewmodel';

interface ActivityChartProps {
  data: SalespersonActivity[];
  hasData: boolean;
}

/**
 * Activity over the last 30 days grouped by salesperson (an aggregation, NOT a time-series).
 * Rendered as horizontal bars with names on the Y axis.
 */
export function ActivityChart({ data, hasData }: ActivityChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{strings.dashboard.activity}</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid hsl(var(--border))',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" name="Activities" fill="hsl(var(--chart-2))" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState
            title={strings.dashboard.activityEmpty}
            description={strings.dashboard.activityEmptyHint}
          />
        )}
      </CardContent>
    </Card>
  );
}
