import { Context } from 'hono';
import { NotePayloadSchema, NoteUpdatePayloadSchema } from '../types/projects';
import dbClient from '../utils/db';
import { ObjectId } from 'mongodb';

// !WARN: not finished or tested yet

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
      author: new ObjectId(userId),
      created_at: new Date(),
    });

    if (insertedNote?.acknowledged) {
      await dbClient.projects?.updateOne(
        { _id: new ObjectId(projectId) },
        { $push: { note: insertedNote.insertedId } },
      );
      return c.json({ noteId: insertedNote.insertedId }, 201);
    }

    return c.json({ error: 'failed to create a note' }, 500);
  }

  // !TODO: implemenet this fuckin shit below

  //static async getAllNotes(c: Context) {
  // get all notes associated wih a project
  //}

  static async updateNote(c: Context) {
    //const userId = c.get('userId') as string;
    const questionId = c.get('questionId') as string;
    // !FIX: only owner of the note can update
    const payload = await c.req.json();
    const parseResults = NoteUpdatePayloadSchema.safeParse(payload);

    if (!parseResults.success) {
      return c.json(
        {
          error: 'invalid update Note payload',
          validations: parseResults.error.errors,
        },
        400,
      );
    }

    const newNote = parseResults.data as string;

    //if (Object.keys(changes).length === 0) {
    //  return c.json({ updated: 0 }, 200);
    //}

    const updateResults = await dbClient.notes?.updateOne(
      { _id: new ObjectId(questionId) },
      { $set: { question: newNote } },
    );

    if (updateResults?.acknowledged) {
      return c.json({ updated: updateResults?.modifiedCount }, 200);
    }

    return c.json({ error: 'failed to note question' }, 500);
  }

  static async deleteNote(c: Context) {
    const noteId = c.req.param('questionId') as string;
    const projectId = c.get('projectId') as string;

    // !FIX: only owner of the note can delete
    const note = await dbClient.notes?.findOne({
      _id: new ObjectId(noteId),
    });
    if (!note) {
      return c.json({ error: 'invalid note id' }, 401);
    }

    const deleteNote = await dbClient.notes?.deleteOne({
      _id: new ObjectId(noteId),
    });

    if (!deleteNote?.acknowledged) {
      return c.json({ error: 'cannot delete note' }, 500);
    }

    await dbClient.projects?.updateOne(
      { _id: new ObjectId(projectId) },
      { $pull: { notes: new ObjectId(noteId) } },
    );
    return c.json({ deleted: deleteNote.deletedCount }, 200);
  }
}
