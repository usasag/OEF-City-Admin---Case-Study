'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/auth/supabase-auth';
import { Icon } from '@/components/ui/Icon';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Client-side validation
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { error, data } = await supabase.auth.signUp({ email, password });

    if (error) {
      setErrors({ general: error.message });
      setLoading(false);
      return;
    }

    // If email confirmation is required, show success message
    if (data.user && !data.session) {
      setSuccess(true);
      setLoading(false);
      return;
    }

    // If auto-confirmed (e.g. in dev), redirect to admin
    router.push('/admin');
    router.refresh();
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-4">
        <div className="fixed top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md">
          <div className="card p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-forest-50 dark:bg-forest-700/20">
              <Icon name="leaf" size={28} className="text-forest-600 dark:text-forest-500" />
            </div>
            <h1 className="text-2xl font-bold text-ink">Check your email</h1>
            <p className="mt-3 text-sm text-ink-muted">
              We&apos;ve sent a confirmation link to <strong className="text-ink">{email}</strong>.
              Click the link to activate your account.
            </p>
            <Link
              href="/sign-in"
              className="mt-6 inline-block text-sm font-medium text-forest-600 hover:text-forest-700 dark:text-forest-500 dark:hover:text-forest-400"
            >
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      {/* Theme toggle */}
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-forest-50 dark:bg-forest-700/20">
            <Icon name="leaf" size={28} className="text-forest-600 dark:text-forest-500" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-ink">Create your account</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Sign up to start tracking climate actions
          </p>
        </div>

        <div className="card p-6">
          {errors.general && (
            <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full"
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input w-full"
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input w-full"
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Already have an account?{' '}
          <Link href="/sign-in" className="font-medium text-forest-600 hover:text-forest-700 dark:text-forest-500 dark:hover:text-forest-400">
            Sign in
          </Link>
        </p>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-ink-muted hover:text-ink transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
