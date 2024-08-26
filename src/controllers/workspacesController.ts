import { Context } from 'hono';
import {
  Workspace,
  WorkspacePayloadSchema,
  WorkspaceUpdatePayloadSchema,
} from '../types/workspaces';
import dbClient from '../utils/db';
import { ObjectId } from 'mongodb';
import {
  isValidObjectId,
  //deleteProjectComponents,
  deleteWorkspace,
} from '../utils/helpers';

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
          $addFields: {
            id: '$_id',
          },
        },
        {
          $project: {
            _id: 0,
            password: 0,
          },
        },
      ])
      .toArray();

    if (!members) {
      return c.json({ error: 'failed to get workspace members' }, 500);
    }

    return c.json(members);
  }

  static async addMembers(c: Context) {
    const workspaceId = c.get('workspaceId') as string;
    const { membersEmails } = await c.req.json();

    if (!membersEmails || !Array.isArray(membersEmails) || membersEmails.length === 0) {
      return c.json({ error: 'members field is required' }, 400);
    }

    const members = await dbClient.users
      ?.find({ $in: membersEmails })
      .toArray();

    if (!members || members.length === 0) {
      return c.json({error: "email(s) not found"}, 400);
    } 

    const foundEmails = members.map((member) => member.email);

    const notFoundEmails = membersEmails.filter(
      (email) => !foundEmails.includes(email),
    );

    if (!notFoundEmails) {
      return c.json({error: "some emails not found", notFoundEmails}, 400);
    }

    const membersIds = members.map((member) => member._id);

    const results = await dbClient.workspaces?.updateOne(
      { _id: new ObjectId(workspaceId) },
      { $addToSet: { members: { $each: membersIds } } },
    );

    if (results?.acknowledged) {
      return c.json({ state: 'ok', added: results?.modifiedCount || 0 }, 200);
    }

    return c.json({ error: 'failed to add members' }, 500);
  }

  static async deleteMembers(c: Context) {
    const workspaceId = c.get('workspaceId') as string;
    //const workspaceOwnerId = c.get('workspaceOwnerId') as string;
    const { membersEmails } = await c.req.json();

    if (!membersEmails || !Array.isArray(membersEmails) || membersEmails.length === 0) {
      return c.json({ error: 'members field is required' }, 400);
    }

    const members = await dbClient.users
      ?.find({ $in: membersEmails })
      .toArray();

    if (!members || members.length === 0) {
      return c.json({error: "email(s) not found"}, 400);
    } 

    const foundEmails = members.map((member) => member.email);

    const notFoundEmails = membersEmails.filter(
      (email) => !foundEmails.includes(email),
    );

    if (!notFoundEmails) {
      return c.json({error: "some emails not found", notFoundEmails}, 400);
    }

    const membersIds = members.map((member) => member._id);

    //const memberIds: ObjectId[] = members
    //  .filter((mId: string) => isValidObjectId(mId) && mId !== workspaceOwnerId)
    //  .map((mId: string) => new ObjectId(mId));

    console.log('to delete:', membersIds);

    const results = await dbClient.workspaces?.updateOne(
      { _id: new ObjectId(workspaceId) },
      // @ts-ignore
      { $pull: { members: { $in: membersIds } } },
    );

    if (results?.acknowledged) {
      return c.json({ state: 'ok', deleted: results?.modifiedCount || 0 }, 200);
    }

    return c.json({ error: 'failed to remove members' }, 500);
  }
}

export default WorkspaceController;
