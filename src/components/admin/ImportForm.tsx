'use client';

import { useState } from 'react';
import { importTextSchema } from '@/lib/validations/import';
import { importClimateActions } from '@/actions/imports';
import { useToast } from '@/components/ui/ToastProvider';
import type { ExtractedAction } from '@/lib/ai/schema';
import ImportReview from './ImportReview';

const MAX_CHARS = 10000;

export default function ImportForm() {
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [extractedActions, setExtractedActions] = useState<ExtractedAction[] | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setServerError(null);

    // Client-side validation
    const parsed = importTextSchema.safeParse({ text });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]?.toString();
        if (field && !errors[field]) {
          errors[field] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await importClimateActions(text);

      if (result.success) {
        setExtractedActions(result.data.actions);
        toast.success('Actions extracted successfully');
      } else {
        if (result.error.fieldErrors) {
          setFieldErrors(result.error.fieldErrors);
        } else {
          setServerError(result.error.message);
          toast.error(result.error.message);
        }
      }
    } catch {
      setServerError('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRetry() {
    setServerError(null);
    setExtractedActions(null);
  }

  function handleReviewComplete() {
    setExtractedActions(null);
    setText('');
  }

  // Show review interface if we have extracted actions
  if (extractedActions !== null) {
    return (
      <ImportReview
        actions={extractedActions}
        onBack={handleRetry}
        onComplete={handleReviewComplete}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Guidance section */}
      <div className="rounded-lg border border-border bg-surface-card p-4 text-sm">
        <p className="font-medium text-ink mb-2">Tips for better extraction:</p>
        <ul className="space-y-1 text-ink-muted list-disc list-inside">
          <li>Mention the <strong className="text-ink">sector</strong> (transport, energy, buildings, waste, or land use)</li>
          <li>Include <strong className="text-ink">annual CO2e reduction</strong> estimates in tonnes</li>
          <li>Specify <strong className="text-ink">start year</strong> or timeframe for each action</li>
          <li>Indicate <strong className="text-ink">status</strong> (planned, in progress, or completed)</li>
          <li>Give each action a clear, descriptive title or name</li>
        </ul>
        <p className="mt-2 text-xs text-ink-muted italic">
          Example: &quot;In 2025, we launched a bus electrification program replacing 50 diesel buses, reducing transport emissions by 800 tonnes CO2e per year.&quot;
        </p>
      </div>

      <div>
        <label
          htmlFor="import-text"
          className="block text-sm font-medium text-ink"
        >
          Paste free-text description of climate actions
        </label>
        <textarea
          id="import-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          maxLength={MAX_CHARS}
          placeholder="Paste text describing climate actions here. The AI will extract structured data from your text..."
          className="input mt-1 min-h-[200px] resize-y"
        />
        <div className="mt-1 flex items-center justify-between">
          <div>
            {fieldErrors.text && (
              <p className="text-sm text-red-600 dark:text-red-400">{fieldErrors.text}</p>
            )}
          </div>
          <p className="text-sm text-ink-muted">
            {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
          </p>
        </div>
      </div>

      {serverError && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <div className="flex items-start">
            <div className="flex-1">
              <p className="text-sm text-red-700 dark:text-red-400">{serverError}</p>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="ml-3 text-sm font-medium text-red-700 dark:text-red-400 underline hover:text-red-600"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || text.trim().length === 0}
          className="btn-primary"
        >
          {isSubmitting ? 'Extracting...' : 'Extract Actions'}
        </button>
      </div>
    </form>
  );
}
