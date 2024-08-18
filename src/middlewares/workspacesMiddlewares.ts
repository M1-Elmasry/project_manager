import type { Context, Next } from 'hono';
import dbClient from '../utils/db';
import { ObjectId } from 'mongodb';
import { isValidObjectId } from '../utils/helpers';
import { GuardOptions } from './utils';

// export interface WorkspaceGuardOptions {
//  onlyOwner?: boolean;
//}

/**
 * A middleware that checks if the user is a workspace member.
 *
 * You have to use it after {@link verifyToken} middleware, also make sure that
 * the route path contains `/:workspaceId` param, otherwise an error will be
 * thrown.
 *
 * If no workspace or the user is not a member, will respond with `404 Not Found`.
 * If the user is not permitted, will respond with `403 Forbidden`.
 *
 * If successful, will add `workspaceId`, `workspace` object, `isWorkspaceOwner`
 * and `workspaceOwnerId` to the context.
 *
 * To only allow the owner member, set the `options.onlyOwner` to **true**.
 */
export function WorkspaceGuard(options: GuardOptions = {}) {
  return async (c: Context, next: Next) => {
    const userId: string | undefined = c.get('userId');

    if (!userId) {
      throw new Error('Must be used after verifyToken middleware');
    }

    const workspaceId: string | undefined = c.req.param('workspaceId');
    if (!workspaceId) {
      throw new Error('please add workspaceId param to the route path');
    }

    if (!isValidObjectId(workspaceId)) {
      return c.json({ error: 'Invalid workspace ID' }, 400);
    }

    const workspace = await dbClient.workspaces?.findOne({
      _id: new ObjectId(workspaceId),
    });

    // validate if workspace exists
    if (!workspace) {
      return c.json({ error: 'Not Found' }, 404);
    }

    // validate if user is a member
    if (!workspace.members.find((oId) => oId.toString() === userId)) {
      return c.json({ error: 'Not Found' }, 404);
    }

    // validate if user is an owner
    if (options.onlyOwner && workspace.owner.toString() !== userId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    c.set('workspaceId', workspaceId);
    c.set('workspace', workspace);
    c.set('workspaceOwnerId', workspace.owner.toString());
    c.set('isWorkspaceOwner', workspace.owner.toString() === userId);

    return next();
  };
}
