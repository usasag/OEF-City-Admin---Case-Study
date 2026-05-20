import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const citySchema = z.object({
  name: z
    .string()
    .min(1, 'City name is required')
    .max(100, 'City name must be at most 100 characters'),
  baselineEmissions: z
    .number()
    .min(0.01, 'Baseline emissions must be at least 0.01')
    .max(999_999_999.99, 'Baseline emissions must not exceed 999,999,999.99'),
  targetYear: z
    .number()
    .int('Target year must be a whole number')
    .min(currentYear + 1, `Target year must be greater than ${currentYear}`)
    .max(9999, 'Target year must be a valid 4-digit year'),
});

export type CityFormData = z.infer<typeof citySchema>;
