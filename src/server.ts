import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { logger } from 'hono/logger';
import APIRoutes from './routes';
import { SERVER_HOST, SERVER_PORT } from './utils/constants';

const app = new Hono();

app.use(logger());

app.route('/', APIRoutes);

serve({
  fetch: app.fetch,
  hostname: SERVER_HOST,
  port: parseInt(SERVER_PORT, 10),
}).once('listening', () => {
  console.log(`server running on ${SERVER_HOST}:${SERVER_PORT}`);
});
