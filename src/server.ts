import { serve } from '@hono/node-server';
import {
  SERVER_HOST,
  SERVER_PORT,
  DB_HOST,
  DB_PORT,
  DB_NAME,
} from '@utils/constants';
import db from '@utils/db';
import app from './app';

(async () => {
  await db.connect();

  console.log(`Database: Connected: ${DB_HOST}:${DB_PORT}/${DB_NAME}`);

  serve({
    fetch: app.fetch,
    hostname: SERVER_HOST,
    port: parseInt(SERVER_PORT, 10),
  }).once('listening', () => {
    console.log(`Server: Running: ${SERVER_HOST}:${SERVER_PORT}`);
    console.log(`Swagger docs: /docs`);
  });
})();
