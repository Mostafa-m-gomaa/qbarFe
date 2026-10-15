import { get, getPaginated, patch, post } from '@/api/client/axios-client';
import type { Paginated } from '@/api/client/types';

import type {
  CreateDirectoryRequest,
  DirectoryEntry,
  ListDirectoryParams,
  UpdateDirectoryRequest,
} from './directory.types';

/**
 * Builds a CRUD + lifecycle API for a directory resource (Consultants / Contractors),
 * which share an identical backend contract. Not a cross-domain abstraction — a single
 * resource shape mounted at two paths.
 */
export function createDirectoryApi(basePath: string) {
  return {
    list(params: ListDirectoryParams = {}): Promise<Paginated<DirectoryEntry>> {
      return getPaginated<DirectoryEntry>(basePath, { params });
    },
    get(id: string): Promise<DirectoryEntry> {
      return get<DirectoryEntry>(`${basePath}/${id}`);
    },
    create(body: CreateDirectoryRequest): Promise<DirectoryEntry> {
      return post<DirectoryEntry>(basePath, body);
    },
    update(id: string, body: UpdateDirectoryRequest): Promise<DirectoryEntry> {
      return patch<DirectoryEntry>(`${basePath}/${id}`, body);
    },
    activate(id: string): Promise<DirectoryEntry> {
      return post<DirectoryEntry>(`${basePath}/${id}/activate`);
    },
    deactivate(id: string): Promise<DirectoryEntry> {
      return post<DirectoryEntry>(`${basePath}/${id}/deactivate`);
    },
    archive(id: string): Promise<DirectoryEntry> {
      return post<DirectoryEntry>(`${basePath}/${id}/archive`);
    },
  };
}

export type DirectoryApi = ReturnType<typeof createDirectoryApi>;
