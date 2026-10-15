import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { isApiError } from '@/api/client/api-error';
import { ErrorState } from '@/components/feedback/error-state';
import { NotFound } from '@/components/feedback/status-views';
import { PageSkeleton } from '@/components/feedback/skeletons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { strings } from '@/constants/strings';
import {
  useConsultantOptions,
  useActiveUserOptions,
} from '@/features/crm/lookups';
import { getErrorMessage, getFieldErrors } from '@/lib/get-error-message';

import {
  formValuesToCreatePayload,
  formValuesToUpdatePayload,
  projectToFormValues,
} from './project-payload';
import { ProjectFormSections } from './project-form-sections';
import { emptyProjectForm, projectFormSchema, type ProjectFormValues } from './project.schema';
import { ProjectStickyActions } from './ui/project-sticky-actions';
import { ProjectsPageShell } from './ui/projects-page-shell';
import { useCreateProject, useProject, useUpdateProject } from './use-projects';

export function ProjectFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const { data: project, isLoading, isError, error, refetch } = useProject(isEdit ? id : undefined);

  const consultantOptions = useConsultantOptions();
  const userOptions = useActiveUserOptions();

  const formLocked =
    isEdit && project && (project.status === 'archived' || project.executionState === 'closed');

  const quantitiesLocked =
    isEdit && project && (project.status === 'archived' || project.executionState === 'closed');

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: emptyProjectForm,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  useEffect(() => {
    if (isEdit && project) {
      reset(projectToFormValues(project));
    } else if (!isEdit) {
      reset(emptyProjectForm);
    }
  }, [isEdit, project, reset]);

  const submitting = createMutation.isPending || updateMutation.isPending;

  const applyServerErrors = (err: unknown, toastId: string | number) => {
    const fieldErrors = getFieldErrors(err);
    for (const [field, message] of Object.entries(fieldErrors)) {
      if (field in emptyProjectForm || field.startsWith('items')) {
        setError(field as keyof ProjectFormValues, { message });
      }
    }
    toast.error(strings.projects.saveFailed, {
      id: toastId,
      description: Object.values(fieldErrors)[0] ?? getErrorMessage(err),
    });
  };

  const onSubmit = (values: ProjectFormValues) => {
    const toastId = toast.loading(strings.projects.saving);

    if (isEdit && id) {
      updateMutation.mutate(
        { id, body: formValuesToUpdatePayload(values) },
        {
          onSuccess: (data) => {
            toast.success(strings.projects.updated, { id: toastId });
            navigate(`/app/projects/${data.id}`);
          },
          onError: (error) => applyServerErrors(error, toastId),
        },
      );
    } else {
      createMutation.mutate(formValuesToCreatePayload(values), {
        onSuccess: (data) => {
          toast.success(strings.projects.created, { id: toastId });
          navigate(`/app/projects/${data.id}`);
        },
        onError: (error) => applyServerErrors(error, toastId),
      });
    }
  };

  const onInvalidSubmit = () => {
    toast.error(strings.projects.validationFailed, {
      description: strings.projects.validationHint,
    });
  };

  if (isEdit && isLoading) return <PageSkeleton />;
  if (isEdit && isError) {
    if (isApiError(error) && (error.httpStatus === 404 || error.code === 'NOT_FOUND')) {
      return <NotFound />;
    }
    return <ErrorState error={error} onRetry={() => void refetch()} />;
  }
  if (isEdit && !project) return <NotFound />;

  const cancelHref = isEdit && project ? `/app/projects/${project.id}` : '/app/projects';

  return (
    <ProjectsPageShell maxWidth="5xl">
      <div className="space-y-2">
        <Button variant="ghost" size="sm" className="-ms-2 w-fit text-muted-foreground" asChild>
          <Link to={cancelHref}>
            <ArrowLeft />
            {strings.common.back}
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">
            {isEdit ? strings.projects.editTitle : strings.projects.createTitle}
          </h1>
          {isEdit && project?.number && (
            <Badge variant="secondary" className="font-mono text-xs">
              {project.number}
            </Badge>
          )}
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {isEdit ? strings.projects.editSubtitle : strings.projects.createSubtitle}
        </p>
      </div>

      {formLocked && (
        <Alert variant="warning">
          <AlertCircle className="size-4" />
          <AlertTitle>{strings.projects.formLockedTitle}</AlertTitle>
          <AlertDescription>{strings.projects.formLockedHint}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit, onInvalidSubmit)} noValidate>
        <ProjectFormSections
          control={control}
          register={register}
          errors={errors}
          isEdit={isEdit}
          formLocked={Boolean(formLocked)}
          quantitiesLocked={Boolean(quantitiesLocked)}
          consultantOptions={consultantOptions}
          userOptions={userOptions}
          fields={fields}
          append={append}
          remove={remove}
        />

        <ProjectStickyActions>
          <Button type="submit" disabled={submitting || formLocked} className="shadow-sm">
            {submitting ? strings.common.saving : strings.common.save}
          </Button>
          <Button type="button" variant="outline" disabled={submitting} asChild>
            <Link to={cancelHref}>{strings.common.cancel}</Link>
          </Button>
        </ProjectStickyActions>
      </form>
    </ProjectsPageShell>
  );
}
