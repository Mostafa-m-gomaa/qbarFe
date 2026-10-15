import { Building2, UserRound, type LucideIcon } from 'lucide-react';

import { consultantsApi } from '@/api/consultants/consultants.api';
import { contractorsApi } from '@/api/contractors/contractors.api';
import type { DirectoryApi } from '@/api/directory/directory.api';
import { PERMISSIONS } from '@/constants/permissions';
import { queryKeys } from '@/constants/query-keys';
import { strings } from '@/constants/strings';

export interface DirectoryPermissions {
  read: string;
  create: string;
  update: string;
  activate: string;
  deactivate: string;
  archive: string;
}

export interface DirectoryConfig {
  /** Stable identifier, also used in element keys. */
  id: 'consultants' | 'contractors';
  api: DirectoryApi;
  /** Query key roots (from the central query-keys registry). */
  allKey: readonly unknown[];
  listKey: (filters?: object) => readonly unknown[];
  permissions: DirectoryPermissions;
  icon: LucideIcon;
  /** Singular/plural nouns for generated copy. */
  noun: string;
  nounPlural: string;
  title: string;
  subtitle: string;
}

export const consultantsConfig: DirectoryConfig = {
  id: 'consultants',
  api: consultantsApi,
  allKey: queryKeys.consultants.all,
  listKey: queryKeys.consultants.list,
  permissions: PERMISSIONS.consultants,
  icon: UserRound,
  noun: 'consultant',
  nounPlural: 'consultants',
  title: strings.nav.consultants,
  subtitle: 'Consulting firms referenced across projects',
};

export const contractorsConfig: DirectoryConfig = {
  id: 'contractors',
  api: contractorsApi,
  allKey: queryKeys.contractors.all,
  listKey: queryKeys.contractors.list,
  permissions: PERMISSIONS.contractors,
  icon: Building2,
  noun: 'contractor',
  nounPlural: 'contractors',
  title: strings.nav.contractors,
  subtitle: 'Contractors used in quotations and purchase orders',
};
