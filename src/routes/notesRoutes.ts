import { Hono } from "hono";
import { WorkspaceGuard } from "../middlewares/workspacesMiddlewares";
import { ProjectGuard } from "../middlewares/projectsMiddlewares";
import NotesController from "../controllers/notesControllers";
import { verifyToken } from "../middlewares/authMiddelwares";

const app = new Hono();

app.post(
  '/notes',
  verifyToken,
  WorkspaceGuard(),
  ProjectGuard(),
  NotesController.createNote,
);

app.get(
  '/notes',
  verifyToken,
  WorkspaceGuard(),
  ProjectGuard(),
  NotesController.getAllNotes,
);

// !FIX: only author he can update the note, not project owner !

app.put(
  '/notes/:noteId',
  verifyToken,
  WorkspaceGuard(),
  ProjectGuard({ onlyOwner: true }),
  NotesController.updateNote,
);

app.delete(
  '/notes/:noteId',
  verifyToken,
  WorkspaceGuard(),
  ProjectGuard({ onlyOwner: true }),
  NotesController.deleteNote,
);

export default app;
