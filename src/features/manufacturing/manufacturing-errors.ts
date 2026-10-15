import { toast } from 'sonner';

import { strings } from '@/constants/strings';
import { getErrorMessage, getRequestId } from '@/lib/get-error-message';

/** Surfaces mutation errors with optional backend requestId for support. */
export function toastManufacturingError(error: unknown): void {
  const message = getErrorMessage(error);
  const requestId = getRequestId(error);
  toast.error(
    requestId ? `${message} (${strings.common.requestId}: ${requestId})` : message,
  );
}
