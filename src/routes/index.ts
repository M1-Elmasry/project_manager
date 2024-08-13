import { Hono } from 'hono';

import AuthRoute from './authRoutes';

const app = new Hono();

app.route('/auth', AuthRoute);

export default app;
