import { Icon } from '@/components/ui/Icon';
import Link from 'next/link';

export interface HeroProps {
  signedIn: boolean;
}

export function Hero({ signedIn }: HeroProps) {
  return (
    <section className="relative flex min-h-[70vh] flex-col items-center justify-center px-6 py-24 text-center bg-gradient-to-b from-sky-50 to-forest-50">
      {/* Brand mark */}
      <div className="mb-6 text-forest-600">
        <Icon name="leaf" size={56} ariaLabel="OEF City Climate Action Tracker logo" />
      </div>

      {/* Product name */}
      <h1 className="text-display mb-4">
        OEF City Climate Action Tracker
      </h1>

      {/* Value proposition */}
      <p className="text-body text-ink-muted max-w-2xl mb-8">
        Track, visualize, and accelerate your city&apos;s climate progress with public dashboards, AI-assisted data import, and multi-tenant analytics.
      </p>

      {/* CTAs */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <a href="#cities" className="btn-primary">
          Browse cities
        </a>
        {signedIn ? (
          <Link href="/admin" className="btn-secondary">
            Open admin
          </Link>
        ) : (
          <Link href="/sign-in" className="btn-secondary">
            Sign in
          </Link>
        )}
      </div>
    </section>
  );
}
