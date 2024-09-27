import { Hono } from 'hono';
import NotesController from '@controllers/notesControllers';
import { NoteGuard } from '@middlewares/notesMiddlewares';

const app = new Hono();

app.use('/:noteId/*', NoteGuard());

// create note
app.post('/', NotesController.createNote);

// get all owned and public notes
app.get('/', NotesController.getAllNotes);

// update note by owner only
app.put('/:noteId', NotesController.updateNote);

// set note as public by owner only
app.put('/:noteId/set_public', NotesController.setPublic);

// unset note public flag by owner only
app.put('/:noteId/unset_public', NotesController.unsetPublic);

// delete note by owner only
app.delete('/:noteId', NotesController.deleteNote);

export default app;
