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

/**
 * Deletes a workspace, their projects and any component under it
 */
export async function deleteWorkspace(workspaceId: ObjectId): Promise<boolean> {
  const workspace = await dbClient.workspaces?.findOneAndDelete({
    _id: workspaceId,
  });

  if (!workspace) {
    return false;
  }

  // delete all projects and components under this workspace
  await Promise.allSettled(workspace.projects.map(deleteProject));

  return true;
}

export async function deleteProject(projectId: ObjectId) {
  // delete project
  const project = await dbClient.projects?.findOneAndDelete({
    _id: projectId,
  });

  if (!project) {
    return false;
  }

  // delete notes
  await dbClient.notes?.deleteMany({ _id: { $in: project.notes } });

  // delete questions and their replies
  await Promise.allSettled(project.questions.map(deleteQuestion));

  // delete tasks, checklists and checklist items
  await Promise.allSettled(project.tasks.map(deleteTask));

  return true;
}

export async function deleteQuestion(questionId: ObjectId) {
  const question = await dbClient.questions?.findOneAndDelete({
    _id: questionId,
  });

  if (!question) {
    return false;
  }

  // delete replies
  const replyResult = await dbClient.replies?.deleteMany({
    _id: { $in: question.replies },
  });

  if (replyResult?.acknowledged) {
    return true;
  }

  return false;
}

/**
 * Deletes a task and checklists with their components under it.
 */
export async function deleteTask(taskId: ObjectId): Promise<boolean> {
  const task = await dbClient.tasks?.findOneAndDelete({
    _id: new ObjectId(taskId),
  });

  if (!task) {
    return false;
  }

  return (await Promise.allSettled(task.checklists.map(deleteChecklist))).every(
    (p) => p.status === 'fulfilled',
  );
}

/**
 * Deletes a checklist and components under it.
 */
export async function deleteChecklist(checklistId: ObjectId): Promise<boolean> {
  // delete checklist
  const checklist = await dbClient.checklists?.findOneAndDelete({
    _id: checklistId,
  });
  if (!checklist) {
    return false;
  }

  // delete checklist items
  const deleteResult = await dbClient.checklistItems?.deleteMany({
    _id: { $in: checklist.items },
  });

  if (deleteResult?.acknowledged) {
    return true;
  }

  return false;
}
