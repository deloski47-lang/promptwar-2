import "server-only";
import { NextRequest, NextResponse } from "next/server";
import type { ZodSchema } from "zod";
import { GeminiConfigError, GeminiParseError, GeminiRequestError } from "@/services/gemini";
import { GENERIC_ERROR_MESSAGE } from "@/lib/constants";
import type { ApiErrorPayload } from "@/types";

/**
 * Wraps a POST handler with consistent request validation and error
 * sanitization so no route ever leaks a raw stack trace, upstream error
 * body, or internal detail to the client.
 */
export function createJsonApiRoute<Input, Output>(
  requestSchema: ZodSchema<Input>,
  handler: (input: Input) => Promise<Output>,
) {
  return async function POST(request: NextRequest): Promise<NextResponse<Output | ApiErrorPayload>> {
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }

    const parsed = requestSchema.safeParse(rawBody);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message ?? "Invalid request data." },
        { status: 400 },
      );
    }

    try {
      const result = await handler(parsed.data);
      return NextResponse.json(result, { status: 200 });
    } catch (err) {
      if (err instanceof GeminiConfigError) {
        // Configuration issues are ours to fix, not the student's — but we
        // still never reveal internal details in the response body.
        console.error("Gemini configuration error:", err.message);
        return NextResponse.json(
          { error: "The AI mentor is temporarily unavailable. Please try again later." },
          { status: 503 },
        );
      }
      if (err instanceof GeminiRequestError || err instanceof GeminiParseError) {
        console.error("Gemini request error:", err.message);
        return NextResponse.json({ error: err.message }, { status: 502 });
      }
      console.error("Unexpected API error:", err);
      return NextResponse.json({ error: GENERIC_ERROR_MESSAGE }, { status: 500 });
    }
  };
}
