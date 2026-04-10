import apiClient from './client';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectStats {
  todo: number;
  in_progress: number;
  done: number;
  total: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export async function listProjects(page = 1, limit = 20): Promise<PaginatedResponse<Project>> {
  const { data } = await apiClient.get('/projects', { params: { page, limit } });
  return data;
}

export async function getProject(id: string): Promise<Project> {
  const { data } = await apiClient.get(`/projects/${id}`);
  return data;
}

export async function createProject(body: { name: string; description?: string }): Promise<Project> {
  const { data } = await apiClient.post('/projects', body);
  return data;
}

export async function updateProject(id: string, body: { name?: string; description?: string }): Promise<Project> {
  const { data } = await apiClient.patch(`/projects/${id}`, body);
  return data;
}

export async function deleteProject(id: string): Promise<void> {
  await apiClient.delete(`/projects/${id}`);
}

// BONUS: Stats endpoint — provides project-level task summary without fetching all tasks
export async function getProjectStats(id: string): Promise<ProjectStats> {
  const { data } = await apiClient.get(`/projects/${id}/stats`);
  return data;
}
