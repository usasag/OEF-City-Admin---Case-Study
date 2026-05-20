import { AdminNavLink } from './AdminNavLink';

const navLinks = [
  { href: '/admin', label: 'Home' },
  { href: '/admin/settings', label: 'Settings' },
  { href: '/admin/actions', label: 'Actions' },
  { href: '/admin/import', label: 'Import' },
  { href: '/admin/imports', label: 'Imports' },
  { href: '/admin/analytics', label: 'Analytics' },
];

export function AdminNav() {
  return (
    <nav
      className="border-b border-border bg-surface"
      aria-label="Admin navigation"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
        {navLinks.map((link) => (
          <AdminNavLink key={link.href} href={link.href}>
            {link.label}
          </AdminNavLink>
        ))}
      </div>
    </nav>
  );
}
