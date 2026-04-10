import apiClient from './client';

interface AuthResponse {
  user: { id: string; name: string; email: string };
  token: string;
}

export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password });
  return data;
}

export async function registerApi(name: string, email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', { name, email, password });
  return data;
}
