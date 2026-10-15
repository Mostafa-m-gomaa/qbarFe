import type { ValidationIssue } from './types';

/** Backend error codes (see frontend-system-guide §5). */
export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'PAYLOAD_TOO_LARGE'
  | 'TOO_MANY_REQUESTS'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_SERVER_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'NETWORK_ERROR'
  | 'UNKNOWN';

/**
 * Normalized, typed error surfaced to the whole app. The Axios response interceptor
 * converts any failure into an `ApiError` so features never inspect raw Axios errors.
 */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly httpStatus: number | null;
  readonly details: unknown;
  readonly requestId: string | undefined;

  constructor(params: {
    code: ApiErrorCode;
    message: string;
    httpStatus?: number | null;
    details?: unknown;
    requestId?: string;
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.code = params.code;
    this.httpStatus = params.httpStatus ?? null;
    this.details = params.details;
    this.requestId = params.requestId;
  }

  /** True for a VALIDATION_ERROR carrying field-level issues. */
  get isValidation(): boolean {
    return this.code === 'VALIDATION_ERROR';
  }

  /** Returns the field-level validation issues, if present. */
  get validationIssues(): ValidationIssue[] {
    if (!this.isValidation || !Array.isArray(this.details)) return [];
    return (this.details as unknown[]).filter(
      (issue): issue is ValidationIssue =>
        typeof issue === 'object' &&
        issue !== null &&
        'path' in issue &&
        'message' in issue,
    );
  }
}

/** Type guard for {@link ApiError}. */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
