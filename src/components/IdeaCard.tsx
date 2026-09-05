import type { ProjectIdea } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface IdeaCardProps {
  idea: ProjectIdea;
  onSelect: () => void;
  isSelecting: boolean;
}

/** Displays one generated project idea with an action to move into the deep dive. */
export function IdeaCard({ idea, onSelect, isSelecting }: IdeaCardProps) {
  return (
    <Card className="flex flex-col gap-3">
      <h3 className="font-display text-lg font-semibold leading-snug text-ink">{idea.title}</h3>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-navy/50">Problem</p>
        <p className="mt-1 text-sm text-ink/80">{idea.problemStatement}</p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-navy/50">Why it matters</p>
        <p className="mt-1 text-sm text-ink/80">{idea.whyItMatters}</p>
      </div>
      <Button onClick={onSelect} isLoading={isSelecting} className="mt-auto self-start">
        Build this project
      </Button>
    </Card>
  );
}
