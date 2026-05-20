import { requireAuth } from '@/lib/auth/permissions';
import { OnboardingWizard } from '@/components/admin/OnboardingWizard';
import { Icon } from '@/components/ui/Icon';
import Link from 'next/link';

export default async function OnboardingPage() {
  let authCtx;
  try {
    authCtx = await requireAuth();
  } catch {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="card max-w-md text-center p-8">
          <h1 className="text-2xl font-bold text-danger">Access Denied</h1>
          <p className="mt-3 text-ink-muted">
            You must be signed in with an active organization to access onboarding.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm font-medium text-sky-400 hover:underline"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  const isAdmin = authCtx.role === 'admin';

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Brand mark */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-forest-50 dark:bg-forest-700/20">
            <Icon name="leaf" size={28} className="text-forest-600 dark:text-forest-500" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-ink">
            {isAdmin ? 'Set Up Your Organization' : 'Organization Setup Required'}
          </h1>
          <p className="mt-2 text-center text-sm text-ink-muted">
            {isAdmin
              ? 'Register your organization and create your first city to get started with the Climate Action Tracker.'
              : 'Your organization has not been registered yet.'}
          </p>
        </div>

        {isAdmin ? (
          <div className="card p-6">
            <OnboardingWizard />
          </div>
        ) : (
          <div className="card p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-forest-50 dark:bg-forest-700/20">
              <Icon name="alert" size={24} className="text-forest-600 dark:text-forest-500" />
            </div>
            <h2 className="text-lg font-semibold text-ink">Contact Your Admin</h2>
            <p className="mt-3 text-sm text-ink-muted">
              Only organization admins can complete the onboarding process. Please contact your
              organization admin to register your organization in the Climate Action Tracker.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-lg bg-forest-600 px-4 py-2 text-sm font-medium text-white hover:bg-forest-700 transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
