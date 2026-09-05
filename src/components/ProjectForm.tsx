"use client";

import { useId, useState, type FormEvent } from "react";
import { ACADEMIC_BRANCHES, DIFFICULTY_LEVELS, PROJECT_DURATIONS } from "@/types";
import type { StudentProfile } from "@/types";
import { studentProfileSchema } from "@/lib/validation";
import { TagInput } from "@/components/ui/TagInput";
import { Button } from "@/components/ui/Button";

interface ProjectFormProps {
  onSubmit: (profile: StudentProfile) => void;
  isSubmitting: boolean;
}

const selectClasses =
  "mt-1.5 block w-full border border-paper-line bg-white px-3 py-2 text-sm text-ink focus:border-navy";

/** Collects the student's academic context and preferences before generating ideas. */
export function ProjectForm({ onSubmit, isSubmitting }: ProjectFormProps) {
  const [branch, setBranch] = useState<StudentProfile["branch"]>(ACADEMIC_BRANCHES[0]);
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [duration, setDuration] = useState<StudentProfile["duration"]>(PROJECT_DURATIONS[1]);
  const [difficulty, setDifficulty] = useState<StudentProfile["difficulty"]>(DIFFICULTY_LEVELS[1]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const branchId = useId();
  const durationId = useId();
  const difficultyId = useId();
  const skillsErrorId = useId();
  const interestsErrorId = useId();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const candidate: StudentProfile = { branch, skills, interests, duration, difficulty };
    const result = studentProfileSchema.safeParse(candidate);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString() ?? "form";
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    onSubmit(result.data);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5" aria-label="Student profile form">
      <div>
        <label htmlFor={branchId} className="block text-sm font-medium text-ink">
          Academic branch
        </label>
        <select
          id={branchId}
          value={branch}
          onChange={(e) => setBranch(e.target.value as StudentProfile["branch"])}
          className={selectClasses}
        >
          {ACADEMIC_BRANCHES.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <div>
        <TagInput
          label="Skills"
          values={skills}
          onChange={setSkills}
          placeholder="e.g. React, Python, Arduino"
          helpText="Press Enter or comma to add. Add up to 10 skills."
          errorId={errors.skills ? skillsErrorId : undefined}
        />
        {errors.skills && (
          <p id={skillsErrorId} role="alert" className="mt-1 text-xs text-danger">
            {errors.skills}
          </p>
        )}
      </div>

      <div>
        <TagInput
          label="Interests"
          values={interests}
          onChange={setInterests}
          placeholder="e.g. healthcare, climate, fintech"
          helpText="Press Enter or comma to add. Add up to 10 interests."
          errorId={errors.interests ? interestsErrorId : undefined}
        />
        {errors.interests && (
          <p id={interestsErrorId} role="alert" className="mt-1 text-xs text-danger">
            {errors.interests}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={durationId} className="block text-sm font-medium text-ink">
            Project duration
          </label>
          <select
            id={durationId}
            value={duration}
            onChange={(e) => setDuration(e.target.value as StudentProfile["duration"])}
            className={selectClasses}
          >
            {PROJECT_DURATIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={difficultyId} className="block text-sm font-medium text-ink">
            Difficulty level
          </label>
          <select
            id={difficultyId}
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as StudentProfile["difficulty"])}
            className={selectClasses}
          >
            {DIFFICULTY_LEVELS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
        Generate project ideas
      </Button>
    </form>
  );
}
