/**
 * Shared DTOs for directory resources (Consultants & Contractors) — the backend contract is
 * identical for both, so the shapes live here and each resource's api binds them to its path.
 */

export type DirectoryStatus = 'active' | 'inactive' | 'archived';

export interface DirectoryContact {
  name: string;
  phone: string;
  email: string;
}

export interface DirectoryEntry {
  id: string;
  company: string;
  country: string;
  contacts: DirectoryContact[];
  notes: string;
  status: DirectoryStatus;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DirectoryContactInput {
  name: string;
  phone?: string;
  email?: string;
}

export interface CreateDirectoryRequest {
  company: string;
  country?: string;
  contacts?: DirectoryContactInput[];
  notes?: string;
}

export interface UpdateDirectoryRequest {
  company?: string;
  country?: string;
  contacts?: DirectoryContactInput[];
  notes?: string;
}

export interface ListDirectoryParams {
  page?: number;
  limit?: number;
  status?: DirectoryStatus;
  country?: string;
  q?: string;
}
