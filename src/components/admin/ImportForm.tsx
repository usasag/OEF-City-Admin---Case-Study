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
      <div>
        <label
          htmlFor="import-text"
          className="block text-sm font-medium text-gray-700"
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
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <div className="mt-1 flex items-center justify-between">
          <div>
            {fieldErrors.text && (
              <p className="text-sm text-red-600">{fieldErrors.text}</p>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
          </p>
        </div>
      </div>

      {serverError && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex items-start">
            <div className="flex-1">
              <p className="text-sm text-red-700">{serverError}</p>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="ml-3 text-sm font-medium text-red-700 underline hover:text-red-600"
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
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Extracting...' : 'Extract Actions'}
        </button>
      </div>
    </form>
  );
}
