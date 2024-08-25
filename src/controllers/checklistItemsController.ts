import type { Context } from 'hono';
import dbClient from '../utils/db';
import { ObjectId } from 'mongodb';
import { ChecklistItemPayloadSchema } from '../types/tasks';

export default class ChecklistItemsController {
  static async createItem(c: Context) {
    const checklistId = c.get('checklistId') as string;

    // validate payload
    const payload = await c.req.json();
    const payloadValidationResult =
      ChecklistItemPayloadSchema.safeParse(payload);

    if (!payloadValidationResult.success) {
      return c.json(
        {
          error: 'invalid create checklist item payload',
          validations: payloadValidationResult.error.errors,
        },
        400,
      );
    }

    // create checklist item
    const checklistItem = payloadValidationResult.data;
    const insertChecklistItemResult = await dbClient.checklistItems?.insertOne({
      ...checklistItem,
      isChecked: false,
    });

    if (!insertChecklistItemResult?.acknowledged) {
      return c.json({ error: 'failed to create checklist item' }, 500);
    }

    // add checklist item to checklist
    const updateChecklistResult = await dbClient.checklists?.updateOne(
      { _id: new ObjectId(checklistId) },
      { $push: { items: insertChecklistItemResult.insertedId } },
    );

    if (!updateChecklistResult?.acknowledged) {
      return c.json(
        { error: 'failed to add checklist item to checklist' },
        500,
      );
    }

    return c.json(
      { checklistItemId: insertChecklistItemResult.insertedId },
      201,
    );
  }

  static async updateItem(c: Context) {
    const checklistItemId = c.get('checklistItemId') as string;

    // validate payload
    const payload = await c.req.json();
    const payloadValidationResult =
      ChecklistItemPayloadSchema.safeParse(payload);

    if (!payloadValidationResult.success) {
      return c.json(
        {
          error: 'invalid update checklist item payload',
          validations: payloadValidationResult.error.errors,
        },
        400,
      );
    }

    // update checklist item
    const updateResult = await dbClient.checklistItems?.updateOne(
      { _id: new ObjectId(checklistItemId) },
      { $set: payloadValidationResult.data as { [key: string]: any } },
    );

    if (!updateResult?.acknowledged) {
      return c.json({ error: 'failed to update checklist item' }, 500);
    }

    return c.json({ updated: updateResult.modifiedCount }, 200);
  }

  static async deleteItem(c: Context) {
    const checklistId = c.get('checklistId') as string;
    const itemId = c.get('itemId') as string;

    // delete item from checklist
    const deleteResult = await dbClient.checklists?.updateOne(
      { _id: new ObjectId(checklistId) },
      { $pull: { items: new ObjectId(itemId) } },
    );

    if (!deleteResult?.acknowledged) {
      return c.json('failed to remove item from checklist', 500);
    }

    // delete item
    const deleteItemResult = await dbClient.checklistItems?.deleteOne({
      _id: new ObjectId(itemId),
    });

    if (!deleteItemResult?.acknowledged) {
      return c.json('failed to remove item', 500);
    }

    return c.json({ deleted: true }, 200);
  }

  static async checkItem(c: Context) {
    const itemId = c.get('itemId') as string;

    const updateResult = await dbClient.checklistItems?.updateOne(
      { _id: new ObjectId(itemId) },
      { $set: { isChecked: true } },
    );

    if (!updateResult?.acknowledged) {
      return c.json({ error: 'failed to set checklist item as checked' }, 500);
    }

    return c.json({ updated: updateResult.modifiedCount }, 200);
  }

  static async uncheckItem(c: Context) {
    const itemId = c.get('itemId') as string;

    const updateResult = await dbClient.checklistItems?.updateOne(
      { _id: new ObjectId(itemId) },
      { $set: { isChecked: false } },
    );

    if (!updateResult?.acknowledged) {
      return c.json(
        { error: 'failed to set checklist item as unchecked' },
        500,
      );
    }

    return c.json({ updated: updateResult.modifiedCount }, 200);
  }
}
