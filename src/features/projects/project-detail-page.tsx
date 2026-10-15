import {
  Archive,
  Building2,
  CalendarClock,
  FileCheck,
  GitBranch,
  History,
  Factory,
  Layers,
  ListTodo,
  Lock,
  LockOpen,
  Pencil,
  Plus,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { isApiError } from '@/api/client/api-error';
import type { Activity } from '@/api/activities/activities.types';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { DetailHeader } from '@/components/common/detail-header';
import { StatusChip } from '@/components/common/status-chip';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { NotFound } from '@/components/feedback/status-views';
import { PageSkeleton, TableSkeleton } from '@/components/feedback/skeletons';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PERMISSIONS } from '@/constants/permissions';
import { strings } from '@/constants/strings';
import { ActivityFormDialog } from '@/features/activities/activity-form-dialog';
import { ActivitiesTable } from '@/features/activities/activities-table';
import { useConsultantMap, useContractorMap, useUserMap } from '@/features/crm/lookups';
import { OpportunitiesTable } from '@/features/opportunities/opportunities-table';
import { useOpportunities } from '@/features/opportunities/use-opportunities';
import { usePermission } from '@/hooks/use-permission';
import { cn } from '@/lib/cn';
import { formatDate, formatDateTime } from '@/lib/format';
import { getErrorMessage } from '@/lib/get-error-message';

import { useProjectManufacturingSummary } from '@/features/manufacturing/use-manufacturing';
import { formatDecimalQuantity, formatMeters } from '@/features/manufacturing/manufacturing.utils';

