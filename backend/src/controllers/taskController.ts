import { Request, Response, NextFunction } from 'express';
import * as Task from '../models/Task';
import * as Project from '../models/Project';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export async function listByProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const projectId = req.params.id as string;

    const project = await Project.findById(projectId);
    if (!project) throw new NotFoundError('Project');

    const hasAccess = await Project.userHasAccess(projectId, userId);
    if (!hasAccess) throw new ForbiddenError();

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filters = {
      status: req.query.status as string | undefined,
      assignee: req.query.assignee as string | undefined,
    };

    const { data, total } = await Task.findByProject(projectId, filters, page, limit);

    res.json({
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

// Only project owners can create tasks — assignees have read access only (by design)
export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const projectId = req.params.id as string;

    const project = await Project.findById(projectId);
    if (!project) throw new NotFoundError('Project');
    if (project.owner_id !== userId) throw new ForbiddenError();

    const task = await Task.create({
      ...req.body,
      project_id: projectId,
    });

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const task = await Task.findById(req.params.id as string);
    if (!task) throw new NotFoundError('Task');

    const project = await Project.findById(task.project_id);
    if (!project) throw new NotFoundError('Project');

    // Access control: project owner OR task assignee can update
    // Non-owner/non-assignee who merely has other tasks assigned → 403
    const isOwner = project.owner_id === userId;
    const isAssignee = task.assignee_id === userId;
    if (!isOwner && !isAssignee) throw new ForbiddenError();

    // updated_at auto-set by PG trigger
    const updated = await Task.update(task.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const task = await Task.findById(req.params.id as string);
    if (!task) throw new NotFoundError('Task');

    const project = await Project.findById(task.project_id);
    if (!project) throw new NotFoundError('Project');

    // Project owner only can delete (not assignee, not other members)
    if (project.owner_id !== userId) throw new ForbiddenError();

    await Task.remove(task.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
