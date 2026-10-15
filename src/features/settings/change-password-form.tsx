import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { changePassword } from '@/api/auth/auth.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { strings } from '@/constants/strings';
import { getErrorMessage, getFieldErrors } from '@/lib/get-error-message';
import { useAuthStore } from '@/stores/auth/auth.store';

import { changePasswordSchema, type ChangePasswordFormValues } from './change-password.schema';

export function ChangePasswordForm() {
  const clearSession = useAuthStore((state) => state.clearSession);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const mutation = useMutation({
    mutationFn: (values: ChangePasswordFormValues) =>
      changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword }),
    onSuccess: () => {
      reset();
      // Backend revokes all refresh sessions — force a fresh login.
      toast.success(strings.settings.changed);
      clearSession();
      navigate('/login', { replace: true });
    },
    onError: (error) => {
      const fieldErrors = getFieldErrors(error);
      let mapped = false;
      for (const [field, message] of Object.entries(fieldErrors)) {
        if (field === 'currentPassword' || field === 'newPassword') {
          setError(field, { message });
          mapped = true;
        }
      }
      if (!mapped) toast.error(getErrorMessage(error));
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{strings.settings.changePassword}</CardTitle>
        <CardDescription>{strings.settings.changePasswordSubtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="max-w-md space-y-4"
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="current-password">{strings.settings.currentPassword}</Label>
            <Input
              id="current-password"
              type="password"
              dir="ltr"
              className="text-start"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.currentPassword)}
              {...register('currentPassword')}
            />
            {errors.currentPassword && (
              <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">{strings.settings.newPassword}</Label>
            <Input
              id="new-password"
              type="password"
              dir="ltr"
              className="text-start"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.newPassword)}
              {...register('newPassword')}
            />
            {errors.newPassword ? (
              <p className="text-sm text-destructive">{errors.newPassword.message}</p>
            ) : (
              <p className="text-xs text-muted-foreground">{strings.settings.passwordHint}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">{strings.settings.confirmPassword}</Label>
            <Input
              id="confirm-password"
              type="password"
              dir="ltr"
              className="text-start"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.confirmPassword)}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? strings.common.loading : strings.common.save}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
