import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { toast } from 'sonner';

import type { User } from '@/api/users/users.types';
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
import { strings } from '@/constants/strings';
import { getErrorMessage, getFieldErrors } from '@/lib/get-error-message';

import { RoleMultiSelect } from './role-multi-select';
import { useCreateUser, useUpdateUser } from './use-users';
import { createUserSchema, editUserSchema } from './user.schema';

interface UserFormValues {
  name: string;
  email: string;
  password: string;
  roleIds: string[];
}

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present = edit mode; absent = create mode. */
  user?: User | null;
}

export function UserFormDialog({ open, onOpenChange, user }: UserFormDialogProps) {
  const mode = user ? 'edit' : 'create';
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const resolver = zodResolver(
    mode === 'create' ? createUserSchema : editUserSchema,
  ) as unknown as Resolver<UserFormValues>;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver,
    defaultValues: { name: '', email: '', password: '', roleIds: [] },
  });

  // Sync form state whenever the dialog opens or the target user changes.
  useEffect(() => {
    if (!open) return;
    reset({
      name: user?.name ?? '',
      email: user?.email ?? '',
      password: '',
      roleIds: user?.roleIds ?? [],
    });
  }, [open, user, reset]);

  const roleIds = watch('roleIds');
  const submitting = createMutation.isPending || updateMutation.isPending;

  const applyServerErrors = (error: unknown) => {
    const fieldErrors = getFieldErrors(error);
    let mapped = false;
    for (const [field, message] of Object.entries(fieldErrors)) {
      if (field === 'name' || field === 'email' || field === 'password') {
        setError(field, { message });
        mapped = true;
      }
    }
    if (!mapped) toast.error(getErrorMessage(error));
  };

  const onSubmit = (values: UserFormValues) => {
    if (mode === 'create') {
      createMutation.mutate(
        {
          name: values.name,
          email: values.email,
          password: values.password,
          roleIds: values.roleIds,
        },
        {
          onSuccess: () => {
            toast.success(strings.users.created);
            onOpenChange(false);
          },
          onError: applyServerErrors,
        },
      );
    } else if (user) {
      updateMutation.mutate(
        { id: user.id, body: { name: values.name, roleIds: values.roleIds } },
        {
          onSuccess: () => {
            toast.success(strings.users.updated);
            onOpenChange(false);
          },
          onError: applyServerErrors,
        },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? strings.users.createTitle : strings.users.editTitle}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' ? strings.users.createSubtitle : strings.users.editSubtitle}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="user-name">{strings.users.name}</Label>
            <Input id="user-name" aria-invalid={Boolean(errors.name)} {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-email">{strings.auth.email}</Label>
            <Input
              id="user-email"
              type="email"
              dir="ltr"
              className="text-start"
              disabled={mode === 'edit'}
              aria-invalid={Boolean(errors.email)}
              {...register('email')}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          {mode === 'create' && (
            <div className="space-y-2">
              <Label htmlFor="user-password">{strings.auth.password}</Label>
              <Input
                id="user-password"
                type="password"
                dir="ltr"
                className="text-start"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
                {...register('password')}
              />
              {errors.password ? (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              ) : (
                <p className="text-xs text-muted-foreground">{strings.users.passwordHint}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>{strings.nav.roles}</Label>
            <RoleMultiSelect value={roleIds} onChange={(value) => setValue('roleIds', value)} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? strings.common.loading : strings.common.save}
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
