import { FLOW_STEPS } from "@/lib/constants";
import type { FlowStep } from "@/types";

interface StepIndicatorProps {
  currentStep: FlowStep;
}

/**
 * A horizontal "title block" rail marking progress through the five-stage
 * flow. Numbered because the flow genuinely is a fixed sequence.
 */
export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = FLOW_STEPS.findIndex((s) => s.id === currentStep);

  return (
    <ol
      aria-label="Project mentoring progress"
      className="flex w-full items-center gap-1 sm:gap-2"
    >
      {FLOW_STEPS.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <li key={step.id} className="flex flex-1 items-center gap-1 sm:gap-2">
            <div
              className="flex items-center gap-2"
              aria-current={isCurrent ? "step" : undefined}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                  isCurrent
                    ? "border-accent bg-accent text-ink"
                    : isComplete
                      ? "border-navy bg-navy text-white"
                      : "border-paper-line bg-white text-navy/50"
                }`}
              >
                {index + 1}
              </span>
              <span
                className={`hidden text-xs font-medium sm:inline ${
                  isCurrent ? "text-ink" : "text-navy/50"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < FLOW_STEPS.length - 1 && (
              <span
                className={`h-px flex-1 ${isComplete ? "bg-navy" : "bg-paper-line"}`}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
