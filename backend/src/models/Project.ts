import db from '../db/db';

export interface ProjectRow {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: Date;
  updated_at: Date;
}

// BONUS: Pagination — prevents loading unbounded result sets, improves API scalability
export async function findAccessibleByUser(
  userId: string,
  page = 1,
  limit = 20
): Promise<{ data: ProjectRow[]; total: number }> {
  // List projects user owns OR has tasks assigned in (per spec)
  const baseQuery = db('projects as p')
    .leftJoin('tasks as t', 't.project_id', 'p.id')
    .where('p.owner_id', userId)
    .orWhere('t.assignee_id', userId)
    .countDistinct('p.id as count')
    .first();

  const countResult = await baseQuery;
  const total = parseInt(String(countResult?.count || '0'), 10);

  const data = await db('projects as p')
    .leftJoin('tasks as t', 't.project_id', 'p.id')
    .where('p.owner_id', userId)
    .orWhere('t.assignee_id', userId)
    .select('p.*')
    .distinct('p.id')
    .orderBy('p.created_at', 'desc')
    .limit(limit)
    .offset((page - 1) * limit);

  return { data, total };
}

export async function findById(id: string): Promise<ProjectRow | undefined> {
  return db('projects').where({ id }).first();
}

export async function create(data: {
  name: string;
  description?: string;
  owner_id: string;
}): Promise<ProjectRow> {
  const [project] = await db('projects').insert(data).returning('*');
  return project;
}

export async function update(
  id: string,
  data: Partial<{ name: string; description: string }>
): Promise<ProjectRow> {
  const [project] = await db('projects')
    .where({ id })
    .update({ ...data, updated_at: db.fn.now() })
    .returning('*');
  return project;
}

export async function remove(id: string): Promise<void> {
  await db('projects').where({ id }).delete();
}

// BONUS: Stats endpoint — provides project-level task summary without fetching all tasks
export async function getStats(
  projectId: string
): Promise<{ todo: number; in_progress: number; done: number; total: number }> {
  const rows = await db('tasks')
    .where({ project_id: projectId })
    .select('status')
    .count('* as count')
    .groupBy('status');

  const stats = { todo: 0, in_progress: 0, done: 0, total: 0 };
  for (const row of rows) {
    const count = parseInt(String(row.count), 10);
    const status = row.status as keyof typeof stats;
    if (status in stats) {
      stats[status] = count;
    }
    stats.total += count;
  }
  return stats;
}

export async function userHasAccess(projectId: string, userId: string): Promise<boolean> {
  const project = await db('projects').where({ id: projectId }).first();
  if (!project) return false;
  if (project.owner_id === userId) return true;

  // Check if user has tasks assigned in this project
  const task = await db('tasks')
    .where({ project_id: projectId, assignee_id: userId })
    .first();
  return !!task;
}
