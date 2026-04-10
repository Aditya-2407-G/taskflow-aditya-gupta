import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listTasks, createTask, updateTask, deleteTask, type Task } from '../api/tasks';

export function useTasks(projectId: string, filters?: { status?: string; assignee?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['tasks', projectId, filters],
    queryFn: () => listTasks(projectId, filters),
    enabled: !!projectId,
  });
}

export function useCreateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { title: string; description?: string; status?: string; priority?: string; assignee_id?: string; due_date?: string }) =>
      createTask(projectId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', projectId] });
      qc.invalidateQueries({ queryKey: ['projects', projectId, 'stats'] });
    },
  });
}

export function useUpdateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, ...body }: { taskId: string } & Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'assignee_id' | 'due_date'>>) =>
      updateTask(taskId, body as any),
    // Optimistic update with error rollback (assignment requirement)
    onMutate: async (variables) => {
      await qc.cancelQueries({ queryKey: ['tasks', projectId] });
      const previousData = qc.getQueriesData({ queryKey: ['tasks', projectId] });

      // Optimistically update cache
      qc.setQueriesData<{ data: Task[] }>({ queryKey: ['tasks', projectId] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((t) =>
            t.id === variables.taskId ? { ...t, ...variables } : t
          ),
        };
      });

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      // Revert on error
      if (context?.previousData) {
        for (const [key, data] of context.previousData) {
          qc.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['tasks', projectId] });
      qc.invalidateQueries({ queryKey: ['projects', projectId, 'stats'] });
    },
  });
}

export function useDeleteTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', projectId] });
      qc.invalidateQueries({ queryKey: ['projects', projectId, 'stats'] });
    },
  });
}
