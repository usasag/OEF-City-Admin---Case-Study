'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type JoinCityInput } from '@/lib/validations/onboarding';
import { joinExistingCity } from '@/actions/onboarding';

/**
 * Form that allows an org admin to join an existing city by entering its slug.
 * The city must already exist in the system (created by another org).
 */
export function JoinCityForm() {
  const router = useRouter();

  const [citySlug, setCitySlug] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ cityName: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setServerError(null);
    setSuccess(null);

    const input: JoinCityInput = { citySlug: citySlug.trim().toLowerCase() };

    setIsSubmitting(true);
    try {
      const result = await joinExistingCity(input);

      if (result.success) {
        setSuccess({ cityName: result.data.cityName });
        // Redirect to admin after a brief success message
        setTimeout(() => router.push('/admin'), 1500);
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

  if (success) {
    return (
      <div className="text-center py-6">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-ink">Joined {success.cityName}!</h3>
        <p className="mt-1 text-sm text-ink-muted">Redirecting to admin...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <p className="text-sm text-ink-muted">
        Enter the slug of a city that already exists in the Climate Action Tracker.
        Your organization will gain access to view and manage its climate data.
      </p>

      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-800 dark:text-red-300">{serverError}</p>
        </div>
      )}

      <div>
        <label htmlFor="joinCitySlug" className="mb-1.5 block text-sm font-medium text-ink">
          City Slug
        </label>
        <input
          id="joinCitySlug"
          type="text"
          value={citySlug}
          onChange={(e) => setCitySlug(e.target.value)}
          placeholder="e.g. portland or greenville"
          className={`input ${fieldErrors.citySlug ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
          aria-invalid={!!fieldErrors.citySlug}
          aria-describedby={fieldErrors.citySlug ? 'joinCitySlug-error' : 'joinCitySlug-hint'}
        />
        <p id="joinCitySlug-hint" className="mt-1 text-xs text-ink-muted">
          The city slug is the URL-friendly identifier (e.g. &quot;greenville&quot; from /cities/greenville)
        </p>
        {fieldErrors.citySlug && (
          <p id="joinCitySlug-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400">
            {fieldErrors.citySlug}
          </p>
        )}
      </div>

      <button type="submit" disabled={isSubmitting || !citySlug.trim()} className="btn-primary w-full">
        {isSubmitting ? 'Joining...' : 'Join City'}
      </button>
    </form>
  );
}
