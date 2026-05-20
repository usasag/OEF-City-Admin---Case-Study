import { describe, it, expect } from 'vitest';
import {
  sanitizeProviderError,
  containsSensitiveInfo,
  SANITIZED_PROVIDER_ERROR,
  SENSITIVE_PATTERNS,
} from '@/lib/ai/sanitize-error';

describe('sanitizeProviderError', () => {
  it('returns generic message for Error with API key in message', () => {
    const error = new Error(
      'Authentication failed: invalid API key sk-abc123def456ghi789jkl012mno345pqr678'
    );
    expect(sanitizeProviderError(error)).toBe(SANITIZED_PROVIDER_ERROR);
  });

  it('returns generic message for Error with internal URL', () => {
    const error = new Error(
      'Request to https://api.internal.openai.com/v1/chat/completions failed with status 500'
    );
    expect(sanitizeProviderError(error)).toBe(SANITIZED_PROVIDER_ERROR);
  });

  it('returns generic message for Error with stack trace', () => {
    const error = new Error('Something went wrong');
    error.stack = `Error: Something went wrong
    at Object.<anonymous> (/app/node_modules/openai/src/client.ts:123:15)
    at Module._compile (node:internal/modules/cjs/loader:1241:14)`;
    expect(sanitizeProviderError(error)).toBe(SANITIZED_PROVIDER_ERROR);
  });

  it('returns generic message for Error with provider-specific error code', () => {
    const error = new Error(
      'Provider returned error_code: RATE_LIMIT_EXCEEDED for request'
    );
    expect(sanitizeProviderError(error)).toBe(SANITIZED_PROVIDER_ERROR);
  });

  it('returns generic message for string errors', () => {
    const error = 'sk-ant-api03-secret-key-here Connection refused to https://internal.anthropic.com/v1';
    expect(sanitizeProviderError(error)).toBe(SANITIZED_PROVIDER_ERROR);
  });

  it('returns generic message for object errors', () => {
    const error = {
      code: 'INVALID_API_KEY',
      message: 'The API key sk-1234567890abcdef is invalid',
      url: 'https://api.openai.com/v1/chat/completions',
    };
    expect(sanitizeProviderError(error)).toBe(SANITIZED_PROVIDER_ERROR);
  });

  it('returns generic message for null/undefined errors', () => {
    expect(sanitizeProviderError(null)).toBe(SANITIZED_PROVIDER_ERROR);
    expect(sanitizeProviderError(undefined)).toBe(SANITIZED_PROVIDER_ERROR);
  });

  it('returns generic message for numeric errors', () => {
    expect(sanitizeProviderError(500)).toBe(SANITIZED_PROVIDER_ERROR);
  });

  it('returns generic message for GitHub token in error', () => {
    const error = new Error(
      'Auth failed with token ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij'
    );
    expect(sanitizeProviderError(error)).toBe(SANITIZED_PROVIDER_ERROR);
  });

  it('returns generic message for Google API key in error', () => {
    const error = new Error(
      'Invalid key: AIzaSyA1234567890abcdefghijklmnopqrstuvwx'
    );
    expect(sanitizeProviderError(error)).toBe(SANITIZED_PROVIDER_ERROR);
  });

  it('never includes any part of the original error in the returned message', () => {
    const sensitiveContent = 'super-secret-internal-data-12345';
    const error = new Error(sensitiveContent);
    const result = sanitizeProviderError(error);
    expect(result).not.toContain(sensitiveContent);
    expect(result).toBe(SANITIZED_PROVIDER_ERROR);
  });

  it('returned message does not contain URL patterns', () => {
    const result = sanitizeProviderError(new Error('any error'));
    expect(result).not.toMatch(/https?:\/\//);
  });

  it('returned message does not contain API key patterns', () => {
    const result = sanitizeProviderError(new Error('any error'));
    expect(result).not.toMatch(/sk-[a-zA-Z0-9]/);
    expect(result).not.toMatch(/ghp_[a-zA-Z0-9]/);
  });
});

describe('containsSensitiveInfo', () => {
  it('detects OpenAI API keys', () => {
    expect(
      containsSensitiveInfo('Error with key sk-abc123def456ghi789jkl012mno345pqr678')
    ).toBe(true);
  });

  it('detects GitHub tokens', () => {
    expect(
      containsSensitiveInfo('Token ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij')
    ).toBe(true);
  });

  it('detects Anthropic keys', () => {
    expect(
      containsSensitiveInfo('Key sk-ant-api03-abcdefghijklmnopqrst')
    ).toBe(true);
  });

  it('detects Google API keys', () => {
    expect(
      containsSensitiveInfo('Key AIzaSyA1234567890abcdefghijklmnopqrstuvwx')
    ).toBe(true);
  });

  it('detects internal URLs', () => {
    expect(
      containsSensitiveInfo('Failed at https://api.internal.service.com/v1/endpoint')
    ).toBe(true);
  });

  it('detects stack traces', () => {
    expect(
      containsSensitiveInfo('at Object.handler (/app/src/index.ts:42:10)')
    ).toBe(true);
  });

  it('detects provider error codes', () => {
    expect(containsSensitiveInfo('error_code: RATE_LIMIT_EXCEEDED')).toBe(true);
  });

  it('returns false for clean messages', () => {
    expect(containsSensitiveInfo('Something went wrong')).toBe(false);
    expect(containsSensitiveInfo('Network timeout')).toBe(false);
  });
});

describe('SENSITIVE_PATTERNS', () => {
  it('apiKeys pattern matches Bearer tokens', () => {
    expect(
      SENSITIVE_PATTERNS.apiKeys.test(
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0'
      )
    ).toBe(true);
  });

  it('stackTraces pattern matches Node.js stack traces', () => {
    expect(
      SENSITIVE_PATTERNS.stackTraces.test(
        'at processTicksAndRejections (node:internal/process/task_queues:95:5)'
      )
    ).toBe(true);
  });
});
