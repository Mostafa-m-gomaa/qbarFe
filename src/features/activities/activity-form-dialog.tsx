import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import type {
  Activity,
  ActivityType,
  CreateActivityRequest,
  UpdateActivityRequest,
} from '@/api/activities/activities.types';
import { Combobox } from '@/components/common/combobox';
import { DateField } from '@/components/common/date-field';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { strings } from '@/constants/strings';
import { useActiveUserOptions, useProjectMap, useProjectOptions } from '@/features/crm/lookups';
import { useProject } from '@/features/projects/use-projects';
import { getErrorMessage, getFieldErrors } from '@/lib/get-error-message';

import {
  ACTIVITY_TYPE_OPTIONS,
  activityFormSchema,
  emptyActivityForm,
  type ActivityFormValues,
} from './activity.schema';
import { useCreateActivity, useUpdateActivity } from './use-activities';

interface ActivityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity?: Activity | null;
  defaultProjectId?: string;
  lockProject?: boolean;
}

export function ActivityFormDialog({
  open,
  onOpenChange,
  activity,
  defaultProjectId,
  lockProject,
}: ActivityFormDialogProps) {
  const mode = activity ? 'edit' : 'create';
  const createMutation = useCreateActivity();
  const updateMutation = useUpdateActivity();
  const projectOptions = useProjectOptions();
  const projectMap = useProjectMap();

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: emptyActivityForm,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      activity
        ? {
            projectId: activity.projectId,
            type: activity.type,
            occurredOn: activity.occurredOn.slice(0, 10),
            nextAction: activity.nextAction,
            nextFollowUpOn: activity.nextFollowUpOn.slice(0, 10),
            notes: activity.notes ?? '',
            assignedUserId: activity.assignedUserId ?? '',
          }
        : { ...emptyActivityForm, projectId: defaultProjectId ?? '' },
    );
  }, [open, activity, defaultProjectId, reset]);

  const selectedProjectId = watch('projectId');
  const { data: selectedProject } = useProject(selectedProjectId || undefined);
  const assigneeOptions = useActiveUserOptions(selectedProject?.salesPersonIds);

  const submitting = createMutation.isPending || updateMutation.isPending;

  const applyServerErrors = (error: unknown) => {
    const fieldErrors = getFieldErrors(error);
    let mapped = false;
    for (const [field, message] of Object.entries(fieldErrors)) {
      if (field in emptyActivityForm) {
        setError(field as keyof ActivityFormValues, { message });
        mapped = true;
      }
    }
    if (!mapped) toast.error(getErrorMessage(error));
  };

  const onSubmit = (values: ActivityFormValues) => {
    if (mode === 'create') {
      const payload: CreateActivityRequest = {
        projectId: values.projectId,
        type: values.type,
        occurredOn: values.occurredOn,
        nextAction: values.nextAction.trim(),
        nextFollowUpOn: values.nextFollowUpOn,
        notes: values.notes.trim() || undefined,
        assignedUserId: values.assignedUserId || undefined,
      };
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(strings.activities.created);
          onOpenChange(false);
        },
        onError: applyServerErrors,
      });
    } else if (activity) {
      const payload: UpdateActivityRequest = {
        type: values.type,
        occurredOn: values.occurredOn,
        nextAction: values.nextAction.trim(),
        nextFollowUpOn: values.nextFollowUpOn,
        notes: values.notes.trim(),
        ...(values.assignedUserId ? { assignedUserId: values.assignedUserId } : {}),
      };
      updateMutation.mutate(
        { id: activity.id, body: payload },
        {
          onSuccess: () => {
            toast.success(strings.activities.updated);
            onOpenChange(false);
          },
          onError: applyServerErrors,
        },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? strings.activities.createTitle : strings.activities.editTitle}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' ? strings.activities.createSubtitle : strings.activities.editSubtitle}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="activity-project">{strings.activities.project}</Label>
            {mode === 'edit' || lockProject ? (
              <p className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
                {projectMap.get(selectedProjectId)?.name ??
                  selectedProject?.name ??
                  selectedProjectId}
              </p>
            ) : (
              <Controller
                control={control}
                name="projectId"
                render={({ field }) => (
                  <Combobox
                    id="activity-project"
                    options={projectOptions}
                    value={field.value || null}
                    onChange={(v) => field.onChange(v ?? '')}
                    placeholder={strings.activities.selectProject}
                    aria-invalid={Boolean(errors.projectId)}
                  />
                )}
              />
            )}
            {errors.projectId && (
              <p className="text-sm text-destructive">{errors.projectId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity-type">{strings.activities.type}</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={(v) => field.onChange(v as ActivityType)}>
                  <SelectTrigger id="activity-type" className="w-full">
                    <SelectValue placeholder={strings.activities.selectType} />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPE_OPTIONS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="activity-occurred">{strings.activities.occurredOn}</Label>
              <DateField
                id="activity-occurred"
                aria-invalid={Boolean(errors.occurredOn)}
                {...register('occurredOn')}
              />
              {errors.occurredOn && (
                <p className="text-sm text-destructive">{errors.occurredOn.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="activity-followup">{strings.activities.nextFollowUp}</Label>
              <DateField
                id="activity-followup"
                aria-invalid={Boolean(errors.nextFollowUpOn)}
                {...register('nextFollowUpOn')}
              />
              {errors.nextFollowUpOn && (
                <p className="text-sm text-destructive">{errors.nextFollowUpOn.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity-next-action">{strings.activities.nextAction}</Label>
            <Input
              id="activity-next-action"
              aria-invalid={Boolean(errors.nextAction)}
              {...register('nextAction')}
            />
            {errors.nextAction && (
              <p className="text-sm text-destructive">{errors.nextAction.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity-assignee">{strings.activities.assignedTo}</Label>
            <Controller
              control={control}
              name="assignedUserId"
              render={({ field }) => (
                <Combobox
                  id="activity-assignee"
                  options={assigneeOptions}
                  value={field.value || null}
                  onChange={(v) => field.onChange(v ?? '')}
                  placeholder={strings.activities.selectAssignee}
                  disabled={!selectedProjectId}
                />
              )}
            />
            <p className="text-xs text-muted-foreground">
              {selectedProjectId
                ? strings.activities.assigneeHint
                : strings.activities.assigneeNeedsProject}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity-notes">{strings.activities.notes}</Label>
            <textarea
              id="activity-notes"
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              {...register('notes')}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? strings.common.saving : strings.common.save}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              {strings.common.cancel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
