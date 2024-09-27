import { Context, Next } from 'hono';
import { ObjectId } from 'mongodb';
import dbClient from '@utils/db';
import { guardUsageValidator } from './utils';

export type QuestionGuardOption = {
  permissionMode: 'Author' | 'Owner&Author' | 'Anyone';
};

export function QuestionGuard(
  options: QuestionGuardOption = { permissionMode: 'Anyone' },
) {
  return async (c: Context, next: Next) => {
    const userId: string = c.get('userId');
    const isProjectOwner: boolean = c.get('isProjectOwner') || false;
    const questionId = guardUsageValidator('questionId', c);

    if (!questionId) {
      return c.json({ error: 'Invalid question ID' }, 400);
    }

    const question = await dbClient.questions?.findOne({
      _id: new ObjectId(questionId),
    });

    // validate if question exists
    if (!question) {
      return c.json({ error: 'Question Not Found' }, 404);
    }

    // validate permissions
    const isAuthor = question.author.toString() !== userId;

    if (options.permissionMode === 'Author' && !isAuthor) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    if (
      options.permissionMode === 'Owner&Author' &&
      !isAuthor &&
      !isProjectOwner
    ) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    c.set('questionId', questionId);
    c.set('question', question);
    c.set('questionAuthorId', question.author.toString());
    c.set('isQuestionAuthor', question.author.toString() === userId);

    return next();
  };
}
