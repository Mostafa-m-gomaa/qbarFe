import { useQuery } from '@tanstack/react-query';
import { AlarmClock, Briefcase, Factory, FileText, FolderKanban, Trophy } from 'lucide-react';
import { useMemo } from 'react';

import { listUsers } from '@/api/users/users.api';
import type { User } from '@/api/users/users.types';
import { MoneyText } from '@/components/common/money-text';
import { PageHeader } from '@/components/common/page-header';
import { ErrorState } from '@/components/feedback/error-state';
import { PageSkeleton } from '@/components/feedback/skeletons';
import { PERMISSIONS } from '@/constants/permissions';
import { queryKeys } from '@/constants/query-keys';
import { strings } from '@/constants/strings';
import {
  aggregateOpenPendingQuantityScaled,
  formatMeters,
  scaledToMetersString,
} from '@/features/manufacturing/manufacturing.utils';
import { usePortfolioManufacturingPending } from '@/features/manufacturing/use-manufacturing';
import { useAnyPermission, usePermission } from '@/hooks/use-permission';
import { formatDate, formatNumber, formatPercent } from '@/lib/format';

import { ActivityChart } from './activity-chart';
import { AttentionPanel } from './attention-panel';
import { toDashboardViewModel } from './dashboard.viewmodel';
import { KpiCard } from './kpi-card';
import { Next7DaysPanel } from './next7days-panel';
import { PipelineChart } from './pipeline-chart';
import { useDashboard } from './use-dashboard';

export function DashboardPage() {
  const { data, isLoading, isError, error, refetch } = useDashboard();

  // Names are resolved from users only when the viewer may read them.
  const canReadUsers = usePermission(PERMISSIONS.users.read);
  const canReadAllProjects = useAnyPermission([PERMISSIONS.projects.readAll]);
  const { data: pendingRows } = usePortfolioManufacturingPending(canReadAllProjects);
  const pendingProductionScaled = useMemo(
    () => aggregateOpenPendingQuantityScaled(pendingRows ?? []),
    [pendingRows],
  );
  const pendingProductionMeters = formatMeters(scaledToMetersString(pendingProductionScaled));
  const { data: users } = useQuery({
    queryKey: queryKeys.users.list({}),
    queryFn: () => listUsers(),
    enabled: canReadUsers,
    staleTime: 5 * 60_000,
  });

  const userMap = useMemo(() => {
    const map = new Map<string, User>();
    for (const user of users ?? []) map.set(user.id, user);
    return map;
  }, [users]);

  const viewModel = useMemo(
    () => (data ? toDashboardViewModel(data, userMap) : null),
    [data, userMap],
  );

  if (isLoading) return <PageSkeleton />;
  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (!data || !viewModel) return null;

  const { summary } = data;
  const base = data.baseCurrencyCode;

  return (
    <div className="space-y-6">
      <PageHeader
        title={strings.dashboard.title}
        description={`${strings.dashboard.asOf} ${formatDate(data.asOf)}`}
      />

      <div
        className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${canReadAllProjects ? 'xl:grid-cols-6' : 'xl:grid-cols-5'}`}
      >
        <KpiCard
          label={strings.dashboard.currentProjects}
          value={formatNumber(summary.visibleProjects)}
          icon={FolderKanban}
          tone="primary"
        />
        <KpiCard
          label={strings.dashboard.openOpportunities}
          value={formatNumber(summary.openInHand.count)}
          hint={
            <MoneyText amountMinor={summary.openInHand.valueBaseAmountMinor} currencyCode={base} />
          }
          icon={Briefcase}
          tone="info"
        />
        <KpiCard
          label={strings.dashboard.issuedQuotations}
          value={formatNumber(summary.issuedQuotations.count)}
          hint={
            <MoneyText
              amountMinor={summary.issuedQuotations.valueBaseAmountMinor}
              currencyCode={base}
            />
          }
          icon={FileText}
          tone="success"
        />
        <KpiCard
          label={strings.dashboard.overdueFollowUps}
          value={formatNumber(summary.overdueFollowUps)}
          icon={AlarmClock}
          tone="warning"
        />
        {canReadAllProjects && (
          <KpiCard
            label={strings.dashboard.pendingProduction}
            value={pendingProductionMeters}
            hint={strings.dashboard.pendingProductionHint(pendingProductionMeters)}
            icon={Factory}
            tone="warning"
            to="/app/manufacturing/pending"
          />
        )}
        <KpiCard
          label={strings.dashboard.winRate}
          value={formatPercent(summary.winRatePercent)}
          hint={strings.dashboard.winLossHint(
            formatNumber(summary.wonCount),
            formatNumber(summary.lostCount),
          )}
          icon={Trophy}
          tone="success"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PipelineChart data={viewModel.pipeline} hasData={viewModel.hasPipeline} />
        <ActivityChart data={viewModel.activityBySalesperson} hasData={viewModel.hasActivity} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AttentionPanel attention={data.attention} />
        <Next7DaysPanel items={data.next7Days} userMap={userMap} />
      </div>
    </div>
  );
}
