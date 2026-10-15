import type { ListProjectsParams } from '@/api/projects/projects.types';

import { fetchAllProjectIds, fetchProjectDetails } from './fetch-projects-for-export';
import { downloadProjectsCsv } from './projects-export-csv';
import { downloadProjectsPdf } from './projects-export-pdf';
import { projectsToExportRows } from './projects-export-rows';
import type { ProjectsExportLookups } from './projects-export.types';

export type ProjectsExportFormat = 'csv' | 'pdf';
export type ProjectsExportScope = 'selected' | 'filtered';

export async function runProjectsExport(options: {
  format: ProjectsExportFormat;
  scope: ProjectsExportScope;
  listParams: ListProjectsParams;
  selectedIds: string[];
  lookups: ProjectsExportLookups;
  filterSummary: string;
}): Promise<{ projectCount: number; rowCount: number }> {
  const { format, scope, listParams, selectedIds, lookups, filterSummary } = options;

  const ids =
    scope === 'selected'
      ? selectedIds
      : await fetchAllProjectIds({ ...listParams, page: undefined, limit: undefined });

  const details = await fetchProjectDetails(ids);
  const rows = projectsToExportRows(details, lookups);

  if (format === 'csv') {
    downloadProjectsCsv(rows);
  } else {
    downloadProjectsPdf({ projects: details, filterSummary, lookups });
  }

  return { projectCount: details.length, rowCount: rows.length };
}
