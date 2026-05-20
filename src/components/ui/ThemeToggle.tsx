'use client';

import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  function cycle() {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(next);
  }

  const icon = theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '💻';
  const label = theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'System';

  return (
    <button
      onClick={cycle}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5
                 text-xs font-medium text-ink-muted
                 transition-all duration-150 ease-in-out
                 hover:bg-forest-50 hover:border-forest-500 hover:text-forest-700 hover:-translate-y-0.5
                 active:translate-y-0 active:bg-forest-50
                 dark:hover:text-forest-500"
      aria-label={`Theme: ${label}. Click to change.`}
      title={`Theme: ${label}`}
    >
      <span className="text-sm">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
