'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerOrganizationOnly, type RegisterOrgOnlyInput } from '@/actions/onboarding';

/**
 * Step 1 of onboarding: register the organization (name + slug only).
 * After success, the page reloads and shows Step 2 (add city).
 */
export function RegisterOrgForm() {
  const router = useRouter();

  const [organizationName, setOrganizationName] = useState('');
  const [organizationSlug, setOrganizationSlug] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setServerError(null);

    const input: RegisterOrgOnlyInput = {
      organizationName: organizationName.trim(),
      organizationSlug: organizationSlug.trim().toLowerCase(),
    };

    if (!input.organizationName) {
      setFieldErrors({ organizationName: 'Organization name is required' });
      return;
    }
    if (!input.organizationSlug) {
      setFieldErrors({ organizationSlug: 'Slug is required' });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await registerOrganizationOnly(input);

      if (result.success) {
        // Refresh the page — layout will now detect the org exists and show Step 2
        router.refresh();
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
        <label htmlFor="orgName" className="mb-1.5 block text-sm font-medium text-ink">
          Organization Name
        </label>
        <input
          id="orgName"
          type="text"
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
          placeholder="e.g. City of Portland Climate Office"
          className={`input ${fieldErrors.organizationName ? 'border-red-500' : ''}`}
          aria-invalid={!!fieldErrors.organizationName}
        />
        {fieldErrors.organizationName && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{fieldErrors.organizationName}</p>
        )}
      </div>

      <div>
        <label htmlFor="orgSlug" className="mb-1.5 block text-sm font-medium text-ink">
          Organization Slug
        </label>
        <input
          id="orgSlug"
          type="text"
          value={organizationSlug}
          onChange={(e) => setOrganizationSlug(e.target.value)}
          placeholder="e.g. portland-climate-office"
          className={`input ${fieldErrors.organizationSlug ? 'border-red-500' : ''}`}
          aria-invalid={!!fieldErrors.organizationSlug}
        />
        <p className="mt-1 text-xs text-ink-muted">
          Lowercase letters, numbers, and hyphens only. Must be unique.
        </p>
        {fieldErrors.organizationSlug && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{fieldErrors.organizationSlug}</p>
        )}
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? 'Registering...' : 'Register Organization'}
      </button>
    </form>
  );
}
