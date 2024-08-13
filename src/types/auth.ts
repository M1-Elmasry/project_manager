import { z } from 'zod';

export const CreateUserSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().min(6).email(),
  password: z.string().min(8),
});

/**
 * Represents a user in the project.
 *
 * @prop username - The username in length range [3, 20].
 * @prop email - The email address (unique).
 * @prop password - The user's password (min length 8).
 */
export type CreateUser = z.infer<typeof CreateUserSchema>;

/**
 * Database User type.
 *
 * @prop username - Username.
 * @prop email - Email Address.
 * @prop password - Hashed Password.
 */
export type User = CreateUser & {};
