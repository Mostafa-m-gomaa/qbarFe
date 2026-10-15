import { describe, expect, it } from 'vitest';

import type { ProjectDetail } from '@/api/projects/projects.types';

import { detailToExportRows } from './projects-export-rows';

const lookups = {
  consultantName: () => 'Consultant Co',
  contractorName: () => 'Contractor Co',
  userName: () => 'User One',
  usersNames: (ids: string[]) => ids.join(';'),
};

const baseDetail = {
  id: 'p1',
  number: 'PRJ-001',
  name: 'Alpha',
  type: 'In Hand',
  stage: 'Project',
  country: 'EG',
  city: 'Cairo',
  site: 'Site A',
  consultantId: 'c1',
  contractorId: 'k1',
  salesPersonIds: ['u1'],
  executionOwnerId: 'u2',
  department: 'Factory',
  customer: 'Customer X',
  poContractRef: 'PO-1',
  operationalStatus: 'PO Received',
  nextAction: null,
  actionOwnerId: null,
  actionDueOn: null,
  poDate: null,
  manufacturingClearanceOn: null,
  paymentDueOn: null,
  milestones: {
    drawingSubmittedOn: null,
    drawingApprovedOn: null,
    productionRequiredOn: null,
    deliveryTargetOn: null,
  },
  executionState: 'open',
  closedOn: null,
  expectedClosingDate: null,
  notes: '',
  tenderHistory: false,
  tenderClosed: true,
  status: 'active',
  createdBy: 'u1',
  updatedBy: 'u1',
  createdByUser: { id: 'u1', name: 'Creator', email: 'c@x.com' },
  updatedByUser: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  items: [],
  purchaseOrders: [],
} satisfies ProjectDetail;

describe('detailToExportRows', () => {
  it('returns one row when project has no items', () => {
    const rows = detailToExportRows(baseDetail, lookups);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.name).toBe('Alpha');
    expect(rows[0]?.lineNo).toBe('');
  });

  it('returns one row per quantity line', () => {
    const detail: ProjectDetail = {
      ...baseDetail,
      items: [
        {
          id: 'i1',
          projectId: 'p1',
          lineNo: 1,
          itemType: 'Sandwich Busbar',
          rating: '800A',
          conductor: 'Copper',
          plating: 'Silver',
          poles: '4',
          meters: '10',
          meterPrice: '100',
          quantity: '10',
          unitPrice: '1000',
          unitCode: 'm',
          currencyCode: 'USD',
          value: '1000',
          revision: 1,
          lifecycle: 'active',
          allocatedClearedQuantityScaled: 0,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 'i2',
          projectId: 'p1',
          lineNo: 2,
          itemType: 'Medium Power',
          rating: '630A',
          conductor: 'Aluminum',
          plating: 'Tin',
          poles: '5',
          meters: '5',
          meterPrice: '80',
          quantity: '5',
          unitPrice: '400',
          unitCode: 'm',
          currencyCode: 'USD',
          value: '400',
          revision: 1,
          lifecycle: 'active',
          allocatedClearedQuantityScaled: 0,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    };
    const rows = detailToExportRows(detail, lookups);
    expect(rows).toHaveLength(2);
    expect(rows[0]?.lineNo).toBe('1');
    expect(rows[1]?.lineNo).toBe('2');
    expect(rows[0]?.name).toBe('Alpha');
    expect(rows[1]?.name).toBe('Alpha');
  });
});
