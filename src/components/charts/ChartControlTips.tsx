'use client';

import { useState } from 'react';

export function ChartControlTips() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="mt-2 flex items-center justify-between rounded-lg bg-cyan-50 px-3 py-2
                    text-xs text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300">
      <p>
        <span className="font-medium">Chart controls:</span>{' '}
        Hover for values · Drag to zoom · Double-click to reset · Shift+drag to pan
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="ml-3 rounded p-0.5 text-cyan-600 transition-colors
                   hover:bg-cyan-100 hover:text-cyan-800
                   dark:text-cyan-400 dark:hover:bg-cyan-800/40 dark:hover:text-cyan-200"
        aria-label="Dismiss chart tips"
      >
        ✕
      </button>
    </div>
  );
}
