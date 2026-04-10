// BONUS: Pagination UI — pairs with backend pagination, URL-synced for refresh persistence
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-md border border-[hsl(var(--border))] p-2 disabled:opacity-50 hover:bg-[hsl(var(--accent))]"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="text-sm text-[hsl(var(--muted-foreground))]">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-md border border-[hsl(var(--border))] p-2 disabled:opacity-50 hover:bg-[hsl(var(--accent))]"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
