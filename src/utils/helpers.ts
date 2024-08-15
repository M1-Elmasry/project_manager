import { ObjectId } from 'mongodb';

/**
 * Safely validates if an object id is valid or not without throwing an error
 */
export const isValidObjectId = (id: string): boolean => {
  try {
    return ObjectId.isValid(id);
  } catch (_) {
    return false;
  }
};
