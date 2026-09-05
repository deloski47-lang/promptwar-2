import { createJsonApiRoute } from "@/lib/api-handler";
import { roadmapRequestSchema, roadmapResponseSchema } from "@/lib/validation";
import { buildRoadmapPrompt } from "@/lib/prompts";
import { generateStructuredContent } from "@/services/gemini";
import type { RoadmapResponse } from "@/types";

export const POST = createJsonApiRoute(
  roadmapRequestSchema,
  async ({ profile, idea, deepDive }): Promise<RoadmapResponse> => {
    const prompt = buildRoadmapPrompt(profile, idea, deepDive);
    return generateStructuredContent(prompt, roadmapResponseSchema);
  },
);
