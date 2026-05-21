import { requireAuth } from '@/lib/auth/permissions';
import { getSession } from '@/lib/auth/session';
import { supabase } from '@/lib/db/supabase';
import { Icon } from '@/components/ui/Icon';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import Link from 'next/link';
import { OrgOnboardingTabs } from '@/components/admin/OrgOnboardingTabs';
import { OnboardingTabsClient } from '@/components/admin/OnboardingTabsClient';

export default async function OnboardingPage() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="card max-w-md text-center p-8">
          <h1 className="text-2xl font-bold text-danger">Access Denied</h1>
          <p className="mt-3 text-ink-muted">
            You must be signed in to access onboarding.
          </p>
          <Link href="/sign-in" className="mt-4 inline-block text-sm font-medium text-sky-400 hover:underline">
            ← Sign in
          </Link>
        </div>
      </div>
    );
  }

  // Try to get auth context (may fail if no org membership yet)
  let authCtx;
  try {
    authCtx = await requireAuth();
  } catch {
    // No org membership yet — this is the expected state for new users
    // Show the org registration form
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
        <div className="fixed top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-lg">
          <div className="mb-8 flex flex-col items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-forest-50 dark:bg-forest-700/20">
              <Icon name="leaf" size={28} className="text-forest-600 dark:text-forest-500" />
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-ink-muted">
              <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold bg-forest-600 text-white">1</span>
              <span className="font-medium text-ink">Register Org</span>
              <span className="text-border">→</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold bg-forest-50 text-forest-600/50 dark:bg-forest-700/20">2</span>
              <span className="text-ink-muted">Add City</span>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-ink">Register Your Organization</h1>
            <p className="mt-2 text-center text-sm text-ink-muted">
              Create a new organization or join an existing one.
            </p>
          </div>
          <OrgOnboardingTabs />
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-ink-muted hover:text-ink transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = authCtx.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
        <div className="card max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-forest-50 dark:bg-forest-700/20">
            <Icon name="alert" size={24} className="text-forest-600 dark:text-forest-500" />
          </div>
          <h2 className="text-lg font-semibold text-ink">Contact Your Admin</h2>
          <p className="mt-3 text-sm text-ink-muted">
            Only organization admins can complete the setup process.
          </p>
          <Link href="/" className="mt-6 inline-block rounded-lg bg-forest-600 px-4 py-2 text-sm font-medium text-white hover:bg-forest-700 transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  // Determine which step: does the org already exist in our DB?
  const { data: organization } = await supabase
    .from('organizations')
    .select('id, name, slug')
    .eq('id', authCtx.organizationId)
    .single();

  const step = organization ? 'city' : 'org';

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      {/* Theme toggle */}
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg">
        {/* Brand mark */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-forest-50 dark:bg-forest-700/20">
            <Icon name="leaf" size={28} className="text-forest-600 dark:text-forest-500" />
          </div>

          {/* Step indicator */}
          <div className="mt-4 flex items-center gap-2 text-xs text-ink-muted">
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${step === 'org' ? 'bg-forest-600 text-white' : 'bg-forest-50 text-forest-600 dark:bg-forest-700/20'}`}>
              1
            </span>
            <span className={step === 'org' ? 'font-medium text-ink' : 'text-ink-muted'}>Register Org</span>
            <span className="text-border">→</span>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${step === 'city' ? 'bg-forest-600 text-white' : 'bg-forest-50 text-forest-600/50 dark:bg-forest-700/20'}`}>
              2
            </span>
            <span className={step === 'city' ? 'font-medium text-ink' : 'text-ink-muted'}>Add City</span>
          </div>

          <h1 className="mt-4 text-2xl font-bold text-ink">
            {step === 'org' ? 'Register Your Organization' : 'Add Your First City'}
          </h1>
          <p className="mt-2 text-center text-sm text-ink-muted">
            {step === 'org'
              ? 'Set up your organization in the Climate Action Tracker.'
              : 'Create a new city or join an existing one to start tracking climate actions.'}
          </p>
        </div>

        {step === 'org' ? (
          <div className="card p-6">
            <RegisterOrgForm />
          </div>
        ) : (
          <OnboardingTabsClient />
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-ink-muted hover:text-ink transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
