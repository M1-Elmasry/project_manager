import { Context, Next } from 'hono';
import { GuardOptions } from './utils';
import { isValidObjectId } from '../utils/helpers';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';

export function ProjectGuard(options: GuardOptions = {}) {
  return async (c: Context, next: Next) => {
    const userId: string | undefined = c.get('userId');

    if (!userId) {
      throw new Error('Must be used after verifyToken middleware');
    }

    const projectId: string = c.req.param('projectId');
    //if (!projectId) {
    //  throw new Error('please add projectId param to the route path');
    //}

    if (!isValidObjectId(projectId)) {
      return c.json({ error: 'Invalid project ID' }, 400);
    }

    const project = await dbClient.projects?.findOne({
      _id: new ObjectId(projectId),
    });

    // validate if project exists
    if (!project) {
      return c.json({ error: 'Project Not Found' }, 404);
    }

    // validate if user is a member
    if (!project.members.find((oId) => oId.toString() === userId)) {
      return c.json({ error: 'Project Not Found' }, 404);
    }

    // validate if user is an owner
    if (options.onlyOwner && project.owner.toString() !== userId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    c.set('projectId', projectId);
    c.set('project', project);
    c.set('projectOwnerId', project.owner.toString());
    c.set('isProjectOwner', project.owner.toString() === userId);

    return next();
  };
}
