import { Context, Next } from 'hono';
import { ObjectId } from 'mongodb';
import dbClient from '@utils/db';
import { guardUsageValidator } from './utils';

export function TaskGuard() {
  return async (c: Context, next: Next) => {
    const taskId = guardUsageValidator('taskId', c);
    if (!taskId) {
      return c.json({ error: 'invalid task id' }, 400);
    }

    const task = await dbClient.tasks?.findOne({
      _id: new ObjectId(taskId),
    });

    // validate if task exists
    if (!task) {
      return c.json({ error: 'Task Not Found' }, 404);
    }

    c.set('taskId', taskId);
    c.set('task', task);

    return next();
  };
}

export function ChecklistGuard() {
  return async (c: Context, next: Next) => {
    const checklistId = guardUsageValidator('checklistId', c);

    if (!checklistId) {
      return c.json({ error: 'Invalid checklist ID' }, 400);
    }

    const checklist = await dbClient.checklists?.findOne({
      _id: new ObjectId(checklistId),
    });

    // validate if checklist exists
    if (!checklist) {
      return c.json({ error: 'Checklist Not Found' }, 404);
    }

    c.set('checklistId', checklistId);
    c.set('checklist', checklist);

    return next();
  };
}

export function ChecklistItemGuard() {
  return async (c: Context, next: Next) => {
    const itemId = guardUsageValidator('itemId', c);
    if (!itemId) {
      return c.json({ error: 'invalid item id' }, 400);
    }

    const item = await dbClient.checklistItems?.findOne({
      _id: new ObjectId(itemId),
    });

    // validate if item exists
    if (!item) {
      return c.json({ error: 'Checklist Item Not Found' }, 404);
    }

    c.set('itemId', itemId);
    c.set('item', item);

    return next();
  };
}
