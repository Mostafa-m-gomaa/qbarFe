import { z } from 'zod';

import type { QuotationCommercialStatus, SetCommercialStatusRequest } from '@/api/quotations/quotations.types';

const textRequired = z
  .string()
  .trim()
  .min(1, 'Required')
  .max(2000, 'Max 2000 characters');

const textOptional = z
  .string()
  .trim()
  .max(2000, 'Max 2000 characters')
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));

export const commercialStatusFormSchema = z.object({
  competitorName: z.string().optional(),
  reasonLost: z.string().optional(),
  details: z.string().optional(),
  cancellationReason: z.string().optional(),
  note: z.string().optional(),
  holdReason: z.string().optional(),
  newContractorId: z.string().optional(),
  reasonNote: z.string().optional(),
});

export type CommercialStatusFormValues = z.infer<typeof commercialStatusFormSchema>;

export function buildCommercialStatusPayload(
  status: QuotationCommercialStatus,
  values: CommercialStatusFormValues,
): SetCommercialStatusRequest {
  switch (status) {
    case 'Active':
    case 'Won':
      return { status };
    case 'Lost': {
      const details = textOptional.parse(values.details);
      return {
        status: 'Lost',
        competitorName: textRequired.parse(values.competitorName),
        reasonLost: textRequired.parse(values.reasonLost),
        ...(details ? { details } : {}),
      };
    }
    case 'Cancelled':
      return {
        status: 'Cancelled',
        cancellationReason: textRequired.parse(values.cancellationReason),
      };
    case 'ConvertedToCables': {
      const note = textOptional.parse(values.note);
      return {
        status: 'ConvertedToCables',
        ...(note ? { note } : {}),
      };
    }
    case 'OnHold': {
      const holdReason = textOptional.parse(values.holdReason);
      return {
        status: 'OnHold',
        ...(holdReason ? { holdReason } : {}),
      };
    }
    case 'ContractorChanged':
      return {
        status: 'ContractorChanged',
        newContractorId: z.string().min(1).parse(values.newContractorId),
        reasonNote: textRequired.parse(values.reasonNote),
      };
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}
