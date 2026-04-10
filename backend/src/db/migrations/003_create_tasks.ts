import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('tasks', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title', 255).notNullable();
    table.text('description').nullable();
    table
      .string('status', 20)
      .notNullable()
      .defaultTo('todo')
      .checkIn(['todo', 'in_progress', 'done']);
    table
      .string('priority', 10)
      .notNullable()
      .defaultTo('medium')
      .checkIn(['low', 'medium', 'high']);
    table.uuid('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE');
    table.uuid('assignee_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('due_date', { useTz: true }).nullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index('project_id', 'tasks_project_id_idx');
    table.index('assignee_id', 'tasks_assignee_id_idx');
    table.index('status', 'tasks_status_idx');
  });

  // PostgreSQL trigger for auto-updating updated_at — reliable across bulk updates and raw queries
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await knex.raw(`
    CREATE TRIGGER set_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP TRIGGER IF EXISTS set_tasks_updated_at ON tasks');
  await knex.raw('DROP FUNCTION IF EXISTS update_updated_at_column');
  await knex.schema.dropTableIfExists('tasks');
}
