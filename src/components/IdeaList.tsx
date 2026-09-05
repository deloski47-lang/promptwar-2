import type { ProjectIdea } from "@/types";
import { IdeaCard } from "@/components/IdeaCard";

interface IdeaListProps {
  ideas: ProjectIdea[];
  onSelect: (idea: ProjectIdea) => void;
  selectingTitle: string | null;
}

/** Renders the three generated project ideas as a responsive card grid. */
export function IdeaList({ ideas, onSelect, selectingTitle }: IdeaListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ideas.map((idea) => (
        <IdeaCard
          key={idea.title}
          idea={idea}
          onSelect={() => onSelect(idea)}
          isSelecting={selectingTitle === idea.title}
        />
      ))}
    </div>
  );
}
