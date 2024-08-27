import { Context } from 'hono';
import {
  Workspace,
  WorkspaceAddMemberSchema,
  WorkspacePayloadSchema,
  WorkspaceUpdatePayloadSchema,
} from '../types/workspaces';
import dbClient from '../utils/db';
import { ObjectId, WithId } from 'mongodb';
import { isValidObjectId, deleteWorkspace } from '../utils/helpers';

class WorkspaceController {
  // CRUD //

  static async getAllJoinedWorkspaces(c: Context) {
    const userId = c.get('userId') as string;

    const workspaces = await dbClient.workspaces
      ?.aggregate([
        { $match: { members: new ObjectId(userId) } },
        {
          $lookup: {
            from: 'users',
            localField: 'owner',
            foreignField: '_id',
            as: 'owner',
          },
        },
        { $unwind: '$owner' },
        {
          $addFields: {
            id: '$_id',
            owner: { id: '$owner._id' },
            isOwner: { $eq: ['$owner._id', new ObjectId(userId)] },
          },
        },
        {
          $project: {
            _id: 0,
            owner: { _id: 0, password: 0 },
            members: 0,
            projects: 0,
          },
        },
      ])
      .toArray();

    return c.json(workspaces);
  }

  static async getWorkspace(c: Context) {
    const userId = c.get('userId') as string;
    const workspaceId = c.get('workspaceId');
    const workspace = c.get('workspace') as Workspace;
    const isOwner = c.get('isWorkspaceOwner') as boolean;

    const owner = await dbClient.users?.findOne({ _id: new ObjectId(userId) });

    return c.json({
      id: workspaceId,
      name: workspace.name,
      description: workspace.description,
      isOwner,
      owner: {
        id: userId,
        username: owner?.username,
        email: owner?.email,
      },
    });
  }

  static async createWorkspace(c: Context) {
    const userId = c.get('userId') as string;
    const parseResults = WorkspacePayloadSchema.safeParse(await c.req.json());

    if (!parseResults.success) {
      return c.json(
        {
          error: 'invalid workspace payload',
          validations: parseResults.error.errors,
        },
        400,
      );
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

    const isDeleted = await deleteWorkspace(new ObjectId(workspaceId));

    if (!isDeleted) {
      return c.json({ error: 'failed to delete a workspace' }, 500);
    }

    return c.json({ deleted: 1 }, 200);
  }

  static async updateWorkspace(c: Context) {
    const workspaceId = c.get('workspaceId') as string;
    const parseResults = WorkspaceUpdatePayloadSchema.safeParse(
      await c.req.json(),
    );

    if (!parseResults.success) {
      return c.json(
        {
          error: 'invalid update workspace payload',
          validations: parseResults.error.errors,
        },
        400,
      );
    }

    const changes = parseResults.data as { [key: string]: any };

    // if no changes do nothing
    if (Object.keys(changes).length === 0) {
      return c.json({ updated: 0 }, 200);
    }

    const updateResults = await dbClient.workspaces?.updateOne(
      {
        _id: new ObjectId(workspaceId),
      },
      {
        $set: changes,
      },
    );

    if (updateResults?.acknowledged) {
      return c.json({ updated: updateResults?.modifiedCount }, 200);
    }

    return c.json({ error: 'failed to update workspace' }, 500);
  }

  static async changeOwner(c: Context) {
    const workspaceId = c.get('workspaceId') as string;
    const { newOwnerId } = await c.req.json();

    if (
      !newOwnerId ||
      typeof newOwnerId !== 'string' ||
      !isValidObjectId(newOwnerId)
    ) {
      return c.json({ error: 'newOwnerId is missing or invalid' }, 400);
    }

    const updateResults = await dbClient.workspaces?.updateOne(
      {
        _id: new ObjectId(workspaceId),
        members: new ObjectId(newOwnerId as string),
      },
      {
        $set: {
          owner: new ObjectId(newOwnerId as string),
        },
      },
    );

    if (updateResults?.acknowledged && updateResults?.modifiedCount > 0) {
      return c.json({ updated: updateResults?.modifiedCount || 0 }, 200);
    }

    return c.json({ error: 'failed to change workspace owner' }, 500);
  }

  // members //

  static async getWorkspaceMembers(c: Context) {
    const workspaceId = c.get('workspaceId') as string;
    const workspaceOwnerId = c.get('workspaceOwnerId') as string;

    console.log(workspaceId, workspaceOwnerId);

    const members = await dbClient.workspaces
      ?.aggregate([
        {
          $match: { _id: new ObjectId(workspaceId) },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'members',
            foreignField: '_id',
            as: 'members',
          },
        },
        {
          $unwind: '$members',
        },
        {
          $replaceRoot: { newRoot: '$members' },
        },
        {
          $set: {
            id: '$_id',
            isOwner: { $eq: ['$_id', new ObjectId(workspaceOwnerId)] },
          },
        },
        { $unset: ['_id', 'password'] },
      ])
      .toArray();

    if (!members) {
      return c.json({ error: 'failed to get workspace members' }, 500);
    }

    return c.json(members);
  }

  static async addMember(c: Context) {
    const workspaceId = c.get('workspaceId') as string;
    const workspace = c.get('workspace') as WithId<Workspace>;
    const payload = await c.req.json();
    const payloadValidationResult = WorkspaceAddMemberSchema.safeParse(payload);

    if (!payloadValidationResult.success) {
      return c.json(
        {
          error: 'invalid workspace add member payload',
          validations: payloadValidationResult.error.errors,
        },
        400,
      );
    }

    const user = await dbClient.users?.findOne({
      email: payloadValidationResult.data.email,
    });

    if (!user) {
      return c.json({ error: 'no user found with the same email' }, 404);
    }

    if (workspace.members.some((member) => member.equals(user._id))) {
      return c.json(
        { error: "user aleady exists in this worksapce's members" },
        400,
      );
    }

    const results = await dbClient.workspaces?.updateOne(
      { _id: new ObjectId(workspaceId) },
      { $addToSet: { members: user._id } },
    );

    if (results?.acknowledged) {
      return c.json({
        addedUser: { id: user._id, username: user.username, email: user.email }
      });
    }

    return c.json({ error: 'failed to add member to workspace' }, 500);
  }

  static async deleteMembers(c: Context) {
    const workspaceId = c.get('workspaceId') as string;
    const workspaceOwnerId = c.get('workspaceOwnerId') as string;
    const { members } = await c.req.json();

    console.log(typeof members, members);
    if (!members || !Array.isArray(members) || members.length === 0) {
      return c.json({ error: 'members field is required' }, 400);
    }

    const memberIds: ObjectId[] = members
      .filter((mId: string) => isValidObjectId(mId) && mId !== workspaceOwnerId)
      .map((mId: string) => new ObjectId(mId));

    const results = await dbClient.workspaces?.updateOne(
      { _id: new ObjectId(workspaceId) },
      // @ts-ignore
      { $pull: { members: { $in: memberIds } } },
    );

    if (results?.acknowledged) {
      return c.json({ deleted: results?.modifiedCount || 0 }, 200);
    }

    return c.json({ error: 'failed to remove members' }, 500);
  }
}

export default WorkspaceController;
