import type { MentorMessage, ProjectDeepDive, ProjectIdea, StudentProfile } from "@/types";
import { sanitizePromptText, sanitizeTokenList } from "@/lib/sanitize";

/**
 * All Gemini prompt construction lives here so every route asks for
 * structured JSON in a consistent, auditable way, and so prompt changes
 * only ever happen in one place.
 */

function describeProfile(profile: StudentProfile): string {
  const skills = sanitizeTokenList(profile.skills).join(", ");
  const interests = sanitizeTokenList(profile.interests).join(", ");
  return [
    `Academic branch: ${profile.branch}`,
    `Skills: ${skills}`,
    `Interests: ${interests}`,
    `Available duration: ${profile.duration}`,
    `Target difficulty: ${profile.difficulty}`,
  ].join("\n");
}

function describeIdea(idea: ProjectIdea): string {
  return [
    `Title: ${sanitizePromptText(idea.title, 160)}`,
    `Problem statement: ${sanitizePromptText(idea.problemStatement)}`,
    `Why it matters: ${sanitizePromptText(idea.whyItMatters)}`,
  ].join("\n");
}

const JSON_ONLY_INSTRUCTION =
  "Respond with ONLY a single valid JSON object matching the schema below. " +
  "No markdown code fences, no commentary, no leading or trailing text.";

export function buildIdeasPrompt(profile: StudentProfile): string {
  return `You are an experienced final-year-project mentor for engineering and computer science students.

Based on this student's profile, propose exactly 3 distinct, feasible final-year project ideas that fit their skills, interests, timeline, and difficulty level. Ideas must be realistically buildable within the stated duration and must not be generic or overused (avoid plain "to-do list" or "library management system" style ideas unless meaningfully reinvented).

Student profile:
${describeProfile(profile)}

${JSON_ONLY_INSTRUCTION}

Schema:
{
  "ideas": [
    {
      "title": string,
      "problemStatement": string (2-3 sentences describing the real problem being solved),
      "whyItMatters": string (2-3 sentences on relevance/impact for this student's field)
    }
  ]
}
The "ideas" array must contain exactly 3 items.`;
}

export function buildDeepDivePrompt(profile: StudentProfile, idea: ProjectIdea): string {
  return `You are an experienced final-year-project mentor. A student has selected one project idea from a shortlist you provided. Produce a complete implementation deep dive for it in a single response.

Student profile:
${describeProfile(profile)}

Selected project:
${describeIdea(idea)}

${JSON_ONLY_INSTRUCTION}

Schema:
{
  "features": string[] (4-7 key features, concrete and buildable),
  "techStack": string[] (specific technologies suited to the student's existing skills and the project's needs),
  "architecture": string (a clear, plain-text description of the high-level architecture; describe components and how data flows between them, 4-8 sentences),
  "developmentSteps": string[] (6-10 ordered high-level implementation steps),
  "challenges": string[] (3-5 realistic technical or scoping challenges this student may face),
  "futureScope": string[] (3-5 possible extensions beyond the final-year deadline)
}`;
}

export function buildRoadmapPrompt(
  profile: StudentProfile,
  idea: ProjectIdea,
  deepDive: ProjectDeepDive,
): string {
  return `You are an experienced final-year-project mentor. Create a week-by-week implementation roadmap for the student's selected project, scaled to fit their available duration and difficulty level.

Student profile:
${describeProfile(profile)}

Selected project:
${describeIdea(idea)}

Planned development steps:
${deepDive.developmentSteps.map((step) => `- ${sanitizePromptText(step, 300)}`).join("\n")}

${JSON_ONLY_INSTRUCTION}

Schema:
{
  "weeks": [
    { "week": string (e.g. "Week 1-2"), "tasks": string[] (2-5 concrete tasks for that period) }
  ]
}
Cover the full stated duration (${profile.duration}) without leaving large unplanned gaps, and group slower weeks together (e.g. "Week 1-2") rather than listing every single week individually when the duration is long.`;
}

export function buildMentorPrompt(
  profile: StudentProfile,
  idea: ProjectIdea,
  history: MentorMessage[],
  question: string,
): string {
  const historyText = history
    .map((m) => `${m.role === "user" ? "Student" : "Mentor"}: ${sanitizePromptText(m.content)}`)
    .join("\n");

  return `You are an experienced, practical final-year-project mentor helping one student implement their chosen project. Answer only questions relevant to planning, building, or scoping this specific project. Give direct, actionable, technically sound advice grounded in the project's context below.

Student profile:
${describeProfile(profile)}

Selected project:
${describeIdea(idea)}

Conversation so far:
${historyText || "(no prior messages)"}

Student's new question:
${sanitizePromptText(question, 1000)}

${JSON_ONLY_INSTRUCTION}

Schema:
{
  "answer": string (direct, practical answer to the student's question, 3-8 sentences),
  "recommendations": string[] (0-4 short, concrete next-step recommendations; omit if none are warranted)
}`;
}
