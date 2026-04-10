import { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
  const passwordHash = await bcrypt.hash('password123', bcryptRounds);

  // Seed user — idempotent via onConflict
  const [user] = await knex('users')
    .insert({
      name: 'Test User',
      email: 'test@example.com',
      password_hash: passwordHash,
    })
    .onConflict('email')
    .ignore()
    .returning('*');

  // If user already exists, fetch them
  const seedUser = user || (await knex('users').where({ email: 'test@example.com' }).first());

  // Check if project already exists
  const existingProject = await knex('projects').where({ name: 'Demo Project', owner_id: seedUser.id }).first();
  if (existingProject) return;

  const [project] = await knex('projects')
    .insert({
      name: 'Demo Project',
      description: 'A sample project for testing TaskFlow features',
      owner_id: seedUser.id,
    })
    .returning('*');

  await knex('tasks').insert([
    {
      title: 'Design homepage',
      description: 'Create wireframes and mockups for the homepage',
      status: 'todo',
      priority: 'high',
      project_id: project.id,
      assignee_id: seedUser.id,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      title: 'Set up CI/CD',
      description: 'Configure GitHub Actions for automated testing and deployment',
      status: 'in_progress',
      priority: 'medium',
      project_id: project.id,
      assignee_id: seedUser.id,
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      title: 'Write documentation',
      description: 'Document API endpoints and setup instructions',
      status: 'done',
      priority: 'low',
      project_id: project.id,
      assignee_id: seedUser.id,
    },
  ]);
}
