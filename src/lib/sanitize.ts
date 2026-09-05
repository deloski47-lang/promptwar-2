/**
 * Lightweight defense-in-depth helpers for text that will be interpolated
 * into a Gemini prompt. Zod already rejects malformed input at the schema
 * boundary; these helpers additionally neutralize characters that could be
 * used to break out of the prompt's intended structure.
 */

/** Collapses whitespace and strips characters that could interfere with prompt structure. */
export function sanitizePromptText(value: string, maxLength = 2000): string {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, "") // control characters
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/** Sanitizes a list of short free-text tokens (skills, interests). */
export function sanitizeTokenList(values: string[], maxItems = 10): string[] {
  return values
    .map((v) => sanitizePromptText(v, 60))
    .filter((v) => v.length > 0)
    .slice(0, maxItems);
}
