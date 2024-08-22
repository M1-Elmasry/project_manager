import { Context } from 'hono';
import jwt from 'jsonwebtoken';
import { JWT_SECRET_KEY } from '../utils/constants';
import { isValidObjectId } from '../utils/helpers';
import dbClient from '../utils/db';
import { ObjectId } from 'mongodb';

type JWTPayload = {
  userId: string;
};

export async function AuthGuard(c: Context, next: () => Promise<void>) {
  const values = c.req.header('Authorization')?.split(' ');

  if (!values || values.length !== 2 || values[0] !== 'Bearer') {
    return c.json({ error: 'invalid authorization' }, 401);
  }

  const token = values[1];

  let userId: string | undefined;
  try {
    const payload = jwt.verify(token, JWT_SECRET_KEY) as JWTPayload;
    userId = payload.userId;
  } catch (err) {
    console.error('Invalid Authorization:', err);

    if (err instanceof jwt.TokenExpiredError) {
      return c.json({ error: (err as Error).message }, 401);
    }

    return c.json({ error: 'invalid token' }, 401);
  }

  if (!userId || !isValidObjectId(userId)) {
    return c.json({ error: 'invalid token payload' }, 401);
  }

  const user = await dbClient.users?.findOne({ _id: new ObjectId(userId) });
  if (!user) {
    return c.json({ error: 'user not found' }, 401);
  }

  c.set('userId', userId);
  c.set('user', user);

  return next();
}
