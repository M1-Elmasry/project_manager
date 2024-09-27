import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import APIRoutes from '@routes/index';
import YAML from 'yamljs';
import { swaggerUI } from '@hono/swagger-ui';

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

export default app;
