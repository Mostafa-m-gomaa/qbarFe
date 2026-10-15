import { z } from 'zod';

/** Contact row — email may be blank or a valid address (mirrors backend). */
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(80, 'Name is too long'),
  phone: z.string().max(40, 'Phone is too long'),
  email: z.union([z.literal(''), z.string().email('Invalid email').max(120)]),
});

export const directoryFormSchema = z.object({
  company: z.string().min(1, 'Company is required').max(200, 'Company is too long'),
  country: z.string().max(80, 'Country is too long'),
  contacts: z.array(contactSchema).max(10, 'At most 10 contacts'),
  notes: z.string().max(2000, 'Notes are too long'),
});

export type DirectoryFormValues = z.infer<typeof directoryFormSchema>;

export const emptyContact = { name: '', phone: '', email: '' };
