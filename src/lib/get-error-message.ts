import { ApiError, isApiError } from '@/api/client/api-error';
import { strings } from '@/constants/strings';

/** Maps a normalized error to a user-facing Arabic message. */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    switch (error.code) {
      case 'FORBIDDEN':
        return strings.errors.permissionDenied;
      case 'NOT_FOUND':
        return strings.errors.notFound;
      case 'CONFLICT':
        return strings.errors.conflict;
      case 'VALIDATION_ERROR':
      case 'BAD_REQUEST':
        return error.message || strings.errors.validation;
      case 'TOO_MANY_REQUESTS':
        return strings.auth.rateLimited;
      case 'SERVICE_UNAVAILABLE':
        return strings.errors.unavailable;
      case 'NETWORK_ERROR':
        return strings.errors.unavailable;
      case 'INTERNAL_SERVER_ERROR':
        return strings.errors.generic;
      default:
        return error.message || strings.errors.generic;
    }
  }
  if (error instanceof Error) return error.message;
  return strings.errors.generic;
}

/** Extracts the requestId from an error for support/debug display, if available. */
export function getRequestId(error: unknown): string | undefined {
  return isApiError(error) ? error.requestId : undefined;
}

/** Returns field → message map from a VALIDATION_ERROR for form field mapping. */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError) || !error.isValidation) return {};
  const map: Record<string, string> = {};
  for (const issue of error.validationIssues) {
    if (issue.path && !(issue.path in map)) {
      map[issue.path] = issue.message;
    }
  }
  return map;
}
