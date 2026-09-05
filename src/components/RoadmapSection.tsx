import type { RoadmapResponse } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface RoadmapSectionProps {
  roadmap: RoadmapResponse;
  onContinue: () => void;
}

/** Presents the week-by-week implementation schedule as an ordered timeline. */
export function RoadmapSection({ roadmap, onContinue }: RoadmapSectionProps) {
  return (
    <div className="space-y-4">
      <ol className="space-y-3">
        {roadmap.weeks.map((week, index) => (
          <li key={index}>
            <Card className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-5">
              <span className="font-display shrink-0 text-sm font-semibold text-accent-dark sm:w-28">
                {week.week}
              </span>
              <ul className="flex-1 space-y-1.5">
                {week.tasks.map((task, i) => (
                  <li key={i} className="flex gap-2 text-sm text-ink/80">
                    <span
                      className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-navy"
                      aria-hidden="true"
                    />
                    {task}
                  </li>
                ))}
              </ul>
            </Card>
          </li>
        ))}
      </ol>
      <Button onClick={onContinue}>Ask the AI mentor a question</Button>
    </div>
  );
}
