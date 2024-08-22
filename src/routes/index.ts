import { Hono } from 'hono';

import AuthRoute from './authRoutes';
import WorkspacesRoute from './workspacesRoute';
import ProjectsRoute from './projectsRoutes';
import QuestionsRoute from './questionesRoutes';
import RepliesRoute from './repliesRoutes';
import NotesRoute from './notesRoutes';

const app = new Hono();

app.route('/auth', AuthRoute);
app.route('/workspaces', WorkspacesRoute);
app.route('workspaces/:workspaceId/projects', ProjectsRoute);
app.route(
  'workspaces/:workspaceId/projects/:projectId/questions',
  QuestionsRoute,
);
app.route(
  'workspaces/:workspaceId/projects/:projectId/questions/:questionId/replies',
  RepliesRoute,
);
app.route('workspaces/:workspaceId/projects/:projectId/notes', NotesRoute);

export default app;
