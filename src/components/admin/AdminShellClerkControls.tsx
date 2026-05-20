'use client';

import { OrganizationSwitcher, UserButton } from '@clerk/nextjs';

const clerkAppearance = {
  elements: {
    rootBox: 'flex items-center',
    organizationSwitcherTrigger:
      'rounded-lg border border-border px-3 py-1.5 text-sm text-ink hover:bg-forest-50 hover:border-forest-500 transition-all duration-150',
    userButtonTrigger:
      'rounded-full ring-2 ring-transparent hover:ring-forest-500 transition-all duration-150',
    userButtonPopoverCard: 'border border-border shadow-lg',
    organizationSwitcherPopoverCard: 'border border-border shadow-lg',
  },
  variables: {
    colorPrimary: '#16a34a', // forest-600
    colorText: '#0f1f17',   // ink
    colorBackground: '#ffffff', // surface
    borderRadius: '0.5rem',
  },
};

export function AdminShellClerkControls() {
  return (
    <>
      <OrganizationSwitcher
        hidePersonal
        afterSelectOrganizationUrl="/admin"
        appearance={clerkAppearance}
      />
      <UserButton
        appearance={clerkAppearance}
      />
    </>
  );
}
