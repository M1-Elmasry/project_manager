import { ObjectId, WithId } from 'mongodb';
import dbClient from '../utils/db';
import { ProjectDocument } from '../types/projects';

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

export async function deleteProjectComponents(projectId: string): Promise<void>;
export async function deleteProjectComponents(
  projectId: ObjectId,
): Promise<void>;
export async function deleteProjectComponents(
  project: WithId<ProjectDocument>,
): Promise<void>;

export async function deleteProjectComponents(
  arg: WithId<ProjectDocument> | ObjectId | string,
) {
  let projectId: ObjectId | undefined;
  let project: WithId<ProjectDocument> | undefined;

  if (typeof arg === 'string') {
    if (!isValidObjectId(arg)) {
      throw new Error('invalid project id');
    }
    projectId = new ObjectId(arg);
  } else if (arg instanceof ObjectId) {
    projectId = arg;
  } else if (typeof arg === 'object' && arg._id !== undefined) {
    project = arg;
  }

  if (!project && projectId) {
    const result = await dbClient.projects?.findOne({ _id: projectId });
    if (!result) {
      throw new Error('no project found');
    }
    project = result;
  }

  if (!project) {
    throw new Error('no project found');
  }

  projectId = project._id;

  const notesResult = await dbClient.notes?.deleteMany({
    _id: { $in: project.notes },
  });
  if (!notesResult?.acknowledged) {
    throw new Error('error deleting project notes');
  }

  const replieResults = await dbClient.projects
    ?.aggregate([
      { $match: { _id: projectId } },
      {
        $lookup: {
          from: 'questions',
          localField: 'questions',
          foreignField: '_id',
          as: 'questions',
        },
      },
      { $unwind: '$questions' },
      { $replaceRoot: { newRoot: '$questions' } },
      { $unwind: '$replies' },
      { $group: { _id: null, replies: { $push: '$replies' } } },
    ])
    .toArray();

  if (replieResults && replieResults.length > 0) {
    const repliesResults = await dbClient.replies?.deleteMany({
      _id: { $in: replieResults[0].replies },
    });
    if (!repliesResults?.acknowledged) {
      throw new Error(
        'error deleting questions replies releated to the project',
      );
    }
  }
  const questionsResult = await dbClient.questions?.deleteMany({
    _id: { $in: project.questions },
  });
  if (!questionsResult?.acknowledged) {
    throw new Error('error deleting project questions');
  }

  // !TODO: delete tasks and todo-lists after implementation
}
