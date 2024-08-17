import { Hono } from 'hono';

import AuthRoute from './authRoutes';
import WorkspacesRoute from './workspacesRoute';

const app = new Hono();

app.route('/auth', AuthRoute);
app.route('/workspaces', WorkspacesRoute);

export default app;
