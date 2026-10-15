import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Lock, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';

import { isApiError } from '@/api/client/api-error';
import { BrandMark } from '@/components/navigation/brand-mark';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { strings } from '@/constants/strings';
import { getErrorMessage } from '@/lib/get-error-message';
import { useAuthStore } from '@/stores/auth/auth.store';

import { loginSchema, type LoginFormValues } from './login.schema';
import { LoginArtwork } from './login-artwork';

export function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/app/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const mutation = useMutation({
    mutationFn: (values: LoginFormValues) => login(values.email, values.password),
    onSuccess: () => navigate(from, { replace: true }),
  });

  /** Chooses a safe, user-facing message without leaking backend internals. */
  const formError = (() => {
    const error = mutation.error;
    if (!error) return null;
    if (isApiError(error)) {
      if (error.httpStatus === 401) return strings.auth.invalidCredentials;
      if (error.code === 'TOO_MANY_REQUESTS') return strings.auth.rateLimited;
      if (error.code === 'SERVICE_UNAVAILABLE' || error.code === 'NETWORK_ERROR')
        return strings.auth.serverUnavailable;
    }
    return getErrorMessage(error);
  })();

  const submitting = mutation.isPending;

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <LoginArtwork />

      <div className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2 lg:hidden">
            <BrandMark className="h-9" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight">{strings.auth.welcome}</h1>
            <p className="text-sm text-muted-foreground">{strings.app.tagline}</p>
          </div>

          {formError && (
            <Alert variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <form
            className="space-y-5"
            onSubmit={handleSubmit((values) => mutation.mutate(values))}
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="email">{strings.auth.email}</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  dir="ltr"
                  autoComplete="email"
                  className="ps-9 text-start"
                  placeholder="name@company.com"
                  aria-invalid={Boolean(errors.email)}
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{strings.auth.password}</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  dir="ltr"
                  autoComplete="current-password"
                  className="ps-9 text-start"
                  placeholder="••••••••••••"
                  aria-invalid={Boolean(errors.password)}
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  {strings.auth.signingIn}
                </>
              ) : (
                strings.auth.signIn
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
