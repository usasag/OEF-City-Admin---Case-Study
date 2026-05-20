'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { climateActionSchema } from '@/lib/validations/climate-action';
import { createClimateAction, updateClimateAction } from '@/actions/climate-actions';
import { useToast } from '@/components/ui/ToastProvider';
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
  const { toast } = useToast();
  const isEditing = !!action;

  const [title, setTitle] = useState(action?.title ?? '');
  const [sector, setSector] = useState<string>(action?.sector ?? '');
  const [annualReduction, setAnnualReduction] = useState(action?.annualReduction?.toString() ?? '');
  const [status, setStatus] = useState<string>(action?.status ?? '');
  const [startYear, setStartYear] = useState(action?.startYear?.toString() ?? '');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setServerError(null);

    const formData = {
      title: title.trim(),
      sector,
      annualReduction: annualReduction === '' ? NaN : Number(annualReduction),
      status,
      startYear: startYear === '' ? NaN : Number(startYear),
    };

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
        toast.success(isEditing ? 'Climate action updated' : 'Climate action created');
        router.refresh();
        setTimeout(() => onClose(), 800);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="card w-full max-w-lg">
        <h2 className="text-lg font-semibold text-ink">
          {isEditing ? 'Edit Climate Action' : 'Create Climate Action'}
        </h2>

        {serverError && (
          <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700
                          dark:bg-red-900/20 dark:text-red-300">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-ink">Title</label>
            <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className={`input ${fieldErrors.title ? 'border-red-500' : ''}`} maxLength={200} />
            {fieldErrors.title && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.title}</p>}
          </div>

          <div>
            <label htmlFor="sector" className="mb-1.5 block text-sm font-medium text-ink">Sector</label>
            <select id="sector" value={sector} onChange={(e) => setSector(e.target.value)}
              className={`select ${fieldErrors.sector ? 'border-red-500' : ''}`}>
              <option value="">Select a sector</option>
              {SECTORS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            {fieldErrors.sector && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.sector}</p>}
          </div>

          <div>
            <label htmlFor="annualReduction" className="mb-1.5 block text-sm font-medium text-ink">Annual Reduction (tonnes CO2e)</label>
            <input id="annualReduction" type="number" step="0.01" min="0" value={annualReduction}
              onChange={(e) => setAnnualReduction(e.target.value)}
              className={`input ${fieldErrors.annualReduction ? 'border-red-500' : ''}`} />
            {fieldErrors.annualReduction && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.annualReduction}</p>}
          </div>

          <div>
            <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-ink">Status</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}
              className={`select ${fieldErrors.status ? 'border-red-500' : ''}`}>
              <option value="">Select a status</option>
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            {fieldErrors.status && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.status}</p>}
          </div>

          <div>
            <label htmlFor="startYear" className="mb-1.5 block text-sm font-medium text-ink">Start Year</label>
            <input id="startYear" type="number" min="2000" max="2100" value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              className={`input ${fieldErrors.startYear ? 'border-red-500' : ''}`} />
            {fieldErrors.startYear && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.startYear}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Action' : 'Create Action'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
