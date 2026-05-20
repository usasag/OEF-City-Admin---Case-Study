'use client';

import { OrganizationSwitcher, UserButton } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useTheme } from '@/components/ui/ThemeProvider';

export function AdminShellClerkControls() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const clerkAppearance = {
    baseTheme: isDark ? dark : undefined,
    elements: {
      rootBox: 'flex items-center',
      organizationSwitcherTrigger:
        'rounded-lg border border-border px-3 py-1.5 text-sm hover:border-forest-500 transition-all duration-150',
      userButtonTrigger:
        'rounded-full ring-2 ring-transparent hover:ring-forest-500 transition-all duration-150',
      userButtonPopoverCard: 'border border-border shadow-lg',
      organizationSwitcherPopoverCard: 'border border-border shadow-lg',
    },
    variables: {
      colorPrimary: isDark ? '#22c55e' : '#16a34a',
      colorText: isDark ? '#f0fdf4' : '#0f1f17',
      colorTextSecondary: isDark ? '#a7c5b3' : '#475c54',
      colorBackground: isDark ? '#11201a' : '#ffffff',
      borderRadius: '0.5rem',
    },
  };

  return (
    <>
      <OrganizationSwitcher
        hidePersonal
        afterSelectOrganizationUrl="/admin"
        appearance={clerkAppearance}
      />
      <UserButton
        afterSignOutUrl="/"
        appearance={clerkAppearance}
      />
    </>
  );
}
