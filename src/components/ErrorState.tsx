import { Button } from "@/components/ui/Button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

/** A single reusable error treatment shown whenever an API call fails. */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="corner-bracket border border-danger/40 bg-danger/5 p-5"
    >
      <p className="text-sm font-medium text-danger">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="mt-3 border-danger text-danger hover:bg-danger hover:text-white">
          Try again
        </Button>
      )}
    </div>
  );
}
