/**
 * AI module entry point.
 * Exports the extraction function and types.
 * 
 * The extraction uses the OpenAI SDK directly (not Vercel AI SDK)
 * configured for the provider specified in AI_PROVIDER env var.
 */

export { extractClimateActions } from './extract-climate-actions';
export type { ExtractedAction, ExtractionOutput } from './schema';
export type { ExtractionResult, ExtractClimateActionsInput } from './extract-climate-actions';

/**
 * Returns the configured provider name from environment.
 */
export function getProviderName(): string {
  return process.env.AI_PROVIDER ?? 'unknown';
}

/**
 * Returns the configured model name from environment.
 */
export function getModelName(): string {
  return process.env.AI_MODEL ?? 'unknown';
}
