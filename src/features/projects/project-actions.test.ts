import { describe, expect, it } from 'vitest';

import type { ProjectDetail } from '@/api/projects/projects.types';

import { projectActions } from './project-actions';
import {
  formValuesToCreatePayload,
  formValuesToUpdatePayload,
  projectToFormValues,
} from './project-payload';
import { emptyProjectForm, projectFormSchema } from './project.schema';

const allPerms = {
  canUpdate: true,
  canStage: true,
  canCloseTender: true,
  canArchive: true,
  canCloseExecution: true,
  canReopenExecution: true,
};

const baseProject = {
  status: 'active' as const,
  type: 'In Hand' as const,
  tenderClosed: false,
  executionState: 'open' as const,
};

describe('projectActions', () => {
  it('allows edit, stage, and archive for an active open project', () => {
    expect(projectActions(baseProject, allPerms)).toEqual({
      canEdit: true,
      canChangeStage: true,
      canCloseTender: false,
      canArchive: true,
      canCloseExecution: true,
      canReopenExecution: false,
    });
  });

  it('allows Close Tender only for active Tender projects that are not closed', () => {
    expect(
      projectActions(
        { ...baseProject, type: 'Tender', tenderClosed: false },
        allPerms,
      ).canCloseTender,
    ).toBe(true);
    expect(
      projectActions(
        { ...baseProject, type: 'Tender', tenderClosed: true },
        allPerms,
      ).canCloseTender,
    ).toBe(false);
  });

  it('blocks edit when execution is closed but allows reopen', () => {
    expect(
      projectActions({ ...baseProject, executionState: 'closed' }, allPerms),
    ).toMatchObject({
      canEdit: false,
      canCloseExecution: false,
      canReopenExecution: true,
    });
  });

  it('blocks all mutations when archived', () => {
    expect(
      projectActions({ ...baseProject, status: 'archived' }, allPerms),
    ).toEqual({
      canEdit: false,
      canChangeStage: false,
      canCloseTender: false,
      canArchive: false,
      canCloseExecution: false,
      canReopenExecution: false,
    });
  });
});

describe('projectFormSchema', () => {
  const valid = {
    ...emptyProjectForm,
    name: 'Tower A',
    type: 'Tender' as const,
    consultantId: 'consultant-1',
    salesPersonIds: ['u1'],
  };

  it('requires a name', () => {
    expect(projectFormSchema.safeParse({ ...valid, name: '' }).success).toBe(false);
    expect(projectFormSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects drawing approved before submitted', () => {
    expect(
      projectFormSchema.safeParse({
        ...valid,
        drawingSubmittedOn: '2026-05-10',
        drawingApprovedOn: '2026-05-01',
      }).success,
    ).toBe(false);
  });

  it('allows empty salesPersonIds on create-oriented values', () => {
    expect(projectFormSchema.safeParse({ ...valid, salesPersonIds: [] }).success).toBe(true);
  });

  it('allows a project without a consultant', () => {
    expect(projectFormSchema.safeParse({ ...valid, consultantId: '' }).success).toBe(true);
  });
});

describe('project-payload', () => {
  it('maps milestones from API response to flat form dates', () => {
    const project = {
      id: 'p1',
      name: 'Test',
      type: 'In Hand',
      stage: 'Lead',
      country: '',
      city: '',
      site: '',
      consultantId: null,
      contractorId: null,
      salesPersonIds: [],
      executionOwnerId: null,
      department: null,
      customer: '',
      poContractRef: null,
      operationalStatus: null,
      nextAction: null,
      actionOwnerId: null,
      actionDueOn: null,
      poDate: null,
      manufacturingClearanceOn: null,
      paymentDueOn: null,
      milestones: {
        drawingSubmittedOn: '2026-03-05T00:00:00.000Z',
        drawingApprovedOn: '2026-03-10T00:00:00.000Z',
        productionRequiredOn: null,
        deliveryTargetOn: null,
      },
      executionState: 'open',
      closedOn: null,
      expectedClosingDate: null,
      notes: '',
      tenderHistory: false,
      tenderClosed: false,
      status: 'active',
      number: 'PBT-PRJ-2026-0001',
      createdBy: 'u1',
      updatedBy: 'u1',
      createdByUser: { id: 'u1', name: 'Creator', email: 'creator@example.com' },
      updatedByUser: { id: 'u1', name: 'Creator', email: 'creator@example.com' },
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      items: [],
      purchaseOrders: [],
    } satisfies ProjectDetail;

    const form = projectToFormValues(project);
    expect(form.drawingSubmittedOn).toBe('2026-03-05');
    expect(form.drawingApprovedOn).toBe('2026-03-10');
  });

  it('sends flat milestone fields and items on create', () => {
    const payload = formValuesToCreatePayload({
      ...emptyProjectForm,
      name: ' Lines ',
      consultantId: 'consultant-1',
      drawingSubmittedOn: '2026-03-05',
      drawingApprovedOn: '2026-03-10',
      items: [
        {
          itemType: 'Sandwich Busbar',
          rating: '800A',
          conductor: 'Copper',
          plating: 'Tin',
          poles: '4',
          meters: '12',
          meterPrice: '16000',
        },
      ],
    });
    expect(payload.name).toBe('Lines');
    expect(payload.consultantId).toBe('consultant-1');
    expect(payload.drawingSubmittedOn).toBe('2026-03-05');
    expect(payload.items).toHaveLength(1);
    expect(payload.items?.[0]).not.toHaveProperty('id');
  });

  it('omits an empty consultant on create and sends null on update', () => {
    const values = { ...emptyProjectForm, name: 'No consultant' };

    expect(formValuesToCreatePayload(values)).not.toHaveProperty('consultantId');
    expect(formValuesToUpdatePayload(values).consultantId).toBeNull();
  });
});
