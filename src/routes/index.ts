import { Hono } from 'hono';

import AuthRoute from './authRoutes';
import WorkspacesRoute from './workspacesRoute';
import ProjectsRoute from './projectsRoutes';

const app = new Hono();

app.route('/auth', AuthRoute);
app.route('/workspaces', WorkspacesRoute);
app.route('workspaces/:workspaceId/projects',ProjectsRoute);

export default app;
