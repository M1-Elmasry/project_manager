import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import app from '@app';
import db from '@utils/db';

beforeAll(async () => {
  await db.connect();
});

afterAll(async () => {
  await db.close();
});

describe('Auth Model', () => {
  beforeAll(async () => {
    await db.users.drop();

    await db.users.insertOne({
      email: 'user@test.com',
      username: 'test',
      password: '123456789',
    });
  });

  afterAll(async () => {
    await db.users.drop();
  });

  test('Login', async () => {
    const res = await app.request('/auth/login', {
      email: 'user@test.com',
      password: '123456789',
    });

    expect(res.status).toBe(200);
  });
});
