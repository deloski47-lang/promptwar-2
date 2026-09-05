import { createJsonApiRoute } from "@/lib/api-handler";
import { studentProfileSchema, ideasResponseSchema } from "@/lib/validation";
import { buildIdeasPrompt } from "@/lib/prompts";
import { generateStructuredContent } from "@/services/gemini";
import type { IdeasResponse } from "@/types";

export const POST = createJsonApiRoute(studentProfileSchema, async (profile): Promise<IdeasResponse> => {
  const prompt = buildIdeasPrompt(profile);
  return generateStructuredContent(prompt, ideasResponseSchema);
});
