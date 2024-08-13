/**
 * Represents a user in the project.
 *
 * @prop username - The username for the user.
 * @prop email - the email address of the user (unique).
 * @prop password - The hashed password of the user (min length 8 before hashing).
 */
export type User = {
  username: string;
  email: string;
  password: string;
};
