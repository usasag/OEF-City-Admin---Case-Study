import { Icon } from '@/components/ui/Icon';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AdminNav } from './AdminNav';
import { AdminShellClerkControls } from './AdminShellClerkControls';
import { CitySwitcher } from './CitySwitcher';

interface AdminShellProps {
  children: React.ReactNode;
  cities?: { slug: string; name: string }[];
  activeCitySlug?: string | null;
}

export function AdminShell({ children, cities, activeCitySlug }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-surface-alt">
      {/* Top navigation bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Left: Brand mark */}
          <div className="flex items-center gap-2">
            <Icon name="leaf" size={28} className="text-forest-600" />
            <span className="text-lg font-bold text-ink">OEF Tracker</span>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-3">
            {cities && (
              <CitySwitcher cities={cities} activeCitySlug={activeCitySlug ?? null} />
            )}
            <AdminShellClerkControls />
            <div className="border-l border-border pl-3">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Admin navigation */}
      <AdminNav />

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
