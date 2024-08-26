import type { Context } from 'hono';
import { TaskPayloadSchema, TaskUpdatePayloadSchema } from '../types/tasks';
import dbClient from '../utils/db';
import { ObjectId } from 'mongodb';
import { deleteTask } from '../utils/helpers';

export default class TasksController {
  static async getTasks(c: Context) {
    const projectId = c.get('projectId') as string;

    const tasks = await dbClient.projects
      ?.aggregate([
        { $match: { _id: new ObjectId(projectId) } },
        {
          $lookup: {
            from: 'tasks',
            localField: 'tasks',
            foreignField: '_id',
            as: 'tasks',
          },
        },
        { $unwind: '$tasks' },
        { $replaceRoot: { newRoot: '$tasks' } },
        {
          $lookup: {
            from: 'checklists',
            localField: 'checklists',
            foreignField: '_id',
            as: 'checklists',
            pipeline: [
              {
                $lookup: {
                  from: 'checklistItems',
                  localField: 'items',
                  foreignField: '_id',
                  as: 'items',
                  pipeline: [{ $set: { id: '$_id' } }, { $unset: '_id' }],
                },
              },
              { $set: { id: '$_id' } },
              { $unset: '_id' },
            ],
          },
        },
        { $set: { id: '$_id' } },
        { $unset: '_id' },
      ])
      .toArray();

    return c.json(tasks);
  }

  static async createTask(c: Context) {
    const projectId = c.get('projectId') as string;

    // validate payload
    const payload = await c.req.json();
    const payloadValidationResult = TaskPayloadSchema.safeParse(payload);

    if (!payloadValidationResult.success) {
      return c.json(
        {
          error: 'invalid create task payload',
          validations: payloadValidationResult.error.errors,
        },
        400,
      );
    }

    // create task
    const task = payloadValidationResult.data;
    const insertTaskResult = await dbClient.tasks?.insertOne({
      ...task,
      createdAt: new Date(),
      isArchived: false,
      checklists: [],
    });

    if (!insertTaskResult?.acknowledged) {
      return c.json({ error: 'failed to create task' }, 500);
    }

    // add task to project
    const updateProjectResult = await dbClient.projects?.updateOne(
      { _id: new ObjectId(projectId) },
      { $push: { tasks: insertTaskResult.insertedId } },
    );

    if (!updateProjectResult?.acknowledged) {
      return c.json({ error: 'failed to add task to project' }, 500);
    }

    return c.json({ taskId: insertTaskResult.insertedId }, 201);
  }

  static async updateTask(c: Context) {
    const taskId = c.get('taskId') as string;

    // validate payload
    const payload = await c.req.json();
    const payloadValidationResult = TaskUpdatePayloadSchema.safeParse(payload);

    if (!payloadValidationResult.success) {
      return c.json(
        {
          error: 'invalid update task payload',
          validations: payloadValidationResult.error.errors,
        },
        400,
      );
    }

    // update task
    const updateResult = await dbClient.tasks?.updateOne(
      { _id: new ObjectId(taskId) },
      { $set: payloadValidationResult.data as { [key: string]: any } },
    );

    if (!updateResult?.acknowledged) {
      return c.json({ error: 'failed to update task' }, 500);
    }

    return c.json({ updated: updateResult.modifiedCount }, 200);
  }

  static async deleteTask(c: Context) {
    const taskId = c.get('taskId') as string;
    const projectId = c.get('projectId') as string;

    const isDeleted = await deleteTask(new ObjectId(taskId));
    if (!isDeleted) {
      return c.json({ error: 'Failed to delete a task' }, 500);
    }

    const projectUpdateResult = await dbClient.projects?.updateOne(
      { _id: new ObjectId(projectId) },
      { $pull: { tasks: new ObjectId(taskId) } },
    );

    if (!projectUpdateResult?.acknowledged) {
      return c.json({ error: 'failed to remove task from project' }, 500);
    }

    return c.json({ deleted: 1 });
  }

  static async setArchived(c: Context) {
    const taskId = c.get('taskId') as string;

    const updateResult = await dbClient.tasks?.updateOne(
      { _id: new ObjectId(taskId) },
      { $set: { isArchived: true } },
    );

    if (!updateResult?.acknowledged) {
      return c.json({ error: 'failed to set task as archived' }, 500);
    }

    return c.json({ updated: updateResult.modifiedCount }, 200);
  }

  static async unsetArchived(c: Context) {
    const taskId = c.get('taskId') as string;

    const updateResult = await dbClient.tasks?.updateOne(
      { _id: new ObjectId(taskId) },
      { $set: { isArchived: false } },
    );

    if (!updateResult?.acknowledged) {
      return c.json({ error: 'failed to set task as archived' }, 500);
    }

    return c.json({ updated: updateResult.modifiedCount }, 200);
  }
}
