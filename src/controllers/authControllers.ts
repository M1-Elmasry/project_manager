import type { Context } from 'hono';
import bcrypt from 'bcrypt';
import dbClient from '../utils/db';
import { CreateUserSchema } from '../types/auth';

export default class AuthController {
  static async createNewUser(c: Context) {
    const payload = await c.req.json();

    // validate user creation payload
    const parseResults = CreateUserSchema.safeParse(payload);
    if (!parseResults.success) {
      console.log(parseResults.error);
      return c.json({ errors: parseResults.error.errors }, 400);
    }

    const { email, password, username } = parseResults.data;

    // check user existance
    const user = await dbClient.users?.findOne({ email });
    if (user) {
      return c.json({ error: 'email already exists' }, 400);
    }

    // store hashed password with salt of 10 rounds
    const hashedPassword = await bcrypt.hash(password, 10);

    const insertResults = await dbClient.users?.insertOne({
      username,
      email,
      password: hashedPassword,
    });

    if (insertResults?.acknowledged) {
      return c.json({ userId: insertResults.insertedId }, 201);
    }

    return c.json({ error: 'failed to create user' }, 500);
  }
}
