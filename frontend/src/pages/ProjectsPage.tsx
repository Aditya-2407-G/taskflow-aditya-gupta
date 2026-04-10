import { useSearchParams } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { ProjectList } from '@/components/projects/ProjectList';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';

export function ProjectsPage() {
  // BONUS: Pagination UI — URL-synced for refresh persistence
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1');
  const { data, isLoading, isError, refetch } = useProjects(page);

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: String(newPage) });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Manage your projects and tasks</p>
        </div>
        <CreateProjectDialog />
      </div>

      {isLoading && <LoadingSpinner />}
      {isError && <ErrorMessage message="Failed to load projects" onRetry={refetch} />}
      {data && data.data.length === 0 && (
        <EmptyState
          title="No projects yet"
          description="Create your first project to get started"
        />
      )}
      {data && data.data.length > 0 && (
        <>
          <ProjectList projects={data.data} />
          <Pagination
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
