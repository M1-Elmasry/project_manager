/**
 * Database host
 * @constant
 */
export const DB_HOST: string = process.env.DB_HOST || '127.0.0.1';

/**
 * Database port
 * @constant
 */
export const DB_PORT: string = process.env.DB_PORT || '27017';

/**
 * Database name
 * @constant
 */
export const DB_NAME: string = process.env.DB_NAME || 'project_manager';

/**
 * the secret key for jwt token
 * @constant
 */
export const JWT_SECRET_KEY: string = process.env.JWT_SECRET_KEY || 'strong_secret_key';

/**
 * Hone server host
 * @constant
 */
export const SERVER_HOST: string = process.env.SERVER_HOST || '127.0.0.1';

/**
 * hono server port
 * @constant
 */
export const SERVER_PORT: string = process.env.SERVER_PORT || '5000';

