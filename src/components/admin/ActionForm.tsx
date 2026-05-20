'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { climateActionSchema } from '@/lib/validations/climate-action';
import { createClimateAction, updateClimateAction } from '@/actions/climate-actions';
import type { ClimateAction, Sector, ActionStatus } from '@/types';

interface ActionFormProps {
  action?: ClimateAction;
  onClose: () => void;
}

const SECTORS: { value: Sector; label: string }[] = [
  { value: 'transport', label: 'Transport' },
  { value: 'energy', label: 'Energy' },
  { value: 'buildings', label: 'Buildings' },
  { value: 'waste', label: 'Waste' },
  { value: 'land_use', label: 'Land Use' },
];

const STATUSES: { value: ActionStatus; label: string }[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export default function ActionForm({ action, onClose }: ActionFormProps) {
  const router = useRouter();
  const isEditing = !!action;

  const [title, setTitle] = useState(action?.title ?? '');
  const [sector, setSector] = useState<string>(action?.sector ?? '');
  const [annualReduction, setAnnualReduction] = useState(
    action?.annualReduction?.toString() ?? ''
  );
  const [status, setStatus] = useState<string>(action?.status ?? '');
  const [startYear, setStartYear] = useState(
    action?.startYear?.toString() ?? ''
  );

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setServerError(null);
    setSuccessMessage(null);

    // Build form data object
    const formData = {
      title: title.trim(),
      sector,
      annualReduction: annualReduction === '' ? NaN : Number(annualReduction),
      status,
      startYear: startYear === '' ? NaN : Number(startYear),
    };

    // Client-side Zod validation
    const parsed = climateActionSchema.safeParse(formData);
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
      const result = isEditing
        ? await updateClimateAction(action.id, parsed.data)
        : await createClimateAction(parsed.data);

      if (result.success) {
        setSuccessMessage(
          isEditing
            ? 'Climate action updated successfully.'
            : 'Climate action created successfully.'
        );
        router.refresh();
        // Close form after brief delay so user sees success message
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        if (result.error.fieldErrors) {
          setFieldErrors(result.error.fieldErrors);
        } else {
          setServerError(result.error.message);
        }
      }
    } catch {
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">
          {isEditing ? 'Edit Climate Action' : 'Create Climate Action'}
        </h2>

        {successMessage && (
          <div className="mt-3 rounded-md bg-green-50 p-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        {serverError && (
          <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              maxLength={200}
            />
            {fieldErrors.title && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.title}</p>
            )}
          </div>

          {/* Sector */}
          <div>
            <label
              htmlFor="sector"
              className="block text-sm font-medium text-gray-700"
            >
              Sector
            </label>
            <select
              id="sector"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select a sector</option>
              {SECTORS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            {fieldErrors.sector && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.sector}</p>
            )}
          </div>

          {/* Annual Reduction */}
          <div>
            <label
              htmlFor="annualReduction"
              className="block text-sm font-medium text-gray-700"
            >
              Annual Reduction (tonnes CO2e)
            </label>
            <input
              id="annualReduction"
              type="number"
              step="0.01"
              min="0"
              value={annualReduction}
              onChange={(e) => setAnnualReduction(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {fieldErrors.annualReduction && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.annualReduction}
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700"
            >
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select a status</option>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            {fieldErrors.status && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.status}</p>
            )}
          </div>

          {/* Start Year */}
          <div>
            <label
              htmlFor="startYear"
              className="block text-sm font-medium text-gray-700"
            >
              Start Year
            </label>
            <input
              id="startYear"
              type="number"
              min="2000"
              max="2100"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {fieldErrors.startYear && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.startYear}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting
                ? 'Saving...'
                : isEditing
                  ? 'Update Action'
                  : 'Create Action'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
