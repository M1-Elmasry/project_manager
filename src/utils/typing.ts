/**
 * Represents a user in the project.
 * 
 * @property {string} username - The username for the user.
 * @property {string} email - the email address of the user (unique).
 * @property {string} password - The hashed password of the user (min length 8 before hashing).
 */
export type User = {
    username: string;
    email: string;
    password: string;
};
