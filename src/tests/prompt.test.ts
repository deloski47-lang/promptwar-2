import { buildDeepDivePrompt, buildIdeasPrompt, buildMentorPrompt, buildRoadmapPrompt } from "@/lib/prompts";
import { ideasResponseSchema } from "@/lib/validation";
import type { ProjectDeepDive, ProjectIdea, StudentProfile } from "@/types";

const profile: StudentProfile = {
  branch: "Computer Science",
  skills: ["React", "Python"],
  interests: ["Healthcare", "Education"],
  duration: "3 Months",
  difficulty: "Intermediate",
};

const idea: ProjectIdea = {
  title: "Smart Attendance System",
  problemStatement: "Manual attendance is slow and error-prone.",
  whyItMatters: "Saves faculty time and improves record accuracy.",
};

const deepDive: ProjectDeepDive = {
  features: ["Face recognition check-in", "Attendance dashboard"],
  techStack: ["Next.js", "Python", "OpenCV"],
  architecture: "A frontend dashboard talks to a Python service that runs recognition.",
  developmentSteps: ["Set up camera pipeline", "Build recognition model", "Build dashboard"],
  challenges: ["Lighting variance", "Privacy concerns"],
  futureScope: ["Mobile app", "Multi-campus support"],
};

describe("prompt construction", () => {
  describe("buildIdeasPrompt", () => {
    it("includes all required student context", () => {
      const prompt = buildIdeasPrompt(profile);
      expect(prompt).toContain("Computer Science");
      expect(prompt).toContain("React, Python");
      expect(prompt).toContain("Healthcare, Education");
      expect(prompt).toContain("3 Months");
      expect(prompt).toContain("Intermediate");
    });

    it("requests exactly 3 ideas in a structured JSON-only format", () => {
      const prompt = buildIdeasPrompt(profile);
      expect(prompt).toMatch(/JSON/i);
      expect(prompt).toContain("exactly 3");
      expect(prompt).toContain('"ideas"');
    });
  });

  describe("buildDeepDivePrompt", () => {
    it("includes the selected idea and student context", () => {
      const prompt = buildDeepDivePrompt(profile, idea);
      expect(prompt).toContain(idea.title);
      expect(prompt).toContain(idea.problemStatement);
      expect(prompt).toContain("Computer Science");
    });

    it("requests all six deep-dive fields in the schema", () => {
      const prompt = buildDeepDivePrompt(profile, idea);
      for (const field of [
        "features",
        "techStack",
        "architecture",
        "developmentSteps",
        "challenges",
        "futureScope",
      ]) {
        expect(prompt).toContain(`"${field}"`);
      }
    });
  });

  describe("buildRoadmapPrompt", () => {
    it("includes the project's development steps and duration", () => {
      const prompt = buildRoadmapPrompt(profile, idea, deepDive);
      expect(prompt).toContain("Set up camera pipeline");
      expect(prompt).toContain(profile.duration);
    });

    it("requests a weeks array in the schema", () => {
      const prompt = buildRoadmapPrompt(profile, idea, deepDive);
      expect(prompt).toContain('"weeks"');
      expect(prompt).toContain('"tasks"');
    });
  });

  describe("buildMentorPrompt", () => {
    it("includes conversation history and the new question", () => {
      const prompt = buildMentorPrompt(
        profile,
        idea,
        [{ role: "user", content: "What database should I use?" }],
        "Can I finish this in 4 months?",
      );
      expect(prompt).toContain("What database should I use?");
      expect(prompt).toContain("Can I finish this in 4 months?");
    });

    it("scopes the mentor to the selected project's context", () => {
      const prompt = buildMentorPrompt(profile, idea, [], "How do I structure the backend?");
      expect(prompt).toContain(idea.title);
      expect(prompt).toContain("questions relevant to");
    });
  });
});

describe("ideasResponseSchema (mocked Gemini output)", () => {
  it("accepts a well-formed mocked Gemini response", () => {
    const mockedGeminiOutput = {
      ideas: [
        { title: "A", problemStatement: "p", whyItMatters: "w" },
        { title: "B", problemStatement: "p", whyItMatters: "w" },
        { title: "C", problemStatement: "p", whyItMatters: "w" },
      ],
    };
    expect(ideasResponseSchema.safeParse(mockedGeminiOutput).success).toBe(true);
  });

  it("rejects a mocked Gemini response with the wrong number of ideas", () => {
    const mockedGeminiOutput = {
      ideas: [{ title: "A", problemStatement: "p", whyItMatters: "w" }],
    };
    expect(ideasResponseSchema.safeParse(mockedGeminiOutput).success).toBe(false);
  });
});
