import { Request, Response, NextFunction } from 'express';
import * as Project from '../models/Project';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const { data, total } = await Project.findAccessibleByUser(userId, page, limit);

    res.json({
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { name, description } = req.body;

    const project = await Project.create({ name, description, owner_id: userId });
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const project = await Project.findById(req.params.id as string);
    if (!project) throw new NotFoundError('Project');

    const hasAccess = await Project.userHasAccess(project.id, userId);
    if (!hasAccess) throw new ForbiddenError();

    res.json(project);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const project = await Project.findById(req.params.id as string);
    if (!project) throw new NotFoundError('Project');
    if (project.owner_id !== userId) throw new ForbiddenError();

    const updated = await Project.update(project.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const project = await Project.findById(req.params.id as string);
    if (!project) throw new NotFoundError('Project');
    if (project.owner_id !== userId) throw new ForbiddenError();

    // Cascade handled at DB level (FK ON DELETE CASCADE)
    await Project.remove(project.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// BONUS: Stats endpoint — provides project-level task summary without fetching all tasks
export async function getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const project = await Project.findById(req.params.id as string);
    if (!project) throw new NotFoundError('Project');

    const hasAccess = await Project.userHasAccess(project.id, userId);
    if (!hasAccess) throw new ForbiddenError();

    const stats = await Project.getStats(project.id);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}
