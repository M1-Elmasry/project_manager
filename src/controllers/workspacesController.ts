import { Context } from 'hono';
import { Workspace, WorkspacePayloadSchema } from '../types/workspaces';
import dbClient from '../utils/db';
import { ObjectId } from 'mongodb';

class WorkspaceController {
  // CRUD //

  static getAllJoinedWorkspaces(c: Context) {}

  static async getWorkspace(c: Context) {
    const userId = c.get('userId') as string;
    const workspaceId = c.get('workspaceId');
    const workspace = c.get('workspace') as Workspace;
    const isOwner = c.get('isWorkspaceOwner') as boolean;

    const owner = await dbClient.users?.findOne({ _id: new ObjectId(userId) });

    return {
      id: workspaceId,
      name: workspace.name,
      description: workspace.description,
      isOwner,
      owner: {
        id: userId,
        username: owner?.username,
        email: owner?.email,
      },
    };
  }

  static async createWorkspace(c: Context) {
    const userId = c.get('userId') as string;
    const parseResults = WorkspacePayloadSchema.safeParse(c.req.json());
    if (!parseResults.success) {
      return c.res.json();
    }

    const { name, description } = parseResults.data;

    const result = await dbClient.workspaces?.insertOne({
      name,
      description,
      owner: new ObjectId(userId),
      members: [new ObjectId(userId)],
      projects: [],
    });

    if (result?.acknowledged) {
      return c.json({ workspaceId: result.insertedId }, 201);
    }

    return c.json({ error: 'failed to create a workspace' }, 500);
  }

  static async deleteWorkspace(c: Context) {
    const workspaceId = c.get('workspaceId') as string;
    const results = await dbClient.workspaces?.deleteOne({
      _id: new ObjectId(workspaceId),
    });

    if (results?.acknowledged) {
      return c.json({}, 204);
    }

    return c.json({ error: 'failed to delete a workspace' }, 500);
  }

  static updateWorkspace(c: Context) {}

  // members //

  static getWorkspaceMembers(c: Context) {}

  static async addMembers(c: Context) {
    const workspaceId = c.get('workspaceId') as string;
    const { members } = await c.req.json();

    if (!members || Array.isArray(members) || members.length === 0) {
      return c.json({ error: 'members is required' }, 400);
    }

    const results = await dbClient.workspaces?.updateOne(
      { _id: new ObjectId(workspaceId) },
      {
        $addToSet: {
          members: { $each: members.map((mId: string) => new ObjectId(mId)) },
        },
      },
    );

    if (results?.acknowledged && results.modifiedCount > 0) {
      return c.json({ state: 'ok' }, 200);
    }

    return c.json({ error: 'failed to add members' }, 500);
  }

  static async deleteMembers(c: Context) {
    const workspaceId = c.get('workspaceId') as string;
    const { members } = await c.req.json();

    if (!members || Array.isArray(members) || members.length === 0) {
      return c.json({ error: 'members is required' }, 400);
    }

    const memberIds: ObjectId[] = members.map(
      (mId: string) => new ObjectId(mId),
    );

    const results = await dbClient.workspaces?.updateOne(
      { _id: new ObjectId(workspaceId) },
      {
        $pull: {
          members: {
            $in: memberIds,
          },
        },
      },
    );

    if (results?.acknowledged && results.modifiedCount > 0) {
      return c.json({ state: 'ok' }, 200);
    }

    return c.json({ error: 'failed to remove members' }, 500);
  }

  // projects //

  static getWorkspaceProjects(c: Context) {}
}

export default WorkspaceController;
