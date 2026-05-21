import OpenAI from 'openai';
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
 * Returns the configured provider name from environment.
 */
function getProviderName(): string {
  return process.env.AI_PROVIDER ?? 'unknown';
}

/**
 * Returns the configured model name from environment.
 */
function getModelName(): string {
  const model = process.env.AI_MODEL ?? 'gpt-4o';
  const provider = process.env.AI_PROVIDER ?? 'github-models';
  // GitHub Models requires publisher/model format
  if (provider === 'github-models' && !model.includes('/')) {
    return `openai/${model}`;
  }
  return model;
}

/**
 * Creates an OpenAI client configured for the active provider.
 */
function createClient(): OpenAI {
  const provider = process.env.AI_PROVIDER ?? 'github-models';

  if (provider === 'github-models') {
    const apiKey = process.env.GITHUB_TOKEN;
    if (!apiKey) {
      throw new Error('GITHUB_TOKEN environment variable is required for GitHub Models provider');
    }
    return new OpenAI({
      baseURL: 'https://models.github.ai/inference',
      apiKey,
    });
  }

  if (provider === 'openai') {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required for OpenAI provider');
    }
    return new OpenAI({ apiKey });
  }

  if (provider === 'anthropic') {
    // Anthropic uses a different SDK, but for now fall back to OpenAI-compatible
    throw new Error('Anthropic provider requires a separate implementation');
  }

  throw new Error(`Unsupported AI provider: "${provider}"`);
}

/**
 * Builds the system + user prompt for climate action extraction.
 */
function buildPrompt(input: ExtractClimateActionsInput): string {
  const cityContext = input.cityName
    ? ` The actions are for the city of ${input.cityName}.`
    : '';

  const currentYear = new Date().getFullYear();

  return `Extract structured climate action data from the following text.${cityContext}
Today's date is ${new Date().toISOString().split('T')[0]} (year ${currentYear}).

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
- startYear: ${currentYear} (current year) if not specified

Extract up to 50 actions. Only include actions that are clearly identifiable climate initiatives.

Respond ONLY with valid JSON in this exact format:
{"actions": [{"title": "...", "sector": "...", "annualReduction": 0, "status": "...", "startYear": ${currentYear}}]}

Text to extract from:
${input.text}`;
}

/**
 * Extracts structured climate action data from free-text input using the
 * configured LLM provider via the OpenAI SDK.
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
    const client = createClient();

    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a climate action data extraction assistant. You always respond with valid JSON only, no markdown, no explanation.',
        },
        {
          role: 'user',
          content: buildPrompt(input),
        },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { actions: [], provider, model, status: 'failed', error: 'No response from model' };
    }

    // Parse the JSON response
    let parsed: unknown;
    try {
      // Strip markdown code fences if present
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error('[AI Extraction] Failed to parse JSON response:', content);
      return { actions: [], provider, model, status: 'failed', error: 'Model returned invalid JSON' };
    }

    // Validate against our Zod schema
    const validated = extractionOutputSchema.safeParse(parsed);
    if (!validated.success) {
      console.error('[AI Extraction] Schema validation failed:', validated.error.issues);
      return { actions: [], provider, model, status: 'failed', error: 'Model output failed validation' };
    }

    const actions = validated.data.actions;
    if (actions.length === 0) {
      return { actions: [], provider, model, status: 'failed' };
    }

    return { actions, provider, model, status: 'success' };
  } catch (error: unknown) {
    // Log the full error to the server console for debugging
    console.error('[AI Extraction Error]', error);

    // Sanitize provider errors
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
