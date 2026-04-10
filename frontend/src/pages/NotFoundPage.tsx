import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <FileQuestion className="h-16 w-16 text-[hsl(var(--muted-foreground))]" />
      <h1 className="text-2xl font-bold">Page Not Found</h1>
      <p className="text-[hsl(var(--muted-foreground))]">The page you're looking for doesn't exist.</p>
      <Link
        to="/projects"
        className="rounded-md bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90"
      >
        Go to Projects
      </Link>
    </div>
  );
}
