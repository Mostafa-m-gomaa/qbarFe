/** User DTOs mirroring the backend user response contract. */

export interface User {
  id: string;
  name: string;
  email: string;
  roleIds: string[];
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListUsersParams {
  isActive?: boolean;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  roleIds: string[];
}

export interface UpdateUserRequest {
  name?: string;
  roleIds?: string[];
}
