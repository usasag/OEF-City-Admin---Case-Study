import { z } from 'zod';

/**
 * Zod schema for a single extracted climate action from LLM output.
 * Mirrors the climateActionSchema constraints for consistency.
 */
export const extractedActionSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters'),
  sector: z.enum(['transport', 'energy', 'buildings', 'waste', 'land_use'], {
    message: 'Invalid sector',
  }),
  annualReduction: z
    .number()
    .min(0, 'Annual reduction must be non-negative')
    .max(999_999_999.99, 'Annual reduction must not exceed 999,999,999.99'),
  status: z.enum(['planned', 'in_progress', 'completed'], {
    message: 'Invalid status',
  }),
  startYear: z
    .number()
    .int('Start year must be a whole number')
    .min(2000, 'Start year must be at least 2000')
    .max(2100, 'Start year must be at most 2100'),
});

/**
 * Schema for the full extraction output — an array of extracted actions.
 */
export const extractionOutputSchema = z.object({
  actions: z.array(extractedActionSchema).max(50),
});

export type ExtractedAction = z.infer<typeof extractedActionSchema>;
export type ExtractionOutput = z.infer<typeof extractionOutputSchema>;
