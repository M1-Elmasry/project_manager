import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';

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

export async function deleteProjectsWithRelatedEntities(projectIds: ObjectId[]) {
  const projects = await dbClient.projects?.find({
    _id: { $in: projectIds },
  }).toArray();

  if (!projects) {
    throw new Error('no project found');
  }

  projects.map(async (project) => {
  //await dbClient.tasks?.deleteMany({ _id: { $in: project.tasks } });
  await dbClient.notes?.deleteMany({ _id: { $in: project.notes } });
  await dbClient.questions?.deleteMany({ _id: { $in: project.questions } });
  //await dbClient.replies?.deleteMany({ _id: { $in: project.replies } });
  await dbClient.projects?.deleteOne({ _id: project._id });
  })
}
