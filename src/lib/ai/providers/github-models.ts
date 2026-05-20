import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModel } from 'ai';

/**
 * GitHub Models adapter.
 * Uses the OpenAI-compatible SDK with GitHub's inference endpoint.
 */
export function createGitHubModelsProvider(model: string): LanguageModel {
  const apiKey = process.env.GITHUB_TOKEN;
  if (!apiKey) {
    throw new Error(
      'GITHUB_TOKEN environment variable is required for GitHub Models provider'
    );
  }

  const github = createOpenAI({
    baseURL: 'https://models.inference.ai.azure.com',
    apiKey,
  });

  return github(model);
}
