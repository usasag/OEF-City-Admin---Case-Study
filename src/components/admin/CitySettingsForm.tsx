'use client';

import { useState } from 'react';
import { citySchema, type CityFormData } from '@/lib/validations/city';
import { updateCitySettings } from '@/actions/city';

interface CitySettingsFormProps {
  initialData: CityFormData;
}

export function CitySettingsForm({ initialData }: CitySettingsFormProps) {
  const [name, setName] = useState(initialData.name);
  const [baselineEmissions, setBaselineEmissions] = useState(
    String(initialData.baselineEmissions)
  );
  const [targetYear, setTargetYear] = useState(String(initialData.targetYear));

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setServerError(null);
    setSuccessMessage(null);

    // Build form data object with proper types
    const formData = {
      name: name.trim(),
      baselineEmissions: parseFloat(baselineEmissions),
      targetYear: parseInt(targetYear, 10),
    };

    // Client-side Zod validation
    const result = citySchema.safeParse(formData);
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

    // Submit to server action
    setIsSubmitting(true);
    try {
      const response = await updateCitySettings(result.data);

      if (response.success) {
        setSuccessMessage('City settings updated successfully.');
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
      {successMessage && (
        <div className="rounded-md bg-green-50 border border-green-200 p-4">
          <p className="text-sm text-green-800">{successMessage}</p>
        </div>
      )}

      {serverError && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">{serverError}</p>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          City Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            fieldErrors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          aria-invalid={!!fieldErrors.name}
          aria-describedby={fieldErrors.name ? 'name-error' : undefined}
        />
        {fieldErrors.name && (
          <p id="name-error" className="mt-1 text-sm text-red-600">
            {fieldErrors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="baselineEmissions" className="block text-sm font-medium text-gray-700">
          Baseline Emissions (tonnes CO2e)
        </label>
        <input
          id="baselineEmissions"
          type="number"
          step="0.01"
          min="0.01"
          value={baselineEmissions}
          onChange={(e) => setBaselineEmissions(e.target.value)}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            fieldErrors.baselineEmissions ? 'border-red-500' : 'border-gray-300'
          }`}
          aria-invalid={!!fieldErrors.baselineEmissions}
          aria-describedby={fieldErrors.baselineEmissions ? 'baselineEmissions-error' : undefined}
        />
        {fieldErrors.baselineEmissions && (
          <p id="baselineEmissions-error" className="mt-1 text-sm text-red-600">
            {fieldErrors.baselineEmissions}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="targetYear" className="block text-sm font-medium text-gray-700">
          Target Year
        </label>
        <input
          id="targetYear"
          type="number"
          step="1"
          value={targetYear}
          onChange={(e) => setTargetYear(e.target.value)}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            fieldErrors.targetYear ? 'border-red-500' : 'border-gray-300'
          }`}
          aria-invalid={!!fieldErrors.targetYear}
          aria-describedby={fieldErrors.targetYear ? 'targetYear-error' : undefined}
        />
        {fieldErrors.targetYear && (
          <p id="targetYear-error" className="mt-1 text-sm text-red-600">
            {fieldErrors.targetYear}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Saving...' : 'Save Settings'}
      </button>
    </form>
  );
}
