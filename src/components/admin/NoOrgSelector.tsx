'use client';

import { OrganizationSwitcher, CreateOrganization } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/components/ui/ThemeProvider';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import Link from 'next/link';

/**
 * Shown when a user is signed in but has no active Clerk organization.
 * Provides UI to either select an existing org or create a new one.
 */
export function NoOrgSelector() {
  const [showCreate, setShowCreate] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Clerk appearance that adapts to the current theme
  const clerkAppearance = {
    baseTheme: isDark ? dark : undefined,
    elements: {
      rootBox: 'w-full',
      organizationSwitcherTrigger:
        'w-full rounded-lg border border-border px-4 py-3 text-sm hover:border-forest-500 transition-all duration-150',
    },
    variables: {
      colorPrimary: isDark ? '#22c55e' : '#16a34a',
      colorText: isDark ? '#f0fdf4' : '#0f1f17',
      colorTextSecondary: isDark ? '#a7c5b3' : '#475c54',
      colorBackground: isDark ? '#11201a' : '#ffffff',
      colorInputBackground: isDark ? '#0b1410' : '#ffffff',
      colorInputText: isDark ? '#f0fdf4' : '#0f1f17',
    },
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      {/* Theme toggle in top-right corner */}
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Brand mark */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-forest-50 dark:bg-forest-700/20">
            <Icon name="leaf" size={28} className="text-forest-600 dark:text-forest-500" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-ink">
            Select an Organization
          </h1>
          <p className="mt-2 text-center text-sm text-ink-muted">
            To access the admin workspace, you need to be part of an organization.
            Select an existing one or create a new one below.
          </p>
        </div>

        <div className="card p-6 space-y-6">
          {/* Organization Switcher — lets user pick from orgs they belong to */}
          <div>
            <h2 className="text-sm font-medium text-ink mb-3">Your Organizations</h2>
            <OrganizationSwitcher
              hidePersonal
              afterSelectOrganizationUrl="/admin"
              afterCreateOrganizationUrl="/admin"
              appearance={clerkAppearance}
            />
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface-card px-2 text-ink-muted">or</span>
            </div>
          </div>

          {/* Create new organization */}
          {showCreate ? (
            <div>
              <CreateOrganization
                afterCreateOrganizationUrl="/admin"
                appearance={clerkAppearance}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="btn-primary w-full"
            >
              Create a New Organization
            </button>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-ink-muted hover:text-ink transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
