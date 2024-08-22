import { Context } from 'hono';
import {
  ProjectDocument,
  ProjectPayloadSchema,
  ProjectUpdatePayloadSchema,
} from '../types/projects';
import dbClient from '../utils/db';
import { ObjectId, WithId } from 'mongodb';
import { Workspace } from '../types/workspaces';
import { isValidObjectId, deleteProjectComponents } from '../utils/helpers';

export default class ProjectsControllers {
  static async getAllJoinedProjects(c: Context) {
    const userId = c.get('userId') as string;
    const projects = (await dbClient.workspaces
      ?.aggregate([
        { $match: { members: new ObjectId(userId) } },
        {
          $lookup: {
            from: 'projects',
            localField: 'projects',
            foreignField: '_id',
            as: 'project',
            pipeline: [
              {
                $lookup: {
                  from: 'users',
                  localField: 'owner',
                  foreignField: '_id',
                  as: 'owner',
                  pipeline: [
                    { $set: { id: '$_id' } },
                    { $unset: ['_id', 'password'] },
                  ],
                },
              },
              { $unwind: '$owner' },
            ],
          },
        },
        {
          $unwind: '$project',
        },
        {
          $project: {
            _id: 0,
            id: '$project._id',
            name: '$project.name',
            description: '$project.description',
            deadline: '$project.deadline',
            owner: '$project.owner',
            all_states: '$project.all_states',
            all_labels: '$project.all_labels',
            created_at: '$project.created_at',
            isOwner: { $eq: [new ObjectId(userId), '$project.owner.id'] },
          },
        },
      ])
      .toArray()) as WithId<ProjectDocument>[];

    return c.json(projects, 200);
  }

  static async createProject(c: Context) {
    const userId = c.get('userId') as string;
    const payload = await c.req.json();
    const parseResults = ProjectPayloadSchema.safeParse(payload);
    if (!parseResults.success) {
      return c.json(
        {
          error: 'invalid project payload',
          validations: parseResults.error.errors,
        },
        400,
      );
    }

    const { name, description, deadline } = parseResults.data;

    const insertedProject = await dbClient.projects?.insertOne({
      name,
      description: description ?? '',
      deadline,
      owner: new ObjectId(userId),
      members: [new ObjectId(userId)],
      all_states: [],
      all_labels: [],
      tasks: [],
      notes: [],
      questions: [],
      created_at: new Date(),
    });
    if (!insertedProject?.acknowledged) {
      return c.json({ error: 'failed to create a project' }, 500);
    }

    const workspace = c.get('workspace');

    const result = await dbClient.workspaces?.updateOne(
      { _id: workspace._id },
      { $push: { projects: insertedProject.insertedId } },
    );

    if (!result?.modifiedCount) {
      return c.json(
        { error: 'failed to add project to current workspace' },
        500,
      );
    }

    return c.json({ projectId: insertedProject.insertedId }, 201);
  }

  static async getProject(c: Context) {
    const userId = c.get('userId') as string;
    const projectId = c.get('projectId') as string;
    const project = c.get('project') as Partial<WithId<ProjectDocument>>;
    const owner = await dbClient.users?.findOne({ _id: new ObjectId(userId) });
    const isOwner = c.get('isProjectOwner');

    delete project._id;
    delete project.members;
    delete project.tasks;
    delete project.notes;
    delete project.questions;

    return c.json(
      {
        id: projectId,
        ...project,
        isOwner,
        // override owner property in project to be owner obj instead of id
        owner: {
          id: owner?._id,
          username: owner?.username,
          email: owner?.email,
        },
      },
      200,
    );
  }

  static async updateProject(c: Context) {
    const project = c.get('project');
    const parseResults = ProjectUpdatePayloadSchema.safeParse(
      await c.req.json(),
    );

    if (!parseResults.success) {
      return c.json(
        {
          error: 'invalid update project payload',
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

    const updateResults = await dbClient.projects?.updateOne(
      {
        _id: project._id,
      },
      {
        $set: changes,
      },
    );

    if (updateResults?.acknowledged) {
      return c.json({ updated: updateResults?.modifiedCount }, 200);
    }

    return c.json({ error: 'failed to update project' }, 500);
  }

  static async deleteProject(c: Context) {
    const projectId = c.get('projectId') as string;
    const project = c.get('project') as WithId<ProjectDocument>;
    const workspace = c.get('workspace') as WithId<Workspace>;

    try {
      await deleteProjectComponents(project);
    } catch (err) {
      return c.json({ error: (err as Error).message }, 500);
    }

    const updateResult = await dbClient.workspaces?.updateOne(
      { _id: workspace._id },
      { $pull: { projects: project._id } },
    );

    if (!updateResult?.acknowledged) {
      return c.json({ error: 'failed to remove project from workspace' }, 500);
    }

    const deleteResult = await dbClient.projects?.deleteOne({
      _id: new ObjectId(projectId),
    });

    if (!deleteResult?.acknowledged) {
      return c.json({ error: 'failed to remove a project' }, 500);
    }

    return c.json({ deleted: deleteResult?.deletedCount }, 200);
  }

  static async addMembers(c: Context) {
    const projectId = c.get('projectId') as string;
    const { members } = await c.req.json();

    if (!members || !Array.isArray(members) || members.length === 0) {
      return c.json({ error: 'members field is required' }, 400);
    }

    const memberIds: ObjectId[] = members
      .filter((mId: string) => isValidObjectId(mId))
      .map((mId: string) => new ObjectId(mId));

    const results = await dbClient.projects?.updateOne(
      { _id: new ObjectId(projectId) },
      { $addToSet: { members: { $each: memberIds } } },
    );

    if (results?.acknowledged) {
      return c.json({ state: 'ok', added: results?.modifiedCount || 0 }, 200);
    }

    return c.json({ error: 'failed to add members' }, 500);
  }

  static async getMembers(c: Context) {
    const projectId = c.get('projectId') as string;
    const members = await dbClient.projects
      ?.aggregate([
        {
          $match: { _id: new ObjectId(projectId) },
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
      return c.json({ error: 'failed to get project members' }, 500);
    }

    return c.json(members);
  }

  static async deleteMembers(c: Context) {
    const projectId = c.get('projectId') as string;
    const projectOwnerId = c.get('projectOwnerId') as string;
    const { members } = await c.req.json();

    console.log(typeof members, members);
    if (!members || !Array.isArray(members) || members.length === 0) {
      return c.json({ error: 'members field is required' }, 400);
    }

    const memberIds: ObjectId[] = members
      .filter((mId: string) => isValidObjectId(mId) && mId !== projectOwnerId)
      .map((mId: string) => new ObjectId(mId));

    console.log('to delete:', memberIds);

    const results = await dbClient.projects?.updateOne(
      { _id: new ObjectId(projectId) },
      // @ts-ignore
      { $pull: { members: { $in: memberIds } } },
    );

    if (results?.acknowledged) {
      return c.json({ state: 'ok', deleted: results?.modifiedCount || 0 }, 200);
    }

    return c.json({ error: 'failed to remove members' }, 500);
  }
}
