/** Shared API envelope + pagination types mirroring the backend contract. */

export interface ResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  [key: string]: unknown;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: ResponseMeta;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId?: string;
}

/** A page of results carrying pagination metadata alongside the items. */
export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

/** Field-level validation issue as returned in `error.details` for VALIDATION_ERROR. */
export interface ValidationIssue {
  path: string;
  message: string;
  code?: string;
}
