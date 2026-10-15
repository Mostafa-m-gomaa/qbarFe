import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import { session } from '@/stores/auth/session';

import { ApiError, type ApiErrorCode } from './api-error';
import { refreshAccessToken } from './refresh-manager';
import type { ApiErrorBody, Paginated, ResponseMeta } from './types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/** Endpoints that must never trigger an automatic refresh-and-retry on 401. */
const NO_REFRESH_PATHS = ['/auth/refresh', '/auth/login'];

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request: attach the in-memory access token ──────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = session.getAccessToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// ── Response: single-flight 401 refresh + typed error normalization ─────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as RetryableConfig | undefined;
    const status = error.response?.status;
    const url = original?.url ?? '';
    const isAuthEndpoint = NO_REFRESH_PATHS.some((path) => url.includes(path));

    if (status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      try {
        const newToken = await refreshAccessToken();
        original.headers.set('Authorization', `Bearer ${newToken}`);
        return apiClient(original);
      } catch {
        session.notifyUnauthenticated();
        throw toApiError(error);
      }
    }

    throw toApiError(error);
  },
);

/** Converts any Axios failure into a normalized {@link ApiError}. */
function toApiError(error: AxiosError<ApiErrorBody>): ApiError {
  if (error.response) {
    const { status, data } = error.response;
    const body = data as ApiErrorBody | undefined;
    if (body && typeof body === 'object' && 'error' in body && body.error) {
      return new ApiError({
        code: (body.error.code as ApiErrorCode) ?? 'UNKNOWN',
        message: body.error.message,
        httpStatus: status,
        details: body.error.details,
        requestId: body.requestId,
      });
    }
    return new ApiError({
      code: httpStatusToCode(status),
      message: error.message,
      httpStatus: status,
    });
  }

  // No response: network error / server unreachable.
  return new ApiError({
    code: 'NETWORK_ERROR',
    message: error.message || 'Network error',
    httpStatus: null,
  });
}

function httpStatusToCode(status: number): ApiErrorCode {
  switch (status) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 413:
      return 'PAYLOAD_TOO_LARGE';
    case 429:
      return 'TOO_MANY_REQUESTS';
    case 503:
      return 'SERVICE_UNAVAILABLE';
    default:
      return status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'UNKNOWN';
  }
}

// ── Typed convenience helpers (features never touch Axios directly) ──────────

/** Low-level request returning both `data` and `meta` from the success envelope. */
export async function request<T>(
  config: AxiosRequestConfig,
): Promise<{ data: T; meta?: ResponseMeta }> {
  const response: AxiosResponse<{ data: T; meta?: ResponseMeta }> = await apiClient.request(config);
  return { data: response.data.data, meta: response.data.meta };
}

export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return (await request<T>({ ...config, method: 'GET', url })).data;
}

export async function post<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  return (await request<T>({ ...config, method: 'POST', url, data: body })).data;
}

export async function patch<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  return (await request<T>({ ...config, method: 'PATCH', url, data: body })).data;
}

export async function del<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  return (await request<T>({ ...config, method: 'DELETE', url })).data;
}

/** GET a paginated list, combining the `data` array with `meta` pagination. */
export async function getPaginated<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<Paginated<T>> {
  const { data, meta } = await request<T[]>({ ...config, method: 'GET', url });
  return {
    items: data,
    page: meta?.page ?? 1,
    limit: meta?.limit ?? data.length,
    total: meta?.total ?? data.length,
  };
}

/**
 * CSV escape hatch (e.g. `GET /reports/export`). Returns raw text — never routed through
 * the JSON envelope unwrapping. Not used by Phase 1 UI, provided for the reports surface.
 */
export async function getCsv(url: string, config?: AxiosRequestConfig): Promise<string> {
  const response = await apiClient.request<string>({
    ...config,
    method: 'GET',
    url,
    responseType: 'text',
    headers: { ...config?.headers, Accept: 'text/csv' },
  });
  return response.data;
}
