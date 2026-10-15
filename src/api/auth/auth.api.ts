import { get, post } from '@/api/client/axios-client';

import type {
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  MeResponse,
  RefreshResponse,
} from './auth.types';

export function login(body: LoginRequest): Promise<LoginResponse> {
  return post<LoginResponse>('/auth/login', body);
}

/** POST /auth/refresh — relies on the HttpOnly refresh cookie (withCredentials). */
export function refresh(): Promise<RefreshResponse> {
  return post<RefreshResponse>('/auth/refresh');
}

export function me(): Promise<MeResponse> {
  return get<MeResponse>('/auth/me');
}

export function logout(): Promise<{ loggedOut: boolean }> {
  return post<{ loggedOut: boolean }>('/auth/logout');
}

export function changePassword(body: ChangePasswordRequest): Promise<{ changed: boolean }> {
  return post<{ changed: boolean }>('/auth/change-password', body);
}
