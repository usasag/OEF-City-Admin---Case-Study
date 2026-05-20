import { describe, it, expect } from 'vitest';
import { sanitizeToastMessage } from '@/components/ui/ToastProvider';

const GENERIC = 'Something went wrong. Please try again.';

describe('sanitizeToastMessage', () => {
  it('passes through a normal success message', () => {
    expect(sanitizeToastMessage('City settings saved.')).toBe('City settings saved.');
  });

  it('passes through a short error message', () => {
    expect(sanitizeToastMessage('Permission denied.')).toBe('Permission denied.');
  });

  it('rejects OpenAI API key patterns (sk-...)', () => {
    const msg = 'Error: sk-abcdefghijklmnopqrstuvwxyz12345';
    expect(sanitizeToastMessage(msg)).toBe(GENERIC);
  });

  it('rejects Bearer token patterns', () => {
    const msg = 'Auth failed: Bearer eyJhbGciOiJIUzI1NiJ9.payload.sig';
    expect(sanitizeToastMessage(msg)).toBe(GENERIC);
  });

  it('rejects GitHub PAT patterns (ghp_...)', () => {
    const msg = 'ghp_abcdefghijklmnopqrstuvwxyz1234567890 leaked';
    expect(sanitizeToastMessage(msg)).toBe(GENERIC);
  });

  it('rejects generic long tokens (32+ alphanumeric/underscore/dash)', () => {
    const token = 'a'.repeat(32);
    expect(sanitizeToastMessage(`Token: ${token}`)).toBe(GENERIC);
  });

  it('allows messages with shorter alphanumeric sequences (< 32 chars)', () => {
    const msg = 'Record abc123def456 updated successfully';
    expect(sanitizeToastMessage(msg)).toBe(msg);
  });

  it('rejects URLs (http/https)', () => {
    const msg = 'Failed to reach https://internal-api.example.com/v1/data';
    expect(sanitizeToastMessage(msg)).toBe(GENERIC);
  });

  it('rejects stack trace patterns', () => {
    const msg = 'at processTicksAndRejections (node:internal/process/task_queues:95:5)';
    expect(sanitizeToastMessage(msg)).toBe(GENERIC);
  });

  it('rejects Error stack headers', () => {
    const msg = 'TypeError: Cannot read property\nError:\n  at Object.<anonymous>';
    expect(sanitizeToastMessage(msg)).toBe(GENERIC);
  });

  it('returns generic message for empty string', () => {
    expect(sanitizeToastMessage('')).toBe(GENERIC);
  });

  it('returns generic message for null/undefined coerced', () => {
    expect(sanitizeToastMessage(null as unknown as string)).toBe(GENERIC);
    expect(sanitizeToastMessage(undefined as unknown as string)).toBe(GENERIC);
  });
});