import { pendingProductionMetersFromWarnings } from './project-close-warnings';
import { ProjectManufacturingPanel } from './project-manufacturing-panel';
import { ProjectActorLabel } from './project-actor-label';
import { executionStateLabel, projectActions } from './project-actions';
import { ProjectStageDialog } from './project-stage-dialog';
import { ProjectDetailSection } from './ui/project-detail-section';
import { ProjectsPageShell } from './ui/projects-page-shell';
import {
  useArchiveProject,
  useCloseProjectExecution,
  useProject,
  useProjectActivities,
  useReopenProjectExecution,
} from './use-projects';

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1', className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, isError, error, refetch } = useProject(id);
  const {
    data: oppsData,
    isLoading: oppsLoading,
    isError: oppsError,
    error: oppsErr,
    refetch: refetchOpps,
  } = useOpportunities(
    { contractorId: project?.contractorId ?? '', limit: 100, page: 1 },
    Boolean(project?.contractorId),
  );
  const userMap = useUserMap();
  const consultantMap = useConsultantMap();
  const contractorMap = useContractorMap();

  const canUpdate = usePermission(PERMISSIONS.projects.update);
  const canStage = usePermission(PERMISSIONS.projects.stage);
  const canArchive = usePermission(PERMISSIONS.projects.archive);
  const canCloseExecution = usePermission(PERMISSIONS.projects.close);
  const canReopenExecution = usePermission(PERMISSIONS.projects.reopen);
  const canCreateActivity = usePermission(PERMISSIONS.activities.create);

  const archive = useArchiveProject();
  const closeExecution = useCloseProjectExecution();
  const reopenExecution = useReopenProjectExecution();

  const [stageOpen, setStageOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [closeExecutionOpen, setCloseExecutionOpen] = useState(false);
  const [reopenExecutionOpen, setReopenExecutionOpen] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const { data: manufacturingSummary } = useProjectManufacturingSummary(
    closeExecutionOpen ? id : undefined,
  );

  const {
    data: activitiesData,
    isLoading: activitiesLoading,
    isError: activitiesError,
    error: activitiesErr,
    refetch: refetchActivities,
  } = useProjectActivities(id, { limit: 100 });

  if (isLoading) return <PageSkeleton />;
  if (isError) {
    if (isApiError(error) && (error.httpStatus === 404 || error.code === 'NOT_FOUND')) {
      return <NotFound />;
    }
    return <ErrorState error={error} onRetry={() => void refetch()} />;
  }
  if (!project) return <NotFound />;

  const availability = projectActions(project, {
    canUpdate,
    canStage,
    canCloseTender: false,
    canArchive,
    canCloseExecution,
    canReopenExecution,
  });

  const salespersonNames = project.salesPersonIds.map((uid) => userMap.get(uid)?.name ?? uid);
  const executionOwnerName = project.executionOwnerId
    ? (userMap.get(project.executionOwnerId)?.name ?? project.executionOwnerId)
    : strings.common.none;
  const actionOwnerName = project.actionOwnerId
    ? (userMap.get(project.actionOwnerId)?.name ?? project.actionOwnerId)
    : strings.common.none;

  const openEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setActivityDialogOpen(true);
  };

  const openCreateActivity = () => {
    setEditingActivity(null);
    setActivityDialogOpen(true);
  };

  const runArchive = () =>
    archive.mutate(project.id, {
      onSuccess: () => {
        toast.success(strings.projects.archived);
        setArchiveOpen(false);
      },
      onError: (e) => toast.error(getErrorMessage(e)),
    });

  const runCloseExecution = () =>
    closeExecution.mutate(project.id, {
      onSuccess: (result) => {
        toast.success(strings.projects.closeExecutionSuccess);
        const pendingMeters = pendingProductionMetersFromWarnings(result.warnings);
        if (pendingMeters) {
          toast.warning(strings.projects.closeExecutionPendingProduction(pendingMeters));
        }
        setCloseExecutionOpen(false);
      },
      onError: (e) => toast.error(getErrorMessage(e)),
    });

  const closeExecutionPendingMeters =
    manufacturingSummary && manufacturingSummary.pendingProductionQuantityScaled > 0
      ? formatDecimalQuantity(manufacturingSummary.pendingProduction)
      : null;

  const runReopenExecution = () =>
    reopenExecution.mutate(project.id, {
      onSuccess: () => {
        toast.success(strings.projects.reopenExecutionSuccess);
        setReopenExecutionOpen(false);
      },
      onError: (e) => toast.error(getErrorMessage(e)),
    });

  const opportunities = oppsData?.items ?? [];
  const activities = activitiesData?.items ?? [];
  const items = project.items ?? [];
  const purchaseOrders = project.purchaseOrders ?? [];
  const milestones = project.milestones ?? {
    drawingSubmittedOn: null,
    drawingApprovedOn: null,
    productionRequiredOn: null,
    deliveryTargetOn: null,
  };

  const detailTableWrap = 'overflow-x-auto rounded-xl border border-border/60 bg-background/50';

  return (
    <ProjectsPageShell maxWidth="6xl">
      <DetailHeader
        title={project.name}
        subtitle={
          project.number ? (
            <Badge variant="secondary" className="font-mono text-xs font-normal">
              {project.number}
            </Badge>
          ) : undefined
        }
        backTo="/app/projects"
        meta={
          <>
            <StatusChip kind="projectType" value={project.type} />
            <StatusChip kind="projectStage" value={project.stage} />
            <StatusChip kind="directoryStatus" value={project.status} />
            <span className="text-xs text-muted-foreground">
              {strings.projects.executionState}: {executionStateLabel(project.executionState)}
              {project.closedOn ? ` · ${formatDate(project.closedOn)}` : ''}
            </span>
            {project.operationalStatus && (
              <span className="text-xs font-medium text-foreground">
                {project.operationalStatus}
              </span>
            )}
          </>
        }
        actions={
          <>
            {availability.canEdit && (
              <Button size="sm" variant="outline" asChild>
                <Link to={`/app/projects/${project.id}/edit`}>
                  <Pencil />
                  {strings.projects.editProject}
                </Link>
              </Button>
            )}
            {availability.canChangeStage && (
              <Button size="sm" variant="outline" onClick={() => setStageOpen(true)}>
                <GitBranch />
                {strings.projects.changeStage}
              </Button>
            )}
            {availability.canCloseExecution && (
              <Button size="sm" variant="outline" onClick={() => setCloseExecutionOpen(true)}>
                <Lock />
                {strings.projects.closeExecution}
              </Button>
            )}
            {availability.canReopenExecution && (
              <Button size="sm" variant="outline" onClick={() => setReopenExecutionOpen(true)}>
                <LockOpen />
                {strings.projects.reopenExecution}
              </Button>
            )}
            {availability.canArchive && (
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => setArchiveOpen(true)}
              >
                <Archive />
                {strings.projects.archive}
              </Button>
            )}
          </>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-lg bg-muted/50 p-1">
          <TabsTrigger value="overview" className="rounded-md data-[state=active]:shadow-sm">
            {strings.projects.tabOverview}
          </TabsTrigger>
          <TabsTrigger value="opportunities" className="rounded-md data-[state=active]:shadow-sm">
            {strings.projects.tabOpportunities}
          </TabsTrigger>
          <TabsTrigger value="activities" className="rounded-md data-[state=active]:shadow-sm">
            {strings.projects.tabActivities}
          </TabsTrigger>
          <TabsTrigger value="quotations" className="rounded-md data-[state=active]:shadow-sm">
            {strings.projects.tabQuotations}
          </TabsTrigger>
          <TabsTrigger value="purchase-orders" className="rounded-md data-[state=active]:shadow-sm">
            {strings.projects.tabPurchaseOrders}
          </TabsTrigger>
          <TabsTrigger value="manufacturing" className="rounded-md data-[state=active]:shadow-sm">
            {strings.projects.tabManufacturing}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <ProjectDetailSection
            icon={Building2}
            title={strings.projects.sectionIdentity}
            description={strings.projects.sectionIdentityHint}
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field label={strings.projects.name}>{project.name}</Field>
              <Field label={strings.projects.type}>
                <StatusChip kind="projectType" value={project.type} />
              </Field>
              <Field label={strings.projects.stage}>
                <StatusChip kind="projectStage" value={project.stage} />
              </Field>
              <Field label={strings.common.status}>
                <StatusChip kind="directoryStatus" value={project.status} />
              </Field>
              <Field label={strings.projects.customer}>
                {project.customer?.trim() ? project.customer : strings.common.none}
              </Field>
              <Field label={strings.projects.site}>{project.site || strings.common.none}</Field>
              <Field label={strings.projects.country}>
                {project.country || strings.common.none}
              </Field>
              <Field label={strings.projects.city}>{project.city || strings.common.none}</Field>
            </div>
          </ProjectDetailSection>

          <ProjectDetailSection
            icon={Users}
            title={strings.projects.sectionParties}
            description={strings.projects.sectionPartiesHint}
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field label={strings.projects.consultant}>
                {project.consultantId
                  ? (consultantMap.get(project.consultantId) ?? project.consultantId)
                  : strings.projects.noConsultant}
              </Field>
              <Field label={strings.projects.contractor}>
                {project.contractorId
                  ? (contractorMap.get(project.contractorId) ?? project.contractorId)
                  : strings.common.none}
              </Field>
              <Field label={strings.projects.executionOwner}>{executionOwnerName}</Field>
              <Field label={strings.projects.department}>
                {project.department ?? strings.common.none}
              </Field>
              <Field label={strings.projects.salespeople} className="sm:col-span-2">
                {salespersonNames.length > 0
                  ? salespersonNames.join(', ')
                  : strings.projects.noSalespeople}
              </Field>
            </div>
          </ProjectDetailSection>

          <ProjectDetailSection
            icon={FileCheck}
            title={strings.projects.sectionPoStatus}
            description={strings.projects.sectionPoStatusHint}
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field label={strings.projects.poContractRef}>
                {project.poContractRef ?? strings.common.none}
              </Field>
              <Field label={strings.projects.operationalStatus}>
                {project.operationalStatus ?? strings.common.none}
              </Field>
              <Field label={strings.projects.poDate}>{formatDate(project.poDate)}</Field>
              <Field label={strings.projects.manufacturingClearance}>
                {formatDate(project.manufacturingClearanceOn)}
              </Field>
              <Field label={strings.projects.paymentDue}>{formatDate(project.paymentDueOn)}</Field>
            </div>
          </ProjectDetailSection>

          <ProjectDetailSection
            icon={ListTodo}
            title={strings.projects.sectionNextAction}
            description={strings.projects.sectionNextActionHint}
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field label={strings.projects.nextAction} className="sm:col-span-2">
                {project.nextAction ?? strings.common.none}
              </Field>
              <Field label={strings.projects.actionOwner}>{actionOwnerName}</Field>
              <Field label={strings.projects.actionDue}>{formatDate(project.actionDueOn)}</Field>
            </div>
          </ProjectDetailSection>

          <ProjectDetailSection
            icon={CalendarClock}
            title={strings.projects.sectionMilestones}
            description={strings.projects.sectionMilestonesHint}
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field label={strings.projects.drawingSubmitted}>
                {formatDate(milestones.drawingSubmittedOn)}
              </Field>
              <Field label={strings.projects.drawingApproved}>
                {formatDate(milestones.drawingApprovedOn)}
              </Field>
              <Field label={strings.projects.productionRequired}>
                {formatDate(milestones.productionRequiredOn)}
              </Field>
              <Field label={strings.projects.deliveryTarget}>
                {formatDate(milestones.deliveryTargetOn)}
              </Field>
              <Field label={strings.projects.expectedClose}>
                {formatDate(project.expectedClosingDate)}
              </Field>
              <Field label={strings.projects.notes} className="sm:col-span-2">
                {project.notes?.trim() ? project.notes : strings.common.none}
              </Field>
            </div>
          </ProjectDetailSection>

          <ProjectDetailSection
            icon={History}
            title={strings.projects.sectionAudit}
            description={strings.projects.sectionAuditHint}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-3">
                <Field label={strings.projects.createdBy}>
                  <ProjectActorLabel
                    user={project.createdByUser}
                    fallbackUserId={project.createdBy}
                  />
                </Field>
                <Field label={strings.projects.createdAt}>
                  {formatDateTime(project.createdAt)}
                </Field>
              </div>
              <Separator className="sm:hidden" />
              <div className="space-y-3 sm:border-s sm:border-border/60 sm:ps-6">
                <Field label={strings.projects.updatedBy}>
                  <ProjectActorLabel
                    user={project.updatedByUser}
                    fallbackUserId={project.updatedBy}
                  />
                </Field>
                <Field label={strings.projects.updatedAt}>
                  {formatDateTime(project.updatedAt)}
                </Field>
              </div>
            </div>
          </ProjectDetailSection>

          <ProjectDetailSection
            icon={Layers}
            title={strings.projects.sectionQuantities}
            description={strings.projects.sectionQuantitiesHint}
          >
            {items.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
                {strings.projects.quantitiesEmpty}
              </p>
            ) : (
              <div className={detailTableWrap}>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead>#</TableHead>
                      <TableHead>{strings.projects.itemType}</TableHead>
                      <TableHead>{strings.projects.rating}</TableHead>
                      <TableHead>{strings.projects.conductor}</TableHead>
                      <TableHead>{strings.projects.plating}</TableHead>
                      <TableHead>{strings.projects.poles}</TableHead>
                      <TableHead>{strings.projects.meters}</TableHead>
                      <TableHead>{strings.projects.meterPrice}</TableHead>
                      <TableHead>{strings.projects.lineValue}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/30">
                        <TableCell>{item.lineNo}</TableCell>
                        <TableCell>{item.itemType}</TableCell>
                        <TableCell>{item.rating}</TableCell>
                        <TableCell>{item.conductor}</TableCell>
                        <TableCell>{item.plating}</TableCell>
                        <TableCell>{item.poles}</TableCell>
                        <TableCell>{formatMeters(item.meters)}</TableCell>
                        <TableCell>{item.meterPrice}</TableCell>
                        <TableCell>{item.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </ProjectDetailSection>
        </TabsContent>

        <TabsContent value="opportunities" className="mt-4 space-y-4">
          <p className="text-sm text-muted-foreground">{strings.projects.opportunitiesPreProjectHint}</p>
          <div className="flex justify-end">
            <Button size="sm" variant="outline" asChild>
              <Link to="/app/opportunities">{strings.opportunities.title}</Link>
            </Button>
          </div>
          {!project.contractorId ? (
            <EmptyState
              title={strings.opportunities.emptyTitle}
              description={strings.projects.opportunitiesNeedContractor}
            />
          ) : oppsLoading ? (
            <TableSkeleton rows={4} columns={6} />
          ) : oppsError ? (
            <ErrorState error={oppsErr} onRetry={() => void refetchOpps()} />
          ) : opportunities.length === 0 ? (
            <EmptyState
              title={strings.opportunities.emptyTitle}
              description={strings.opportunities.emptyHint}
            />
          ) : (
            <OpportunitiesTable opportunities={opportunities} />
          )}
        </TabsContent>

        <TabsContent value="activities" className="mt-4 space-y-4">
          <div className="flex justify-end">
            {canCreateActivity && (
              <Button size="sm" onClick={openCreateActivity}>
                <Plus />
                {strings.projects.addActivity}
              </Button>
            )}
          </div>
          {activitiesLoading ? (
            <TableSkeleton rows={4} columns={6} />
          ) : activitiesError ? (
            <ErrorState error={activitiesErr} onRetry={() => void refetchActivities()} />
          ) : activities.length === 0 ? (
            <EmptyState
              title={strings.activities.emptyTitle}
              description={strings.activities.emptyHint}
              action={
                canCreateActivity ? (
                  <Button size="sm" variant="outline" onClick={openCreateActivity}>
                    <Plus />
                    {strings.projects.addActivity}
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <ActivitiesTable activities={activities} onEdit={openEditActivity} hideProject />
          )}
        </TabsContent>

        <TabsContent value="quotations" className="mt-4">
          <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground space-y-4">
            <p>{strings.projects.tabQuotationsOpportunityHint}</p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/opportunities">{strings.projects.tabQuotationsGoToOpportunities}</Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="manufacturing" className="mt-4 space-y-4">
          <ProjectDetailSection
            icon={Factory}
            title={strings.projects.sectionManufacturing}
            description={strings.projects.sectionManufacturingHint}
          >
            <ProjectManufacturingPanel projectId={project.id} />
          </ProjectDetailSection>
        </TabsContent>

        <TabsContent value="purchase-orders" className="mt-4 space-y-4">
          <p className="text-sm text-muted-foreground">{strings.projects.storedPoRefHint}</p>
          {purchaseOrders.length === 0 ? (
            <EmptyState
              title={strings.projects.tabPurchaseOrders}
              description={strings.projects.noPurchaseOrders}
            />
          ) : (
            <div className={detailTableWrap}>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>{strings.projects.poListCustomerRef}</TableHead>
                    <TableHead>{strings.projects.poListDate}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrders.map((po) => (
                    <TableRow key={po.id} className="hover:bg-muted/30">
                      <TableCell>{po.customerPORef}</TableCell>
                      <TableCell>{formatDate(po.date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ProjectStageDialog project={project} open={stageOpen} onOpenChange={setStageOpen} />
      <ConfirmDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        title={strings.projects.archiveTitle}
        description={strings.projects.archiveBody(project.name)}
        confirmLabel={strings.projects.archive}
        destructive
        loading={archive.isPending}
        onConfirm={runArchive}
      />
      <ConfirmDialog
        open={closeExecutionOpen}
        onOpenChange={setCloseExecutionOpen}
        title={strings.projects.closeExecutionTitle}
        description={
          <div className="space-y-3 text-sm">
            <p>{strings.projects.closeExecutionBody(project.name)}</p>
            {closeExecutionPendingMeters && (
              <Alert variant="warning">
                <AlertDescription>
                  {strings.projects.closeExecutionPendingProduction(closeExecutionPendingMeters)}
                </AlertDescription>
              </Alert>
            )}
          </div>
        }
        confirmLabel={strings.projects.closeExecution}
        loading={closeExecution.isPending}
        onConfirm={runCloseExecution}
      />
      <ConfirmDialog
        open={reopenExecutionOpen}
        onOpenChange={setReopenExecutionOpen}
        title={strings.projects.reopenExecutionTitle}
        description={strings.projects.reopenExecutionBody(project.name)}
        confirmLabel={strings.projects.reopenExecution}
        loading={reopenExecution.isPending}
        onConfirm={runReopenExecution}
      />
      <ActivityFormDialog
        open={activityDialogOpen}
        onOpenChange={(open) => {
          setActivityDialogOpen(open);
          if (!open) setEditingActivity(null);
        }}
        activity={editingActivity}
        defaultProjectId={project.id}
        lockProject
      />
    </ProjectsPageShell>
  );
}
