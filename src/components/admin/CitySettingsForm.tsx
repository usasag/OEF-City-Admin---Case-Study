'use client';

import { useState } from 'react';
import { citySchema, type CityFormData } from '@/lib/validations/city';
import { updateCitySettings } from '@/actions/city';
import { useToast } from '@/components/ui/ToastProvider';

interface CitySettingsFormProps {
  initialData: CityFormData;
  readOnly?: boolean;
}

export function CitySettingsForm({ initialData, readOnly = false }: CitySettingsFormProps) {
  const { toast } = useToast();
  const [name, setName] = useState(initialData.name);
  const [baselineEmissions, setBaselineEmissions] = useState(
    String(initialData.baselineEmissions)
  );
  const [targetYear, setTargetYear] = useState(String(initialData.targetYear));

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setServerError(null);

    const formData = {
      name: name.trim(),
      baselineEmissions: parseFloat(baselineEmissions),
      targetYear: parseInt(targetYear, 10),
    };

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

    setIsSubmitting(true);
    try {
      const response = await updateCitySettings(result.data);

      if (response.success) {
        toast.success('City settings saved');
      } else {
        if (response.error.fieldErrors) {
          setFieldErrors(response.error.fieldErrors);
        } else {
          setServerError(response.error.message);
          toast.error(response.error.message);
        }
      }
    } catch {
      setServerError('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred. Please try again.');
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

      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink">
          City Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={readOnly}
          className={`input ${fieldErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''} ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
          aria-invalid={!!fieldErrors.name}
          aria-describedby={fieldErrors.name ? 'name-error' : undefined}
        />
        {fieldErrors.name && (
          <p id="name-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400">
            {fieldErrors.name}
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
          disabled={readOnly}
          className={`input ${fieldErrors.baselineEmissions ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''} ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
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
          disabled={readOnly}
          className={`input ${fieldErrors.targetYear ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''} ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
          aria-invalid={!!fieldErrors.targetYear}
          aria-describedby={fieldErrors.targetYear ? 'targetYear-error' : undefined}
        />
        {fieldErrors.targetYear && (
          <p id="targetYear-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400">
            {fieldErrors.targetYear}
          </p>
        )}
      </div>

      {!readOnly && (
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Saving...' : 'Save Settings'}
        </button>
      )}
    </form>
  );
}
