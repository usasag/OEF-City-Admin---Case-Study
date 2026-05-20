import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModel } from 'ai';

/**
 * OpenAI adapter.
 * Uses the standard OpenAI SDK with OPENAI_API_KEY.
 */
export function createOpenAIProvider(model: string): LanguageModel {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY environment variable is required for OpenAI provider'
    );
  }

  const openai = createOpenAI({ apiKey });

  return openai(model);
}
