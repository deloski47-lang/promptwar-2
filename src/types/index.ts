/**
 * Centralized domain types shared across the app, API routes, and services.
 * Keeping these in one place avoids drift between the client and server shapes.
 */

export const ACADEMIC_BRANCHES = [
  "Computer Science",
  "Information Technology",
  "Electronics & Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "AI & Data Science",
  "Other",
] as const;

export const DIFFICULTY_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

export const PROJECT_DURATIONS = ["1 Month", "2 Months", "3 Months", "4-6 Months"] as const;

export type AcademicBranch = (typeof ACADEMIC_BRANCHES)[number];
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];
export type ProjectDuration = (typeof PROJECT_DURATIONS)[number];

/** Data collected from the student profile form. */
export interface StudentProfile {
  branch: AcademicBranch;
  skills: string[];
  interests: string[];
  duration: ProjectDuration;
  difficulty: DifficultyLevel;
}

/** A single generated project idea. */
export interface ProjectIdea {
  title: string;
  problemStatement: string;
  whyItMatters: string;
}

/** Response shape for the idea-generation endpoint. */
export interface IdeasResponse {
  ideas: ProjectIdea[];
}

/** Detailed breakdown of a chosen project. */
export interface ProjectDeepDive {
  features: string[];
  techStack: string[];
  architecture: string;
  developmentSteps: string[];
  challenges: string[];
  futureScope: string[];
}

/** One week of the implementation roadmap. */
export interface RoadmapWeek {
  week: string;
  tasks: string[];
}

/** Response shape for the roadmap endpoint. */
export interface RoadmapResponse {
  weeks: RoadmapWeek[];
}

/** A single turn in the mentor chat. */
export interface MentorMessage {
  role: "user" | "assistant";
  content: string;
}

/** Response shape returned by the mentor endpoint. */
export interface MentorResponse {
  answer: string;
  recommendations?: string[];
}

/** Standard error payload returned by every API route on failure. */
export interface ApiErrorPayload {
  error: string;
}

/** Discriminated union helper for client-side async request state. */
export type RequestState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

/** The five stages of the single-page student flow. */
export type FlowStep = "profile" | "ideas" | "deepDive" | "roadmap" | "mentor";
