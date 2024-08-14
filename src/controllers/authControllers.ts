import type { Context } from 'hono';
import bcrypt from 'bcrypt';
import dbClient from '../utils/db';
import { UserSchema, UserCredentialsSchema } from '../types/auth';
import jwt from 'jsonwebtoken';
import { JWT_SECRET_KEY } from '../utils/constants';
import { ObjectId } from 'mongodb';

export default class AuthController {
  static async createNewUser(c: Context) {
    const payload = await c.req.json();

    // validate user creation payload
    // will ignore any extra fields in the payload more than User fields
    const parseResults = UserSchema.safeParse(payload);
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

  static async generateToken(c: Context) {
     const payload = await c.req.json();

     const parseResults = UserCredentialsSchema.safeParse(payload);
     if (!parseResults.success) {
      console.log(parseResults.error);
      return c.json({ errors: parseResults.error.errors }, 400);
     }

    const { email, password } = parseResults.data;

    const user = await dbClient.users?.findOne({ email });
    if (!user) {
      // i know it's invalid email only, but this for security reasons
      return c.json({ error: 'invalid email or password' }, 401);
    }

    const correctPass = bcrypt.compare(password, user.password);

    if (!correctPass) {
      // i know it's invalid password only, but this for security reasons
      return c.json({ error: 'invalid email or password' }, 401);
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    return c.json({ token }, 201);
  }

  static async getMe(c: Context) {
    const userId: string = c.get('userId');
    const user = await dbClient.users?.findOne({ _id: new ObjectId(userId) });
    return c.json(user, 201);
  }
}
