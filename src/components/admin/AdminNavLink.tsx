'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminNavLinkProps {
  href: string;
  children: React.ReactNode;
}

export function AdminNavLink({ href, children }: AdminNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href + '/'));

  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150
        ${isActive
          ? 'bg-forest-50 text-forest-700 dark:bg-forest-50 dark:text-forest-500'
          : 'text-ink-muted hover:bg-forest-50 hover:text-forest-700 active:bg-forest-50 dark:hover:bg-forest-50 dark:hover:text-forest-500'
        }`}
    >
      {children}
    </Link>
  );
}
