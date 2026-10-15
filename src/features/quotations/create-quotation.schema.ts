import { z } from 'zod';

export const createQuotationSchema = z.object({
  contractorId: z.string().min(1, 'Contractor is required'),
  opportunityId: z.string().min(1, 'Opportunity is required'),
  salesOwnerId: z.string(),
  currencyCode: z.string().min(3, 'Currency is required'),
  fxRateToBase: z.string(),
});

export type CreateQuotationFormValues = z.infer<typeof createQuotationSchema>;
