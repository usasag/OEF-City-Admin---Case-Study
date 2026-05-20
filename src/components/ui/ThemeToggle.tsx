'use client';

import { useTheme } from './ThemeProvider';
import { Icon } from './Icon';

export function ThemeToggle() {
  const { resolvedTheme, setTheme, theme } = useTheme();

  function toggle() {
    // Simple toggle: if currently light → dark, if dark → light.
    // If system, switch to the opposite of what's resolved.
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }

  function handleLongPress() {
    // Long-press or right-click resets to system
    setTheme('system');
  }

  const isDark = resolvedTheme === 'dark';
  const label = theme === 'system'
    ? 'Theme: System. Click to switch.'
    : `Theme: ${isDark ? 'Dark' : 'Light'}. Click to switch.`;

  return (
    <button
      onClick={toggle}
      onContextMenu={(e) => {
        e.preventDefault();
        handleLongPress();
      }}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg
                 text-ink-muted transition-colors duration-150
                 hover:bg-forest-50 hover:text-forest-700
                 dark:hover:bg-forest-50 dark:hover:text-forest-500"
      aria-label={label}
      title={label}
    >
      {/* Sun icon — visible in dark mode (click to go light) */}
      <span className={`absolute transition-all duration-200 ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'}`}>
        <Icon name="sun" size={18} />
      </span>
      {/* Moon icon — visible in light mode (click to go dark) */}
      <span className={`absolute transition-all duration-200 ${isDark ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'}`}>
        <Icon name="moon" size={18} />
      </span>
    </button>
  );
}
