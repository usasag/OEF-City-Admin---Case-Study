'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/auth/supabase-auth';

export function AdminShellUserControls() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null);
    });
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      {email && (
        <span className="hidden sm:inline text-sm text-ink-muted truncate max-w-[180px]">
          {email}
        </span>
      )}
      <button
        onClick={handleSignOut}
        disabled={signingOut}
        className="text-sm font-medium text-ink-muted hover:text-ink transition-colors disabled:opacity-50"
      >
        {signingOut ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  );
}
