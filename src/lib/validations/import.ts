import { z } from 'zod';

export const importTextSchema = z.object({
  text: z
    .string()
    .min(1, 'Import text is required')
    .max(10000, 'Import text must not exceed 10,000 characters'),
});

export type ImportTextFormData = z.infer<typeof importTextSchema>;
