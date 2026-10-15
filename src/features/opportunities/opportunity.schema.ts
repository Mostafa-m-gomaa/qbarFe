import { z } from 'zod';

export const opportunityFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200, 'Name is too long'),
  description: z.string().max(2000, 'Description is too long'),
  type: z.enum(['Tender', 'In Hand']),
  salesOwnerId: z.string(),
});

export type OpportunityFormValues = z.infer<typeof opportunityFormSchema>;
