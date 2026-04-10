import db from '../db/db';

export interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export async function findByEmail(email: string): Promise<UserRow | undefined> {
  return db('users').where({ email }).first();
}

export async function findById(id: string): Promise<UserRow | undefined> {
  return db('users').where({ id }).first();
}

export async function create(data: {
  name: string;
  email: string;
  password_hash: string;
}): Promise<UserRow> {
  const [user] = await db('users').insert(data).returning('*');
  return user;
}
