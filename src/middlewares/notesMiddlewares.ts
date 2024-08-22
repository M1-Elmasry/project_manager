import { Context, Next } from 'hono';
import { isValidObjectId } from '../utils/helpers';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';

export function NoteGuard() {
  return async (c: Context, next: Next) => {
    const userId: string | undefined = c.get('userId');
    const projectId: string | undefined = c.get('projectId');
    const workspaceId: string | undefined = c.get('workspaceId');
    const noteId: string = c.req.param('noteId');

    if (!userId) {
      throw new Error('Must be used after verifyToken middleware');
    }
    if (!projectId) {
      throw new Error('Must be used after ProjectGuard middleware');
    }
    if (!workspaceId) {
      throw new Error('Must be used after WorkspaceGuard middleware');
    }
    if (!noteId) {
      throw new Error('please add noteId param to the route path');
    }

    if (!isValidObjectId(noteId)) {
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
    const isAuthor = note.author.toString() !== userId;
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
