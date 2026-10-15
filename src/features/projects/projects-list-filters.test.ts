import { describe, expect, it } from 'vitest';

import {
  defaultProjectsListFilters,
  projectsFiltersToListParams,
} from './projects-list-filters';

describe('projectsFiltersToListParams', () => {
  it('maps search and API-supported filters', () => {
    const filters = {
      ...defaultProjectsListFilters(),
      q: '  tower  ',
      type: 'Tender' as const,
      stage: 'Quotation' as const,
      consultantId: 'consultant-1',
      country: '  EG  ',
      salesPersonId: 'user-1',
      department: 'Sales' as const,
      createdFrom: '2026-01-01',
      createdTo: '2026-01-31',
    };

    expect(projectsFiltersToListParams(filters, { page: 2, limit: 20 })).toEqual({
      page: 2,
      limit: 20,
      status: 'active',
      q: 'tower',
      type: 'Tender',
      stage: 'Quotation',
      consultantId: 'consultant-1',
      country: 'EG',
      salesPersonId: 'user-1',
      department: 'Sales',
      createdFrom: '2026-01-01',
      createdTo: '2026-01-31',
    });
  });

  it('omits optional filters at defaults', () => {
    expect(projectsFiltersToListParams(defaultProjectsListFilters(), { page: 1, limit: 20 })).toEqual({
      page: 1,
      limit: 20,
      status: 'active',
    });
  });
});
