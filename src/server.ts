import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { logger } from 'hono/logger';
import APIRoutes from './routes';
import YAML from 'yamljs';
import { swaggerUI } from '@hono/swagger-ui';
import { SERVER_HOST, SERVER_PORT } from './utils/constants';

const app = new Hono();

app.use(logger());
app.use(cors());

app.use(
  '/docs',
  swaggerUI({
    url: 'swagger.yaml',
    spec: YAML.load('./swagger.yaml'),
  }),
);

app.get('/', (c) => c.redirect('/docs'));
app.route('/', APIRoutes);

serve({
  fetch: app.fetch,
  hostname: SERVER_HOST,
  port: parseInt(SERVER_PORT, 10),
}).once('listening', () => {
  console.log(`server running on ${SERVER_HOST}:${SERVER_PORT}`);
  console.log(`Swagger docs available at http://localhost:${SERVER_PORT}/docs`);
});
