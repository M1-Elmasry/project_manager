import { Hono } from 'hono';

import AuthRoute from './authRoutes';
import WorkspacesRoute from './workspacesRoute';
import ProjectsRoute from './projectsRoutes';
import QuestionsRoute from './questionesRoutes';
import RepliesRoute from './repliesRoutes';
import NotesRoute from './notesRoutes';
import TasksRoute from './tasksRoute';
import { AuthGuard } from '../middlewares/authMiddelwares';
import { WorkspaceGuard } from '../middlewares/workspacesMiddlewares';
import { ProjectGuard } from '../middlewares/projectsMiddlewares';
import { QuestionGuard } from '../middlewares/questionsMiddlewares';

const app = new Hono();

// use AuthGuard middleware on any route starts with /workspaces
app.use('/workspaces/*', AuthGuard);

app.route('/auth', AuthRoute);
app.route('/workspaces', WorkspacesRoute);
app.route('workspaces/:workspaceId/projects', ProjectsRoute);

// Use Workspace and Project guards on any route under a project after this line
app.use(
  'workspaces/:workspaceId/projects/:projectId/*',
  WorkspaceGuard(),
  ProjectGuard(),
);

app.route(
  'workspaces/:workspaceId/projects/:projectId/questions',
  QuestionsRoute,
);

app.use(
  'workspaces/:workspaceId/projects/:projectId/questions/:questionId/replies/*',
  QuestionGuard(),
);
app.route(
  'workspaces/:workspaceId/projects/:projectId/questions/:questionId/replies',
  RepliesRoute,
);

app.route('workspaces/:workspaceId/projects/:projectId/notes', NotesRoute);
app.route('workspaces/:workspaceId/projects/:projectId/tasks', TasksRoute);

export default app;
