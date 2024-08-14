import { Context } from 'hono';
import jwt from 'jsonwebtoken';
import { JWT_SECRET_KEY } from '../utils/constants';

type JWTPayload = {
  userId: string;
};

export async function verifyToken(c: Context, next: () => Promise<void>) {
  const values = c.req.header('Authorization')?.split(' ');

  if (!values || values.length !== 2 || values[0] !== 'Bearer') {
    return c.json({ error: 'invalid authorization' }, 401);
  }

  const token = values[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET_KEY) as JWTPayload;
    c.set('userId', payload.userId);
  } catch (err) {
    console.error('Invalid Authorization:', err);

    if (err instanceof jwt.TokenExpiredError) {
      return c.json({ error: (err as Error).message }, 401);
    }

    return c.json({ error: 'invalid token' }, 401);
  }

  return next();
}
