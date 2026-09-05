import { createJsonApiRoute } from "@/lib/api-handler";
import { mentorRequestSchema, mentorResponseSchema } from "@/lib/validation";
import { buildMentorPrompt } from "@/lib/prompts";
import { generateStructuredContent } from "@/services/gemini";
import type { MentorResponse } from "@/types";

export const POST = createJsonApiRoute(
  mentorRequestSchema,
  async ({ profile, idea, history, question }): Promise<MentorResponse> => {
    const prompt = buildMentorPrompt(profile, idea, history, question);
    return generateStructuredContent(prompt, mentorResponseSchema);
  },
);
