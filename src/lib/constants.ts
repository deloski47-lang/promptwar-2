import type { FlowStep } from "@/types";

/** Ordered steps of the single-page flow, used to drive the progress rail. */
export const FLOW_STEPS: { id: FlowStep; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "ideas", label: "Ideas" },
  { id: "deepDive", label: "Deep Dive" },
  { id: "roadmap", label: "Roadmap" },
  { id: "mentor", label: "Mentor" },
];

/** Generic, non-leaky message shown for unexpected server failures. */
export const GENERIC_ERROR_MESSAGE =
  "Something went wrong on our end. Please try again in a moment.";

export const MAX_MENTOR_HISTORY = 12;
