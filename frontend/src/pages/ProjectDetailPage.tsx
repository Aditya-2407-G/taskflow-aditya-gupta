import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProject, useDeleteProject, useProjectStats } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { ArrowLeft, Trash2, BarChart3 } from 'lucide-react';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');

  const { data: project, isLoading: loadingProject, isError: errorProject, refetch: refetchProject } = useProject(id!);
  const { data: tasksData, isLoading: loadingTasks, isError: errorTasks, refetch: refetchTasks } = useTasks(id!, {
    status: statusFilter || undefined,
  });
  // BONUS: Stats endpoint
  const { data: stats } = useProjectStats(id!);
  const deleteProject = useDeleteProject();

  const handleDelete = async () => {
    if (confirm('Delete this project and all its tasks?')) {
      await deleteProject.mutateAsync(id!);
      navigate('/projects');
    }
  };

  if (loadingProject) return <LoadingSpinner />;
  if (errorProject) return <ErrorMessage message="Failed to load project" onRetry={refetchProject} />;
  if (!project) return <ErrorMessage message="Project not found" />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <Link to="/projects" className="mb-4 inline-flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
          <ArrowLeft className="h-4 w-4" />
          Back to projects
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{project.description}</p>
            )}
          </div>
          <button
            onClick={handleDelete}
            className="rounded-md p-2 text-[hsl(var(--muted-foreground))] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
            title="Delete project"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        {/* BONUS: Stats display */}
        {stats && (
          <div className="mt-4 flex items-center gap-4">
            <BarChart3 className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            <div className="flex gap-4 text-sm">
              <span className="text-gray-600 dark:text-gray-400">To Do: <strong>{stats.todo}</strong></span>
              <span className="text-blue-600 dark:text-blue-400">In Progress: <strong>{stats.in_progress}</strong></span>
              <span className="text-green-600 dark:text-green-400">Done: <strong>{stats.done}</strong></span>
              <span className="text-[hsl(var(--muted-foreground))]">Total: <strong>{stats.total}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <TaskFilters status={statusFilter} onStatusChange={setStatusFilter} />
        <CreateTaskDialog projectId={id!} />
      </div>

      {/* Tasks */}
      {loadingTasks && <LoadingSpinner />}
      {errorTasks && <ErrorMessage message="Failed to load tasks" onRetry={refetchTasks} />}
      {tasksData && tasksData.data.length === 0 && (
        <EmptyState
          title="No tasks yet"
          description="Add your first task to get started"
        />
      )}
      {tasksData && tasksData.data.length > 0 && (
        <TaskBoard tasks={tasksData.data} projectId={id!} />
      )}
    </div>
  );
}
