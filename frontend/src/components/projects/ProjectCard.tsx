import { Link } from 'react-router-dom';
import { FolderKanban, Calendar } from 'lucide-react';
import { type Project } from '@/api/projects';
import { formatDate } from '@/lib/utils';

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="block rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <FolderKanban className="mt-0.5 h-5 w-5 text-[hsl(var(--primary))]" />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-[hsl(var(--card-foreground))] truncate">{project.name}</h3>
          {project.description && (
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))] line-clamp-2">{project.description}</p>
          )}
          <div className="mt-3 flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
            <Calendar className="h-3 w-3" />
            {formatDate(project.created_at)}
          </div>
        </div>
      </div>
    </Link>
  );
}
