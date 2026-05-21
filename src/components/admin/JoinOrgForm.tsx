'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { joinExistingOrg } from '@/actions/onboarding';

/**
 * Form that allows a user to join an existing organization by entering its slug.
 */
export function JoinOrgForm() {
  const router = useRouter();

  const [orgSlug, setOrgSlug] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ orgName: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setServerError(null);
    setSuccess(null);

    const slug = orgSlug.trim().toLowerCase();
    if (!slug) {
      setFieldErrors({ orgSlug: 'Organization slug is required' });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await joinExistingOrg({ orgSlug: slug });

      if (result.success) {
        setSuccess({ orgName: result.data.orgName });
        setTimeout(() => {
          router.push('/admin');
          router.refresh();
        }, 1500);
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
        <h3 className="text-lg font-semibold text-ink">Joined {success.orgName}!</h3>
        <p className="mt-1 text-sm text-ink-muted">Redirecting to admin...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <p className="text-sm text-ink-muted">
        Enter the slug of an organization that already exists. You&apos;ll be added as a member.
      </p>

      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-800 dark:text-red-300">{serverError}</p>
        </div>
      )}

      <div>
        <label htmlFor="joinOrgSlug" className="mb-1.5 block text-sm font-medium text-ink">
          Organization Slug
        </label>
        <input
          id="joinOrgSlug"
          type="text"
          value={orgSlug}
          onChange={(e) => setOrgSlug(e.target.value)}
          placeholder="e.g. portland-climate-office"
          className={`input ${fieldErrors.orgSlug ? 'border-red-500' : ''}`}
          aria-invalid={!!fieldErrors.orgSlug}
        />
        <p className="mt-1 text-xs text-ink-muted">
          Ask your organization admin for the slug, or find it in the URL.
        </p>
        {fieldErrors.orgSlug && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{fieldErrors.orgSlug}</p>
        )}
      </div>

      <button type="submit" disabled={isSubmitting || !orgSlug.trim()} className="btn-primary w-full">
        {isSubmitting ? 'Joining...' : 'Join Organization'}
      </button>
    </form>
  );
}
