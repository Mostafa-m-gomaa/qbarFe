import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  CreateDirectoryRequest,
  ListDirectoryParams,
  UpdateDirectoryRequest,
} from '@/api/directory/directory.types';

import type { DirectoryConfig } from './directory-config';

export function useDirectoryList(config: DirectoryConfig, params: ListDirectoryParams) {
  return useQuery({
    queryKey: config.listKey(params),
    queryFn: () => config.api.list(params),
  });
}

export function useCreateDirectory(config: DirectoryConfig) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateDirectoryRequest) => config.api.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: config.allKey }),
  });
}

export function useUpdateDirectory(config: DirectoryConfig) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateDirectoryRequest }) =>
      config.api.update(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: config.allKey }),
  });
}

type LifecycleAction = 'activate' | 'deactivate' | 'archive';

export function useDirectoryLifecycle(config: DirectoryConfig) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: LifecycleAction }) =>
      config.api[action](id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: config.allKey }),
  });
}
