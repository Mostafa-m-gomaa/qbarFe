import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { consultantsApi } from '@/api/consultants/consultants.api';
import { contractorsApi } from '@/api/contractors/contractors.api';
import { listOpportunities } from '@/api/opportunities/opportunities.api';
import type { Opportunity } from '@/api/opportunities/opportunities.types';
import { listProjects } from '@/api/projects/projects.api';
import type { ComboboxOption } from '@/components/common/combobox';
import { queryKeys } from '@/constants/query-keys';
import { useUsers } from '@/features/users/use-users';

/**
 * Lightweight reference lookups for CRM pickers and for resolving IDs → display names in
 * tables/detail views. The backend returns only IDs, so we fetch a bounded set of active
 * reference entities (limit 100) and build option lists + id→label maps.
 *
 * NOTE: this is name resolution only. The primary Project/Opportunity/Activity lists are always
 * filtered and paginated server-side — never client-side.
 */
const OPTIONS_LIMIT = 100;

// ── Users (salespeople / owners / assignees) ───────────────────────────────
export function useUserMap() {
  const { data } = useUsers();
  return useMemo(() => {
    const map = new Map<string, { id: string; name: string; email: string; isActive: boolean }>();
    for (const user of data ?? []) map.set(user.id, user);
    return map;
  }, [data]);
}

/** Active-user options; when `restrictTo` is provided, limited to those ids (∩ active). */
export function useActiveUserOptions(restrictTo?: readonly string[]): ComboboxOption[] {
  const { data } = useUsers({ isActive: true });
  return useMemo(() => {
    const allow = restrictTo ? new Set(restrictTo) : null;
    return (data ?? [])
      .filter((user) => user.isActive && (!allow || allow.has(user.id)))
      .map((user) => ({ value: user.id, label: user.name, description: user.email }));
  }, [data, restrictTo]);
}

// ── Consultants / Contractors (directory reference) ─────────────────────────
function useConsultantEntries() {
  return useQuery({
    queryKey: queryKeys.consultants.list({ scope: 'options' }),
    queryFn: () => consultantsApi.list({ status: 'active', limit: OPTIONS_LIMIT }),
  });
}

export function useConsultantOptions(): ComboboxOption[] {
  const { data } = useConsultantEntries();
  return useMemo(
    () => (data?.items ?? []).map((c) => ({ value: c.id, label: c.company, description: c.country })),
    [data],
  );
}

export function useConsultantMap() {
  const { data } = useConsultantEntries();
  return useMemo(() => {
    const map = new Map<string, string>();
    for (const c of data?.items ?? []) map.set(c.id, c.company);
    return map;
  }, [data]);
}

function useContractorEntries() {
  return useQuery({
    queryKey: queryKeys.contractors.list({ scope: 'options' }),
    queryFn: () => contractorsApi.list({ status: 'active', limit: OPTIONS_LIMIT }),
  });
}

export function useContractorOptions(): ComboboxOption[] {
  const { data } = useContractorEntries();
  return useMemo(
    () => (data?.items ?? []).map((c) => ({ value: c.id, label: c.company, description: c.country })),
    [data],
  );
}

export function useContractorMap() {
  const { data } = useContractorEntries();
  return useMemo(() => {
    const map = new Map<string, string>();
    for (const c of data?.items ?? []) map.set(c.id, c.company);
    return map;
  }, [data]);
}

// ── Opportunities (name resolution in cross-entity lists) ─────────────────────
function useOpportunityEntries() {
  return useQuery({
    queryKey: queryKeys.opportunities.list({ scope: 'options' }),
    queryFn: () => listOpportunities({ limit: OPTIONS_LIMIT }),
  });
}

export function useOpportunityMap() {
  const { data } = useOpportunityEntries();
  return useMemo(() => {
    const map = new Map<string, Opportunity>();
    for (const o of data?.items ?? []) map.set(o.id, o);
    return map;
  }, [data]);
}

// ── Projects (for opportunity/activity pickers + name resolution) ───────────
function useProjectEntries() {
  return useQuery({
    queryKey: queryKeys.projects.list({ scope: 'options' }),
    queryFn: () => listProjects({ status: 'active', limit: OPTIONS_LIMIT }),
  });
}

export function useProjectOptions(): ComboboxOption[] {
  const { data } = useProjectEntries();
  return useMemo(
    () => (data?.items ?? []).map((p) => ({ value: p.id, label: p.name, description: p.type })),
    [data],
  );
}

export function useProjectMap() {
  const { data } = useProjectEntries();
  return useMemo(() => {
    const map = new Map<string, { id: string; name: string; type: string; salesPersonIds: string[] }>();
    for (const p of data?.items ?? []) map.set(p.id, p);
    return map;
  }, [data]);
}
