import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const registerOrganizationInputSchema = z.object({
  organizationName: z
    .string()
    .min(1, 'Organization name is required')
    .max(100, 'Organization name must be at most 100 characters'),
  organizationSlug: z
    .string()
    .min(1, 'Organization slug is required')
    .max(50, 'Organization slug must be at most 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  cityName: z
    .string()
    .min(1, 'City name is required')
    .max(100, 'City name must be at most 100 characters'),
  citySlug: z
    .string()
    .min(1, 'City slug is required')
    .max(50, 'City slug must be at most 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  baselineEmissions: z
    .number()
    .min(0.01, 'Baseline emissions must be at least 0.01')
    .max(999_999_999.99, 'Baseline emissions must not exceed 999,999,999.99'),
  targetYear: z
    .number()
    .int('Target year must be a whole number')
    .min(currentYear + 1, `Target year must be greater than ${currentYear}`),
});

export type RegisterOrganizationInput = z.infer<typeof registerOrganizationInputSchema>;

export const joinCityInputSchema = z.object({
  citySlug: z
    .string()
    .min(1, 'City slug is required')
    .max(50, 'City slug must be at most 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
});

export type JoinCityInput = z.infer<typeof joinCityInputSchema>;
