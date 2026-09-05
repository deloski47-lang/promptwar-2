interface LoadingStateProps {
  label: string;
  skeletonRows?: number;
}

/**
 * A single reusable loading treatment: an accessible status message plus a
 * skeleton silhouette, used any time an API route call is in flight.
 */
export function LoadingState({ label, skeletonRows = 3 }: LoadingStateProps) {
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <p className="text-sm font-medium text-navy/70">{label}</p>
      <div className="space-y-2">
        {Array.from({ length: skeletonRows }).map((_, i) => (
          <div
            key={i}
            className="h-4 animate-pulse rounded bg-paper-line/70"
            style={{ width: `${90 - i * 12}%` }}
          />
        ))}
      </div>
    </div>
  );
}
