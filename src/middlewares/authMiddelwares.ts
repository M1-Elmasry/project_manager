import { Context } from "hono";
import jwt from 'jsonwebtoken';
import { JWT_SECRET_KEY } from "../utils/constants";

export async function verifyToken(c: Context, next: () => Promise<void>) {
  const token = c.req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return c.json({ error: 'token not found' }, 401);
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET_KEY);

    if (typeof payload === 'object') {
      c.set('userId', payload.userId);
      await next();
    }

  } catch (error) {
    return c.json({ error }, 401);
  }

  // this for when payload be a string, and i really didn't know when !
  return c.json({ error: 'invalid token'}, 401);
}
