import apiClient from './client';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  project_id: string;
  assignee_id: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export async function listTasks(
  projectId: string,
  filters?: { status?: string; assignee?: string; page?: number; limit?: number }
): Promise<PaginatedResponse<Task>> {
  const { data } = await apiClient.get(`/projects/${projectId}/tasks`, { params: filters });
  return data;
}

export async function createTask(
  projectId: string,
  body: { title: string; description?: string; status?: string; priority?: string; assignee_id?: string; due_date?: string }
): Promise<Task> {
  const { data } = await apiClient.post(`/projects/${projectId}/tasks`, body);
  return data;
}

export async function updateTask(
  taskId: string,
  body: Partial<{ title: string; description: string; status: string; priority: string; assignee_id: string | null; due_date: string | null }>
): Promise<Task> {
  const { data } = await apiClient.patch(`/tasks/${taskId}`, body);
  return data;
}

export async function deleteTask(taskId: string): Promise<void> {
  await apiClient.delete(`/tasks/${taskId}`);
}
