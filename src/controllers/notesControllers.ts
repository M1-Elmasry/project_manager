import { Context } from 'hono';
import { NotePayloadSchema } from '../types/projects';
import dbClient from '../utils/db';
import { ObjectId } from 'mongodb';

export default class NotesController {
  static async createNote(c: Context) {
    const userId = c.get('userId') as string;
    const projectId = c.get('projectId') as string;
    const payload = await c.req.json();
    const parseResults = NotePayloadSchema.safeParse(payload);

    if (!parseResults.success) {
      return c.json(
        {
          error: 'invalid note payload',
          validations: parseResults.error.errors,
        },
        400,
      );
    }

    const { note } = parseResults.data;

    const insertedNote = await dbClient.notes?.insertOne({
      note,
      isPublic: false,
      author: new ObjectId(userId),
      created_at: new Date(),
    });

    if (!insertedNote?.acknowledged) {
      return c.json({ error: 'failed to create a note' }, 500);
    }

    const updateResult = await dbClient.projects?.updateOne(
      { _id: new ObjectId(projectId) },
      { $push: { notes: insertedNote.insertedId } },
    );

    if (!updateResult?.acknowledged) {
      return c.json({ error: 'failed to add the note to the project' }, 500);
    }

    return c.json({ noteId: insertedNote.insertedId }, 201);
  }

  static async getAllNotes(c: Context) {
    const userId = c.get('userId') as string;
    const projectId = c.get('projectId') as string;

    const notes = await dbClient.projects
      ?.aggregate([
        { $match: { _id: new ObjectId(projectId) } },
        {
          $lookup: {
            from: 'notes',
            localField: 'notes',
            foreignField: '_id',
            as: 'notes',
          },
        },
        { $unwind: '$notes' },
        { $replaceRoot: { newRoot: '$notes' } },
        {
          $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'author',
            pipeline: [
              { $set: { id: '$_id' } },
              { $unset: ['_id', 'password'] },
            ],
          },
        },
        { $unwind: '$author' },
        {
          $set: {
            id: '$_id',
            isAuthor: { $eq: [new ObjectId(userId), '$author.id'] },
          },
        },
        { $unset: '_id' },
        { $match: { $or: [{ isAuthor: true }, { isPublic: true }] } },
      ])
      .toArray();

    return c.json(notes);
  }

  static async updateNote(c: Context) {
    const noteId = c.get('noteId') as string;
    const payload = await c.req.json();
    const parseResults = NotePayloadSchema.safeParse(payload);

    if (!parseResults.success) {
      return c.json(
        {
          error: 'invalid update note payload',
          validations: parseResults.error.errors,
        },
        400,
      );
    }

    const updateResults = await dbClient.notes?.updateOne(
      { _id: new ObjectId(noteId) },
      { $set: parseResults.data },
    );

    if (updateResults?.acknowledged) {
      return c.json({ updated: updateResults?.modifiedCount }, 200);
    }

    return c.json({ error: 'failed to note question' }, 500);
  }

  static async setPublic(c: Context) {
    const noteId = c.get('noteId') as string;

    const updateResults = await dbClient.notes?.updateOne(
      { _id: new ObjectId(noteId) },
      { $set: { isPublic: true } },
    );

    if (updateResults?.acknowledged) {
      return c.json({ updated: updateResults?.modifiedCount }, 200);
    }

    return c.json({ error: 'failed to note question' }, 500);
  }

  static async unsetPublic(c: Context) {
    const noteId = c.get('noteId') as string;

    const updateResults = await dbClient.notes?.updateOne(
      { _id: new ObjectId(noteId) },
      { $set: { isPublic: false } },
    );

    if (updateResults?.acknowledged) {
      return c.json({ updated: updateResults?.modifiedCount }, 200);
    }

    return c.json({ error: 'failed to note question' }, 500);
  }

  static async deleteNote(c: Context) {
    const noteId = c.req.param('questionId') as string;
    const projectId = c.get('projectId') as string;

    const deleteResult = await dbClient.projects?.updateOne(
      { _id: new ObjectId(projectId) },
      { $pull: { notes: new ObjectId(noteId) } },
    );

    if (!deleteResult?.acknowledged) {
      return c.json({ error: 'cannot delete note from project' }, 500);
    }

    const deleteNote = await dbClient.notes?.deleteOne({
      _id: new ObjectId(noteId),
    });

    if (!deleteNote?.acknowledged) {
      return c.json({ error: 'cannot delete note' }, 500);
    }

    return c.json({ deleted: deleteNote.deletedCount }, 200);
  }
}
