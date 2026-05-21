'use client';

import { useState } from 'react';
import type { ImportAttempt } from '@/types';
import ImportsHistoryTable from './ImportsHistoryTable';
import { Icon } from '@/components/ui/Icon';

interface ImportHistorySectionProps {
  attempts: ImportAttempt[];
}

/**
 * Collapsible "Import History" section shown on the Import page.
 * Shows a button that expands to reveal the history table.
 */
export function ImportHistorySection({ attempts }: ImportHistorySectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-t border-border pt-6">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
      >
        <Icon name="history" size={16} />
        <span>Import History</span>
        <span className="text-xs bg-forest-50 dark:bg-forest-50/10 text-forest-700 dark:text-forest-500 rounded-full px-2 py-0.5">
          {attempts.length}
        </span>
        <svg
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-4">
          {attempts.length === 0 ? (
            <p className="text-sm text-ink-muted py-4">
              No import history yet. Extracted actions will appear here after you import them.
            </p>
          ) : (
            <div className="card p-4">
              <ImportsHistoryTable attempts={attempts} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
