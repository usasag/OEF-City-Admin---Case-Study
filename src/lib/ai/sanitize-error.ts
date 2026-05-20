/**
 * Sanitizes provider errors to prevent leaking sensitive information.
 *
 * Strips API keys, internal URLs, stack traces, and provider-specific error codes
 * from any error before it reaches the user. Always returns a generic, safe message.
 */

/** Generic user-facing error message for provider failures */
export const SANITIZED_PROVIDER_ERROR =
  'Extraction failed due to a provider issue. Please try again later.';

/**
 * Patterns that indicate sensitive content in error messages.
 * Used for detection/logging purposes — the function always returns
 * the sanitized message regardless of content.
 */
export const SENSITIVE_PATTERNS = {
  /** API key patterns (OpenAI, GitHub, Anthropic, Google, generic bearer tokens) */
  apiKeys: /(?:sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{36,}|sk-ant-[a-zA-Z0-9-]{20,}|AIza[a-zA-Z0-9_-]{35}|Bearer\s+[a-zA-Z0-9._\-/+=]{20,})/,
  /** Internal URLs (http/https endpoints) */
  internalUrls: /https?:\/\/[^\s"']+/,
  /** Stack traces (common patterns across languages/runtimes) */
  stackTraces: /(?:at\s+.+\(.+:\d+:\d+\)|Error:.*\n\s+at\s|Traceback \(most recent call last\))/,
  /** Provider-specific error codes */
  providerCodes: /(?:error_code|err_code|code)["']?\s*[:=]\s*["']?[A-Z_0-9]+/i,
} as const;

/**
 * Checks whether a raw error message contains sensitive information.
 * Useful for logging/monitoring purposes.
 */
export function containsSensitiveInfo(message: string): boolean {
  return Object.values(SENSITIVE_PATTERNS).some((pattern) => pattern.test(message));
}

/**
 * Extracts the raw error message from an unknown error value.
 * Returns a string representation regardless of input type.
 */
function extractRawMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message + (error.stack ? '\n' + error.stack : '');
  }
  if (typeof error === 'string') {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

/**
 * Sanitizes any provider error into a safe, generic user-facing message.
 *
 * This function ALWAYS returns the generic sanitized message regardless of
 * the error content. It never passes through any part of the original error
 * to the user, ensuring API keys, internal URLs, stack traces, and
 * provider-specific error codes are never exposed.
 *
 * @param error - Any error value thrown by a provider
 * @returns A generic, safe error message for the user
 */
export function sanitizeProviderError(error: unknown): string {
  // We intentionally extract the raw message only for potential internal
  // logging/monitoring — it is NEVER returned to the user.
  void extractRawMessage(error);

  return SANITIZED_PROVIDER_ERROR;
}
