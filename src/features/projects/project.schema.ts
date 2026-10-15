import { z } from 'zod';

import {
  PROJECT_DEPARTMENTS,
  PROJECT_ITEM_CONDUCTORS,
  PROJECT_ITEM_PLATINGS,
  PROJECT_ITEM_POLES,
  PROJECT_ITEM_RATINGS,
  PROJECT_ITEM_TYPES,
  PROJECT_OPERATIONAL_STATUSES,
} from '@/api/projects/project-enums';

const optionalDate = z.string();

export const projectItemFormSchema = z.object({
  id: z.string().optional(),
  itemType: z.enum(PROJECT_ITEM_TYPES),
  rating: z.enum(PROJECT_ITEM_RATINGS),
  conductor: z.enum(PROJECT_ITEM_CONDUCTORS),
  plating: z.enum(PROJECT_ITEM_PLATINGS),
  poles: z.enum(PROJECT_ITEM_POLES),
  meters: z.string().min(1, 'Meters is required'),
  meterPrice: z.string().min(1, 'Meter price is required'),
  allocatedClearedQuantityScaled: z.number().optional(),
});

export type ProjectItemFormValues = z.infer<typeof projectItemFormSchema>;

export const projectFormSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
    type: z.enum(['Tender', 'In Hand']),
    customer: z.string().max(200, 'Customer is too long'),
    site: z.string().max(200, 'Site is too long'),
    country: z.string().max(80, 'Country is too long'),
    city: z.string().max(80, 'City is too long'),
    consultantId: z.string(),
    contractorId: z.string(),
    executionOwnerId: z.string(),
    department: z.union([z.enum(PROJECT_DEPARTMENTS), z.literal('')]),
    salesPersonIds: z.array(z.string()),
    poContractRef: z.string().max(200, 'PO reference is too long'),
    operationalStatus: z.union([z.enum(PROJECT_OPERATIONAL_STATUSES), z.literal('')]),
    poDate: optionalDate,
    manufacturingClearanceOn: optionalDate,
    paymentDueOn: optionalDate,
    nextAction: z.string().max(200, 'Next action is too long'),
    actionOwnerId: z.string(),
    actionDueOn: optionalDate,
    drawingSubmittedOn: optionalDate,
    drawingApprovedOn: optionalDate,
    productionRequiredOn: optionalDate,
    deliveryTargetOn: optionalDate,
    expectedClosingDate: optionalDate,
    notes: z.string().max(2000, 'Notes are too long'),
    items: z.array(projectItemFormSchema),
  })
  .superRefine((values, ctx) => {
    const submitted = values.drawingSubmittedOn.trim();
    const approved = values.drawingApprovedOn.trim();
    if (submitted && approved && approved < submitted) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Drawing approved must be on or after drawing submitted',
        path: ['drawingApprovedOn'],
      });
    }
  });

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export const emptyProjectItemRow: ProjectItemFormValues = {
  itemType: 'Sandwich Busbar',
  rating: '800A',
  conductor: 'Copper',
  plating: 'Tin',
  poles: '4',
  meters: '',
  meterPrice: '',
};

export const emptyProjectForm: ProjectFormValues = {
  name: '',
  type: 'In Hand',
  customer: '',
  site: '',
  country: '',
  city: '',
  consultantId: '',
  contractorId: '',
  executionOwnerId: '',
  department: '',
  salesPersonIds: [],
  poContractRef: '',
  operationalStatus: '',
  poDate: '',
  manufacturingClearanceOn: '',
  paymentDueOn: '',
  nextAction: '',
  actionOwnerId: '',
  actionDueOn: '',
  drawingSubmittedOn: '',
  drawingApprovedOn: '',
  productionRequiredOn: '',
  deliveryTargetOn: '',
  expectedClosingDate: '',
  notes: '',
  items: [],
};
