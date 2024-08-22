import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { logger } from 'hono/logger';
import APIRoutes from './routes';
import YAML from 'yamljs';
import { swaggerUI } from '@hono/swagger-ui';
import { SERVER_HOST, SERVER_PORT } from './utils/constants';

const app = new Hono();

app.use(
  '/docs',
  swaggerUI({
    url: 'swagger.yaml',
    spec: YAML.load('./src/swagger.yaml'),
  }),
);

app.use(logger());

app.route('/', APIRoutes);

serve({
  fetch: app.fetch,
  hostname: SERVER_HOST,
  port: parseInt(SERVER_PORT, 10),
}).once('listening', () => {
  console.log(`server running on ${SERVER_HOST}:${SERVER_PORT}`);
  console.log(`Swagger docs available at http://localhost:${SERVER_PORT}/docs`);
});
