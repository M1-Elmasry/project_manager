import type { Context } from 'hono';
import dbClient from '../utils/db';
import type { User } from '../utils/typing';
import { InsertOneResult, WithId } from 'mongodb';
import { hash } from 'crypto';

export default class AuthController {
  static async createNewUser(c: Context) {
    const { username, email, password } = await c.req.json();

    if (!username) {
      c.status(400);
      return c.json({ error: 'username missing' });
    }

    if (!email) {
      c.status(400);
      return c.json({ error: 'email missing' });
    }

    if (!password) {
      c.status(400);
      return c.json({ error: 'password missing' });
    }

    const user: WithId<User> | null | undefined = await dbClient.users?.findOne(
      { email },
    );

    if (user) {
      c.status(400);
      return c.json({ error: 'email already exists' });
    }

    const hashedPassword: string = hash('sha256', password).toString();

    const result: InsertOneResult<User> | undefined =
      await dbClient.users?.insertOne({
        username,
        email,
        password: hashedPassword,
      });

    if (result?.acknowledged) {
      c.status(201);
      return c.json({ userId: result.insertedId });
    }

    c.status(500);
    return c.json({ error: 'cannot create new user' });
  }
}
