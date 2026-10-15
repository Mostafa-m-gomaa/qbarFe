import { get, patch, post } from '@/api/client/axios-client';

import type {
  CreateUserRequest,
  ListUsersParams,
  UpdateUserRequest,
  User,
} from './users.types';

/** GET /users — not paginated; returns a plain array. */
export function listUsers(params: ListUsersParams = {}): Promise<User[]> {
  return get<User[]>('/users', { params });
}

export function getUser(id: string): Promise<User> {
  return get<User>(`/users/${id}`);
}

export function createUser(body: CreateUserRequest): Promise<User> {
  return post<User>('/users', body);
}

export function updateUser(id: string, body: UpdateUserRequest): Promise<User> {
  return patch<User>(`/users/${id}`, body);
}

export function activateUser(id: string): Promise<User> {
  return post<User>(`/users/${id}/activate`);
}

export function deactivateUser(id: string): Promise<User> {
  return post<User>(`/users/${id}/deactivate`);
}
