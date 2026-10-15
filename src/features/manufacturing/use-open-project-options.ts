import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { listProjects } from '@/api/projects/projects.api';
import type { ComboboxOption } from '@/components/common/combobox';
import { queryKeys } from '@/constants/query-keys';

const OPTIONS_LIMIT = 100;

/** Active projects with open execution — for clearance / production pickers. */
export function useOpenProjectOptions(): ComboboxOption[] {
  const { data } = useQuery({
    queryKey: queryKeys.projects.list({ scope: 'manufacturing-open' }),
    queryFn: () =>
      listProjects({ status: 'active', executionState: 'open', limit: OPTIONS_LIMIT }),
  });
  return useMemo(
    () =>
      (data?.items ?? []).map((p) => ({
        value: p.id,
        label: p.name,
        description: p.number ?? p.type,
      })),
    [data],
  );
}
