import { createJsonApiRoute } from "@/lib/api-handler";
import { deepDiveRequestSchema, deepDiveResponseSchema } from "@/lib/validation";
import { buildDeepDivePrompt } from "@/lib/prompts";
import { generateStructuredContent } from "@/services/gemini";
import type { ProjectDeepDive } from "@/types";

export const POST = createJsonApiRoute(deepDiveRequestSchema, async ({ profile, idea }): Promise<ProjectDeepDive> => {
  const prompt = buildDeepDivePrompt(profile, idea);
  return generateStructuredContent(prompt, deepDiveResponseSchema);
});
