import { z } from 'zod';

/** Matches backend constraints: name 1–200, valid email, password min 12 on create. */
export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(12, 'Password must be at least 12 characters').max(200),
  roleIds: z.array(z.string()).default([]),
});

export const editUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
  roleIds: z.array(z.string()).default([]),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type EditUserFormValues = z.infer<typeof editUserSchema>;
