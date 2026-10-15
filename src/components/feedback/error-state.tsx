import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { strings } from '@/constants/strings';
import { getErrorMessage, getRequestId } from '@/lib/get-error-message';

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}

/** Inline error surface with an optional retry and a collapsible requestId for support. */
export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  const message = getErrorMessage(error);
  const requestId = getRequestId(error);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-12 text-center',
        className,
      )}
      role="alert"
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" />
      </div>
      <p className="font-medium text-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {strings.common.retry}
        </Button>
      )}
      {requestId && (
        <details className="mt-1 text-xs text-muted-foreground">
          <summary className="cursor-pointer">{strings.common.details}</summary>
          <code className="mt-1 block" dir="ltr">
            {strings.common.requestId}: {requestId}
          </code>
        </details>
      )}
    </div>
  );
}
