import { studentProfileSchema } from "@/lib/validation";

const baseProfile = {
  branch: "Computer Science",
  skills: ["React", "Node.js"],
  interests: ["Healthcare"],
  duration: "3 Months",
  difficulty: "Intermediate",
};

describe("studentProfileSchema", () => {
  it("accepts a fully valid profile", () => {
    const result = studentProfileSchema.safeParse(baseProfile);
    expect(result.success).toBe(true);
  });

  describe("branch validation", () => {
    it("rejects a branch outside the allowed list", () => {
      const result = studentProfileSchema.safeParse({ ...baseProfile, branch: "Astrology" });
      expect(result.success).toBe(false);
    });
  });

  describe("skills validation", () => {
    it("rejects an empty skills array", () => {
      const result = studentProfileSchema.safeParse({ ...baseProfile, skills: [] });
      expect(result.success).toBe(false);
    });

    it("rejects more than 10 skills", () => {
      const skills = Array.from({ length: 11 }, (_, i) => `Skill ${i}`);
      const result = studentProfileSchema.safeParse({ ...baseProfile, skills });
      expect(result.success).toBe(false);
    });

    it("rejects a skill containing disallowed characters", () => {
      const result = studentProfileSchema.safeParse({
        ...baseProfile,
        skills: ["<script>alert(1)</script>"],
      });
      expect(result.success).toBe(false);
    });

    it("rejects an empty interests array", () => {
      const result = studentProfileSchema.safeParse({ ...baseProfile, interests: [] });
      expect(result.success).toBe(false);
    });
  });

  describe("duration validation", () => {
    it("rejects a duration outside the allowed list", () => {
      const result = studentProfileSchema.safeParse({ ...baseProfile, duration: "10 Years" });
      expect(result.success).toBe(false);
    });

    it("accepts every allowed duration value", () => {
      for (const duration of ["1 Month", "2 Months", "3 Months", "4-6 Months"]) {
        const result = studentProfileSchema.safeParse({ ...baseProfile, duration });
        expect(result.success).toBe(true);
      }
    });
  });

  describe("difficulty validation", () => {
    it("rejects a difficulty outside the allowed list", () => {
      const result = studentProfileSchema.safeParse({ ...baseProfile, difficulty: "Impossible" });
      expect(result.success).toBe(false);
    });

    it("accepts every allowed difficulty value", () => {
      for (const difficulty of ["Beginner", "Intermediate", "Advanced"]) {
        const result = studentProfileSchema.safeParse({ ...baseProfile, difficulty });
        expect(result.success).toBe(true);
      }
    });
  });
});
