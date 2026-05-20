import { generateObject } from 'ai';
import { getLanguageModel, getProviderName, getModelName } from './index';
import { extractionOutputSchema } from './schema';
import type { ExtractedAction } from './schema';
import { sanitizeProviderError } from './sanitize-error';

export interface ExtractClimateActionsInput {
  text: string;
  cityName?: string;
}

export interface ExtractionResult {
  actions: ExtractedAction[];
  provider: string;
  model: string;
  status: 'success' | 'partial' | 'failed';
  error?: string;
}

/**
 * Extracts structured climate action data from free-text input using the
 * configured LLM provider and Vercel AI SDK structured output.
 *
 * Returns extracted actions along with provider metadata and status.
 * Errors from the provider are sanitized before being returned.
 */
export async function extractClimateActions(
  input: ExtractClimateActionsInput
): Promise<ExtractionResult> {
  const provider = getProviderName();
  const model = getModelName();

  try {
    const languageModel = getLanguageModel();

    const cityContext = input.cityName
      ? ` The actions are for the city of ${input.cityName}.`
      : '';

    const result = await generateObject({
      model: languageModel,
      schema: extractionOutputSchema,
      prompt: `You are a climate action data extraction assistant. Extract structured climate action data from the following text.${cityContext}

For each climate action identified, extract:
- title: A concise name for the action (max 200 characters)
- sector: One of "transport", "energy", "buildings", "waste", or "land_use"
- annualReduction: Estimated annual CO2e reduction in tonnes (numeric, 0 or greater)
- status: One of "planned", "in_progress", or "completed"
- startYear: The year the action starts or started (between 2000 and 2100)

If a value cannot be determined from the text, use reasonable defaults:
- sector: choose the most relevant category
- annualReduction: estimate based on context, or use 0 if unknown
- status: "planned" if unclear
- startYear: current year if not specified

Extract up to 50 actions. Only include actions that are clearly identifiable climate initiatives.

Text to extract from:
${input.text}`,
    });

    const actions = result.object.actions;

    if (actions.length === 0) {
      return { actions: [], provider, model, status: 'failed' };
    }

    return { actions, provider, model, status: 'success' };
  } catch (error: unknown) {
    // Sanitize provider errors — never expose API keys, internal URLs,
    // stack traces, or provider-specific error codes to the user.
    const sanitizedMessage = sanitizeProviderError(error);

    return {
      actions: [],
      provider,
      model,
      status: 'failed',
      error: sanitizedMessage,
    };
  }
}
