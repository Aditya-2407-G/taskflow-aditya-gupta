import { FolderOpen } from 'lucide-react';

interface Props {
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
      <FolderOpen className="h-16 w-16 text-[hsl(var(--muted-foreground))]" />
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{description}</p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="rounded-md bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
