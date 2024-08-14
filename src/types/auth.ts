import { z } from 'zod';

export const UserSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().min(6).max(50).email(),
  password: z.string().min(8),
});

export const UserCredentialsSchema = UserSchema.omit({ username: true });

/**
 * Represents a user in the project.
 *
 * @prop username - The username in length range [3, 20].
 * @prop email - The email address (unique).
 * @prop password - The user's password (min length 8).
 */
export type User = z.infer<typeof UserSchema>;

/**
 * Database User type.
 *
 * @prop username - Username.
 * @prop email - Email Address.
 * @prop password - Hashed Password.
 */
export type UserDocument = User & {};

/**
 * UserCredentials type for authentication.
 *
 * @prop email - The email address of the user.
 * @prop password - The user's password.
 */
 export type UserCredentials = z.infer<typeof UserCredentialsSchema>;
