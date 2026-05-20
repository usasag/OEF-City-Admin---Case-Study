'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  registerOrganizationInputSchema,
  registerOrganization,
  type RegisterOrganizationInput,
} from '@/actions/onboarding';

export function OnboardingWizard() {
  const router = useRouter();

  const [organizationName, setOrganizationName] = useState('');
  const [organizationSlug, setOrganizationSlug] = useState('');
  const [cityName, setCityName] = useState('');
  const [citySlug, setCitySlug] = useState('');
  const [baselineEmissions, setBaselineEmissions] = useState('');
  const [targetYear, setTargetYear] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setServerError(null);

    const formData: RegisterOrganizationInput = {
      organizationName: organizationName.trim(),
      organizationSlug: organizationSlug.trim(),
      cityName: cityName.trim(),
      citySlug: citySlug.trim(),
      baselineEmissions: parseFloat(baselineEmissions),
      targetYear: parseInt(targetYear, 10),
    };

    // Client-side validation
    const result = registerOrganizationInputSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0]?.toString();
        if (field && !errors[field]) {
          errors[field] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    // Submit to server
    setIsSubmitting(true);
    try {
      const response = await registerOrganization(result.data);

      if (response.success) {
        router.push('/admin');
      } else {
        if (response.error.fieldErrors) {
          setFieldErrors(response.error.fieldErrors);
        } else {
          setServerError(response.error.message);
        }
      }
    } catch {
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-800 dark:text-red-300">{serverError}</p>
        </div>
      )}

      {/* Organization Section */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-ink">Organization</legend>

        <div>
          <label htmlFor="organizationName" className="mb-1.5 block text-sm font-medium text-ink">
            Organization Name
          </label>
          <input
            id="organizationName"
            type="text"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            placeholder="e.g. City of Portland"
            className={`input ${fieldErrors.organizationName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
            aria-invalid={!!fieldErrors.organizationName}
            aria-describedby={fieldErrors.organizationName ? 'organizationName-error' : undefined}
          />
          {fieldErrors.organizationName && (
            <p id="organizationName-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400">
              {fieldErrors.organizationName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="organizationSlug" className="mb-1.5 block text-sm font-medium text-ink">
            Organization Slug
          </label>
          <input
            id="organizationSlug"
            type="text"
            value={organizationSlug}
            onChange={(e) => setOrganizationSlug(e.target.value)}
            placeholder="e.g. city-of-portland"
            className={`input ${fieldErrors.organizationSlug ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
            aria-invalid={!!fieldErrors.organizationSlug}
            aria-describedby={fieldErrors.organizationSlug ? 'organizationSlug-error' : undefined}
          />
          <p className="mt-1 text-xs text-ink-muted">
            Lowercase letters, numbers, and hyphens only
          </p>
          {fieldErrors.organizationSlug && (
            <p id="organizationSlug-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400">
              {fieldErrors.organizationSlug}
            </p>
          )}
        </div>
      </fieldset>

      {/* City Section */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-ink">First City</legend>

        <div>
          <label htmlFor="cityName" className="mb-1.5 block text-sm font-medium text-ink">
            City Name
          </label>
          <input
            id="cityName"
            type="text"
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
            placeholder="e.g. Portland"
            className={`input ${fieldErrors.cityName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
            aria-invalid={!!fieldErrors.cityName}
            aria-describedby={fieldErrors.cityName ? 'cityName-error' : undefined}
          />
          {fieldErrors.cityName && (
            <p id="cityName-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400">
              {fieldErrors.cityName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="citySlug" className="mb-1.5 block text-sm font-medium text-ink">
            City Slug
          </label>
          <input
            id="citySlug"
            type="text"
            value={citySlug}
            onChange={(e) => setCitySlug(e.target.value)}
            placeholder="e.g. portland"
            className={`input ${fieldErrors.citySlug ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
            aria-invalid={!!fieldErrors.citySlug}
            aria-describedby={fieldErrors.citySlug ? 'citySlug-error' : undefined}
          />
          <p className="mt-1 text-xs text-ink-muted">
            Lowercase letters, numbers, and hyphens only
          </p>
          {fieldErrors.citySlug && (
            <p id="citySlug-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400">
              {fieldErrors.citySlug}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="baselineEmissions" className="mb-1.5 block text-sm font-medium text-ink">
            Baseline Emissions (tonnes CO2e)
          </label>
          <input
            id="baselineEmissions"
            type="number"
            step="0.01"
            min="0.01"
            value={baselineEmissions}
            onChange={(e) => setBaselineEmissions(e.target.value)}
            placeholder="e.g. 50000"
            className={`input ${fieldErrors.baselineEmissions ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
            aria-invalid={!!fieldErrors.baselineEmissions}
            aria-describedby={fieldErrors.baselineEmissions ? 'baselineEmissions-error' : undefined}
          />
          {fieldErrors.baselineEmissions && (
            <p id="baselineEmissions-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400">
              {fieldErrors.baselineEmissions}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="targetYear" className="mb-1.5 block text-sm font-medium text-ink">
            Target Year
          </label>
          <input
            id="targetYear"
            type="number"
            step="1"
            value={targetYear}
            onChange={(e) => setTargetYear(e.target.value)}
            placeholder="e.g. 2035"
            className={`input ${fieldErrors.targetYear ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
            aria-invalid={!!fieldErrors.targetYear}
            aria-describedby={fieldErrors.targetYear ? 'targetYear-error' : undefined}
          />
          {fieldErrors.targetYear && (
            <p id="targetYear-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400">
              {fieldErrors.targetYear}
            </p>
          )}
        </div>
      </fieldset>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? 'Registering...' : 'Register Organization'}
      </button>
    </form>
  );
}
