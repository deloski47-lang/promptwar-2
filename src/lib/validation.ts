import { z } from "zod";
import { ACADEMIC_BRANCHES, DIFFICULTY_LEVELS, PROJECT_DURATIONS } from "@/types";

/**
 * A single free-text token (a skill or interest). Length-capped and stripped
 * of characters that have no place in a skill/interest label, which also
 * guards against prompt-injection style payloads reaching the Gemini prompt.
 */
const freeTextTokenSchema = z
  .string()
  .trim()
  .min(1, "Cannot be empty")
  .max(40, "Must be 40 characters or fewer")
  .regex(
    /^[a-zA-Z0-9\s.+#/&()-]+$/,
    "Only letters, numbers, and basic punctuation are allowed",
  );

export const studentProfileSchema = z.object({
  branch: z.enum(ACADEMIC_BRANCHES, {
    errorMap: () => ({ message: "Please select a valid academic branch" }),
  }),
  skills: z
    .array(freeTextTokenSchema)
    .min(1, "Add at least one skill")
    .max(10, "Please list 10 skills or fewer"),
  interests: z
    .array(freeTextTokenSchema)
    .min(1, "Add at least one interest")
    .max(10, "Please list 10 interests or fewer"),
  duration: z.enum(PROJECT_DURATIONS, {
    errorMap: () => ({ message: "Please select a valid project duration" }),
  }),
  difficulty: z.enum(DIFFICULTY_LEVELS, {
    errorMap: () => ({ message: "Please select a valid difficulty level" }),
  }),
});

export const projectIdeaSchema = z.object({
  title: z.string().trim().min(1).max(160),
  problemStatement: z.string().trim().min(1).max(2000),
  whyItMatters: z.string().trim().min(1).max(2000),
});

export const deepDiveRequestSchema = z.object({
  profile: studentProfileSchema,
  idea: projectIdeaSchema,
});

export const roadmapRequestSchema = z.object({
  profile: studentProfileSchema,
  idea: projectIdeaSchema,
  deepDive: z.object({
    features: z.array(z.string().max(300)).max(20),
    techStack: z.array(z.string().max(100)).max(20),
    architecture: z.string().max(4000),
    developmentSteps: z.array(z.string().max(300)).max(30),
    challenges: z.array(z.string().max(300)).max(20),
    futureScope: z.array(z.string().max(300)).max(20),
  }),
});

const mentorMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(2000),
});

export const mentorRequestSchema = z.object({
  profile: studentProfileSchema,
  idea: projectIdeaSchema,
  history: z.array(mentorMessageSchema).max(20),
  question: z.string().trim().min(1, "Please enter a question").max(1000),
});

/** Schemas used to validate Gemini's structured JSON output at runtime. */
export const ideasResponseSchema = z.object({
  ideas: z.array(projectIdeaSchema).length(3),
});

export const deepDiveResponseSchema = z.object({
  features: z.array(z.string()).min(1),
  techStack: z.array(z.string()).min(1),
  architecture: z.string().min(1),
  developmentSteps: z.array(z.string()).min(1),
  challenges: z.array(z.string()).min(1),
  futureScope: z.array(z.string()).min(1),
});

export const roadmapResponseSchema = z.object({
  weeks: z.array(
    z.object({
      week: z.string().min(1),
      tasks: z.array(z.string()).min(1),
    }),
  ).min(1),
});

export const mentorResponseSchema = z.object({
  answer: z.string().min(1),
  recommendations: z.array(z.string()).default([]),
});

export type StudentProfileInput = z.infer<typeof studentProfileSchema>;
export type DeepDiveRequestInput = z.infer<typeof deepDiveRequestSchema>;
export type RoadmapRequestInput = z.infer<typeof roadmapRequestSchema>;
export type MentorRequestInput = z.infer<typeof mentorRequestSchema>;
