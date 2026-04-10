import db from '../db/db';

export interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  project_id: string;
  assignee_id: string | null;
  due_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

// BONUS: Pagination — prevents loading unbounded result sets, improves API scalability
export async function findByProject(
  projectId: string,
  filters: { status?: string; assignee?: string } = {},
  page = 1,
  limit = 20
): Promise<{ data: TaskRow[]; total: number }> {
  let query = db('tasks').where({ project_id: projectId });

  if (filters.status) {
    query = query.andWhere({ status: filters.status });
  }
  if (filters.assignee) {
    query = query.andWhere({ assignee_id: filters.assignee });
  }

  const countResult = await query.clone().count('* as count').first();
  const total = parseInt(String(countResult?.count || '0'), 10);

  const data = await query
    .clone()
    .select('*')
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset((page - 1) * limit);

  return { data, total };
}

export async function findById(id: string): Promise<TaskRow | undefined> {
  return db('tasks').where({ id }).first();
}

export async function create(data: {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  project_id: string;
  assignee_id?: string;
  due_date?: string;
}): Promise<TaskRow> {
  const [task] = await db('tasks').insert(data).returning('*');
  return task;
}

export async function update(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    status: string;
    priority: string;
    assignee_id: string | null;
    due_date: string | null;
  }>
): Promise<TaskRow> {
  // updated_at is auto-set by PG trigger
  const [task] = await db('tasks').where({ id }).update(data).returning('*');
  return task;
}

export async function remove(id: string): Promise<void> {
  await db('tasks').where({ id }).delete();
}
