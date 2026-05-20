'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createFirstCity, type CreateFirstCityInput } from '@/actions/onboarding';

/**
 * Step 2 of onboarding (create path): create a new city for the already-registered org.
 */
export function CreateCityForm() {
  const router = useRouter();

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

    const input: CreateFirstCityInput = {
      cityName: cityName.trim(),
      citySlug: citySlug.trim().toLowerCase(),
      baselineEmissions: parseFloat(baselineEmissions),
      targetYear: parseInt(targetYear, 10),
    };

    setIsSubmitting(true);
    try {
      const result = await createFirstCity(input);

      if (result.success) {
        router.push('/admin');
      } else {
        if (result.error.fieldErrors) {
          setFieldErrors(result.error.fieldErrors);
        } else {
          setServerError(result.error.message);
        }
      }
    } catch {
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-800 dark:text-red-300">{serverError}</p>
        </div>
      )}

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
          className={`input ${fieldErrors.cityName ? 'border-red-500' : ''}`}
          aria-invalid={!!fieldErrors.cityName}
        />
        {fieldErrors.cityName && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{fieldErrors.cityName}</p>
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
          className={`input ${fieldErrors.citySlug ? 'border-red-500' : ''}`}
          aria-invalid={!!fieldErrors.citySlug}
        />
        <p className="mt-1 text-xs text-ink-muted">
          Lowercase letters, numbers, and hyphens only. This becomes the public URL.
        </p>
        {fieldErrors.citySlug && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{fieldErrors.citySlug}</p>
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
          className={`input ${fieldErrors.baselineEmissions ? 'border-red-500' : ''}`}
          aria-invalid={!!fieldErrors.baselineEmissions}
        />
        {fieldErrors.baselineEmissions && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{fieldErrors.baselineEmissions}</p>
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
          className={`input ${fieldErrors.targetYear ? 'border-red-500' : ''}`}
          aria-invalid={!!fieldErrors.targetYear}
        />
        {fieldErrors.targetYear && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{fieldErrors.targetYear}</p>
        )}
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? 'Creating...' : 'Create City'}
      </button>
    </form>
  );
}
