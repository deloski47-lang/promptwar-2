import type { ProjectDeepDive } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface DeepDiveSectionProps {
  deepDive: ProjectDeepDive;
  onContinue: () => void;
  isContinuing: boolean;
}

function Field({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-navy/50">{label}</p>
      <ul className="mt-2 space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-ink/80">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Presents the full implementation deep dive for the student's selected project. */
export function DeepDiveSection({ deepDive, onContinue, isContinuing }: DeepDiveSectionProps) {
  return (
    <Card className="space-y-6">
      <Field label="Key features" items={deepDive.features} />

      <Field label="Recommended tech stack" items={deepDive.techStack} />

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-navy/50">Architecture</p>
        <p className="mt-2 text-sm leading-relaxed text-ink/80">{deepDive.architecture}</p>
      </div>

      <Field label="Development steps" items={deepDive.developmentSteps} />
      <Field label="Challenges to plan for" items={deepDive.challenges} />
      <Field label="Future scope" items={deepDive.futureScope} />

      <Button onClick={onContinue} isLoading={isContinuing}>
        Generate weekly roadmap
      </Button>
    </Card>
  );
}
