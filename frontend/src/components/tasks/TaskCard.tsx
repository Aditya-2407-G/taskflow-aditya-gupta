import { type Task } from '@/api/tasks';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { formatDate } from '@/lib/utils';
import { Calendar, Pencil, Trash2 } from 'lucide-react';

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({ task, onEdit, onDelete }: Props) {
  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-sm text-[hsl(var(--card-foreground))]">{task.title}</h4>
        <div className="flex gap-1">
          <button onClick={() => onEdit(task)} className="rounded p-1 hover:bg-[hsl(var(--accent))]">
            <Pencil className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
          </button>
          <button onClick={() => onDelete(task.id)} className="rounded p-1 hover:bg-red-50 dark:hover:bg-red-900/20">
            <Trash2 className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))] line-clamp-2">{task.description}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
        {task.due_date && (
          <span className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
            <Calendar className="h-3 w-3" />
            {formatDate(task.due_date)}
          </span>
        )}
      </div>
    </div>
  );
}
