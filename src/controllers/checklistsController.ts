import { ChecklistPayloadSchema } from '@typing/tasks';
import dbClient from '@utils/db';
import { ObjectId } from 'mongodb';
import { deleteChecklist } from '@utils/helpers';
import type { Context } from 'hono';

export default class ChecklistsController {
  static async createChecklist(c: Context) {
    const taskId = c.get('taskId') as string;

    // validate payload
    const payload = await c.req.json();
    const payloadValidationResult = ChecklistPayloadSchema.safeParse(payload);

    if (!payloadValidationResult.success) {
      return c.json(
        {
          error: 'invalid create checklist payload',
          validations: payloadValidationResult.error.errors,
        },
        400,
      );
    }

    // create checklist
    const checklist = payloadValidationResult.data;
    const insertChecklistResult = await dbClient.checklists?.insertOne({
      ...checklist,
      items: [],
    });

    if (!insertChecklistResult?.acknowledged) {
      return c.json({ error: 'failed to create checklist' }, 500);
    }

    // add checklist to task
    const updateTaskResult = await dbClient.tasks?.updateOne(
      { _id: new ObjectId(taskId) },
      { $push: { checklists: insertChecklistResult.insertedId } },
    );

    if (!updateTaskResult?.acknowledged) {
      return c.json({ error: 'failed to add checklist to task' }, 500);
    }

    return c.json({ checklistId: insertChecklistResult.insertedId }, 201);
  }

  static async updateChecklist(c: Context) {
    const checklistId = c.get('checklistId') as string;

    // validate payload
    const payload = await c.req.json();
    const payloadValidationResult = ChecklistPayloadSchema.safeParse(payload);

    if (!payloadValidationResult.success) {
      return c.json(
        {
          error: 'invalid update checklist payload',
          validations: payloadValidationResult.error.errors,
        },
        400,
      );
    }

    // update checklist
    const updateResult = await dbClient.checklists?.updateOne(
      { _id: new ObjectId(checklistId) },
      { $set: payloadValidationResult.data as { [key: string]: any } },
    );

    if (!updateResult?.acknowledged) {
      return c.json({ error: 'failed to update checklist' }, 500);
    }

    return c.json({ updated: updateResult.modifiedCount }, 200);
  }

  static async deleteChecklist(c: Context) {
    const checklistId = c.get('checklistId') as string;
    const taskId = c.get('taskId') as string;

    const isDeleted = await deleteChecklist(new ObjectId(checklistId));
    if (!isDeleted) {
      return c.json({ error: 'failed to delete a checklist' }, 500);
    }

    const updateTaskResult = await dbClient.tasks?.updateOne(
      { _id: new ObjectId(taskId) },
      { $pull: { checklists: new ObjectId(checklistId) } },
    );
    if (!updateTaskResult?.acknowledged) {
      return c.json({ error: 'failed to remove checklist from task' }, 500);
    }

    return c.json({ deleted: 1 });
  }
}
