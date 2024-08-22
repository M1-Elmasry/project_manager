import { Hono } from 'hono';
import { WorkspaceGuard } from '../middlewares/workspacesMiddlewares';
import { ProjectGuard } from '../middlewares/projectsMiddlewares';
import NotesController from '../controllers/notesControllers';
import { AuthGuard } from '../middlewares/authMiddelwares';
import { NoteGuard } from '../middlewares/notesMiddlewares';

const app = new Hono();

// create note
app.post(
  '/',
  AuthGuard,
  WorkspaceGuard(),
  ProjectGuard(),
  NotesController.createNote,
);

// get all owned and public notes
app.get(
  '/',
  AuthGuard,
  WorkspaceGuard(),
  ProjectGuard(),
  NotesController.getAllNotes,
);

// update note by owner only
app.put(
  '/:noteId',
  AuthGuard,
  WorkspaceGuard(),
  ProjectGuard(),
  NoteGuard(),
  NotesController.updateNote,
);

// set note as public by owner only
app.put(
  '/:noteId/set_public',
  AuthGuard,
  WorkspaceGuard(),
  ProjectGuard(),
  NoteGuard(),
  NotesController.setPublic,
);

// unset note public flag by owner only
app.put(
  '/:noteId/unset_public',
  AuthGuard,
  WorkspaceGuard(),
  ProjectGuard(),
  NoteGuard(),
  NotesController.unsetPublic,
);

// delete note by owner only
app.delete(
  '/:noteId',
  AuthGuard,
  WorkspaceGuard(),
  ProjectGuard(),
  NoteGuard(),
  NotesController.deleteNote,
);

export default app;
