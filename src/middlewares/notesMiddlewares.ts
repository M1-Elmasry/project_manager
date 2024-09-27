import { Context, Next } from 'hono';
import { ObjectId } from 'mongodb';
import dbClient from '@utils/db';
import { guardUsageValidator } from './utils';

export function NoteGuard() {
  return async (c: Context, next: Next) => {
    const userId = c.get('userId') as string;
    const noteId = guardUsageValidator('noteId', c);

    if (!noteId) {
      return c.json({ error: 'Invalid note ID' }, 400);
    }

    const note = await dbClient.notes?.findOne({
      _id: new ObjectId(noteId),
    });

    // validate if note exists
    if (!note) {
      return c.json({ error: 'Note Not Found' }, 404);
    }

    // validate permissions
    const isAuthor = note.author.toString() === userId;
    if (!isAuthor) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    c.set('noteId', noteId);
    c.set('note', note);
    c.set('noteAuthorId', note.author.toString());
    c.set('isNoteAuthor', isAuthor);

    return next();
  };
}
