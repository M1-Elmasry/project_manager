import { serve } from '@hono/node-server';
import { SERVER_HOST, SERVER_PORT } from './utils/constants';
import app from './app';



serve({
  fetch: app.fetch,
  hostname: SERVER_HOST,
  port: parseInt(SERVER_PORT, 10),
}).once('listening', () => {
  console.log(`server running on ${SERVER_HOST}:${SERVER_PORT}`);
  console.log(`Swagger docs available at http://localhost:${SERVER_PORT}/docs`);
});
