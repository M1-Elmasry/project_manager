/**
 * Database host
 */
export const DB_HOST: string = process.env.DB_HOST || '127.0.0.1';

/**
 * Database port
 */
export const DB_PORT: string = process.env.DB_PORT || '27017';

/**
 * Database name
 */
export const DB_NAME: string = process.env.DB_NAME || 'project_manager';

/**
 * the secret key for jwt token
 */
export const JWT_SECRET_KEY: string =
  process.env.JWT_SECRET_KEY || 'strong_secret_key';

/**
 * Hone server host
 */
export const SERVER_HOST: string = process.env.SERVER_HOST || '127.0.0.1';

/**
 * hono server port
 */
export const SERVER_PORT: string = process.env.SERVER_PORT || '5000';
