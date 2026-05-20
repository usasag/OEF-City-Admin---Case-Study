import { createAnthropic } from '@ai-sdk/anthropic';
import type { LanguageModel } from 'ai';

/**
 * Anthropic adapter.
 * Uses the Anthropic SDK with ANTHROPIC_API_KEY.
 */
export function createAnthropicProvider(model: string): LanguageModel {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY environment variable is required for Anthropic provider'
    );
  }

  const anthropic = createAnthropic({ apiKey });

  return anthropic(model);
}
