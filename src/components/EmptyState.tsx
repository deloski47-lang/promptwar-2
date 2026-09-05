interface EmptyStateProps {
  title: string;
  description: string;
}

/** A single reusable empty-state treatment for sections with nothing to show yet. */
export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="border border-dashed border-paper-line p-6 text-center">
      <p className="font-display text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 text-sm text-navy/60">{description}</p>
    </div>
  );
}
