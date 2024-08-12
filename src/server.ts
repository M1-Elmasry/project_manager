import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import auth from './routes/authRoutes';
import { logger } from 'hono/logger';
import { SERVER_HOST, SERVER_PORT } from './utils/constants';

const app = new Hono();

app.use(logger());

app.route('/auth', auth);

serve({
  fetch: app.fetch,
  hostname: SERVER_HOST,
  port: parseInt(SERVER_PORT, 10),
}).once('listening', () => {
  console.log(`server running on ${SERVER_HOST}:${SERVER_PORT}`);
});
