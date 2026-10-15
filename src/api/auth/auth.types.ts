import type { User } from '@/api/users/users.types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresInSeconds: number;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresInSeconds: number;
}

export interface MeResponse {
  user: User;
  permissions: string[];
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
