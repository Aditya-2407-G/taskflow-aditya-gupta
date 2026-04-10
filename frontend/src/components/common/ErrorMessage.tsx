import { AlertCircle } from 'lucide-react';

interface Props {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
      <AlertCircle className="h-12 w-12 text-[hsl(var(--destructive))]" />
      <p className="text-[hsl(var(--muted-foreground))]">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-md bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
