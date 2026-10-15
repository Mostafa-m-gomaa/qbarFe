import { describe, expect, it } from 'vitest';

import {
  ACTIVITIES_FILTER_ALL,
  projectActivitiesListFiltersToParams,
} from '@/features/activities/project-activities-list-params';
import {
  OPPORTUNITIES_FILTER_ALL,
  opportunitiesListFiltersToParams,
} from '@/features/opportunities/opportunities-list-params';
import {
  QUOTATIONS_DEFAULT_DATE_SORT,
  QUOTATIONS_FILTER_ALL,
  quotationsListFiltersToParams,
} from '@/features/quotations/quotations-list-params';

describe('quotationsListFiltersToParams', () => {
  it('includes sales owner and opportunity type', () => {
    expect(
      quotationsListFiltersToParams({
        page: 1,
        limit: 20,
        contractorId: null,
        opportunityId: 'opp-1',
        status: QUOTATIONS_FILTER_ALL,
        commercialStatus: QUOTATIONS_FILTER_ALL,
        currencyCode: null,
        q: '',
        createdFrom: '',
        createdTo: '',
        salesOwnerId: 'user-9',
        opportunityType: 'In Hand',
        dateSortOrder: QUOTATIONS_DEFAULT_DATE_SORT,
        totalSort: QUOTATIONS_FILTER_ALL,
      }),
    ).toEqual({
      page: 1,
      limit: 20,
      opportunityId: 'opp-1',
      salesOwnerId: 'user-9',
      type: 'In Hand',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  });

  it('uses grand total sort when selected', () => {
    expect(
      quotationsListFiltersToParams({
        page: 1,
        limit: 20,
        contractorId: null,
        opportunityId: null,
        status: QUOTATIONS_FILTER_ALL,
        commercialStatus: QUOTATIONS_FILTER_ALL,
        currencyCode: null,
        q: '',
        createdFrom: '',
        createdTo: '',
        salesOwnerId: null,
        opportunityType: QUOTATIONS_FILTER_ALL,
        dateSortOrder: 'asc',
        totalSort: 'desc',
      }),
    ).toMatchObject({ sortBy: 'grandTotal', sortOrder: 'desc' });
  });
});

describe('opportunitiesListFiltersToParams', () => {
  it('includes trimmed search q', () => {
    expect(
      opportunitiesListFiltersToParams({
        page: 1,
        limit: 20,
        q: '  acme  ',
        contractorId: null,
        type: OPPORTUNITIES_FILTER_ALL,
        status: OPPORTUNITIES_FILTER_ALL,
        salesOwnerId: null,
        lifecycle: OPPORTUNITIES_FILTER_ALL,
      }),
    ).toEqual({
      page: 1,
      limit: 20,
      q: 'acme',
    });
  });
});

describe('projectActivitiesListFiltersToParams', () => {
  it('includes trimmed search q and locked project', () => {
    expect(
      projectActivitiesListFiltersToParams({
        page: 1,
        limit: 20,
        q: 'call',
        projectId: null,
        defaultProjectId: 'proj-1',
        assignedUserId: null,
        type: ACTIVITIES_FILTER_ALL,
        completed: ACTIVITIES_FILTER_ALL,
        dueFrom: '',
        dueTo: '',
      }),
    ).toEqual({
      page: 1,
      limit: 20,
      q: 'call',
      projectId: 'proj-1',
    });
  });
});
