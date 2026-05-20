import type { LanguageModel } from 'ai';
import { createGitHubModelsProvider } from './providers/github-models';
import { createOpenAIProvider } from './providers/openai';
import { createAnthropicProvider } from './providers/anthropic';

export type SupportedProvider = 'github-models' | 'openai' | 'anthropic';

const SUPPORTED_PROVIDERS: Record<
  SupportedProvider,
  (model: string) => LanguageModel
> = {
  'github-models': createGitHubModelsProvider,
  openai: createOpenAIProvider,
  anthropic: createAnthropicProvider,
};

/**
 * Reads AI_PROVIDER and AI_MODEL from environment variables and returns
 * the configured language model instance.
 *
 * Throws if either env var is missing or the provider is unsupported.
 */
export function getLanguageModel(): LanguageModel {
  const provider = process.env.AI_PROVIDER;
  const model = process.env.AI_MODEL;

  if (!provider) {
    throw new Error(
      'AI_PROVIDER environment variable is required. ' +
        `Supported providers: ${Object.keys(SUPPORTED_PROVIDERS).join(', ')}`
    );
  }

  if (!model) {
    throw new Error(
      'AI_MODEL environment variable is required. ' +
        'Set it to the model identifier for your chosen provider.'
    );
  }

  const factory = SUPPORTED_PROVIDERS[provider as SupportedProvider];
  if (!factory) {
    throw new Error(
      `Unsupported AI provider: "${provider}". ` +
        `Supported providers: ${Object.keys(SUPPORTED_PROVIDERS).join(', ')}`
    );
  }

  return factory(model);
}

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

export { extractClimateActions } from './extract-climate-actions';
export type { ExtractedAction, ExtractionOutput } from './schema';
