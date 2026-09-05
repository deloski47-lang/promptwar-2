import "server-only";
import type { ZodSchema } from "zod";

/**
 * The single point of contact with the Gemini API.
 *
 * Every route calls `generateStructuredContent` exactly once per user action
 * (one call for ideas, one for the deep dive, one for the roadmap, one per
 * mentor turn) — never in a loop and never speculatively — which is how the
 * app keeps Gemini usage to the minimum required.
 */

const DEFAULT_MODEL = "gemini-3.6-flash";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const REQUEST_TIMEOUT_MS = 60_000;

export class GeminiConfigError extends Error {}
export class GeminiRequestError extends Error {}
export class GeminiParseError extends Error {}

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) { 
    // Never leak whether other env vars exist — just that configuration is missing.
    throw new GeminiConfigError("Gemini API key is not configured on the server.");
  }
  return key;
}

interface GeminiApiResponse {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
    finishReason?: string;
  }[];
  promptFeedback?: {
    blockReason?: string;
  };
}

/**
 * Sends a single prompt to Gemini requesting JSON output, then validates the
 * parsed result against the provided Zod schema so malformed model output
 * never silently flows into the UI.
 */
export async function generateStructuredContent<T>(
  prompt: string,
  schema: ZodSchema<T>,
): Promise<T> {
  const apiKey = getApiKey();
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/${model}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      }),
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new GeminiRequestError("The AI request timed out. Please try again.");
    }
    throw new GeminiRequestError("Could not reach the AI service. Please try again.");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
     const errorText = await response.text();
    if (process.env.NODE_ENV === "development") {
    console.error("Gemini API Error:", errorText);
  }
    // Do not forward upstream body/status details to the client.
    throw new GeminiRequestError(
      `The AI service returned an unexpected response (status ${response.status}).`,
    );
  }

  let payload: GeminiApiResponse;
  try {
    payload = await response.json();
  } catch {
    throw new GeminiParseError("The AI service returned an unreadable response.");
  }

  if (payload.promptFeedback?.blockReason) {
    throw new GeminiRequestError("The AI service declined to process this request.");
  }

  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new GeminiParseError("The AI service returned an empty response.");
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(text);
  } catch {
    throw new GeminiParseError("The AI service returned malformed JSON.");
  }

  const result = schema.safeParse(parsedJson);
  if (!result.success) {
    throw new GeminiParseError("The AI service returned an unexpected data shape.");
  }

  return result.data;
}
