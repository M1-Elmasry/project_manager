import { Context, Next } from 'hono';
import { isValidObjectId } from '../utils/helpers';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';

export type ReplyGuardOption = {
  allowAdmins?: boolean;
};

export function ReplyGuard(options: ReplyGuardOption = {}) {
  return async (c: Context, next: Next) => {
    const userId: string | undefined = c.get('userId');
    const projectId: string | undefined = c.get('projectId');
    const workspaceId: string | undefined = c.get('workspaceId');
    const questionId: string | undefined = c.get('questionId');
    const replyId: string = c.req.param('replyId');

    const isQuestionAuthor: boolean = c.get('isQuestionAuthor') || false;
    const isProjectOwner: boolean = c.get('isProjectOwner') || false;

    if (!userId) {
      throw new Error('Must be used after verifyToken middleware');
    }
    if (!projectId) {
      throw new Error('Must be used after ProjectGuard middleware');
    }
    if (!workspaceId) {
      throw new Error('Must be used after WorkspaceGuard middleware');
    }
    if (!questionId) {
      throw new Error('Must be used after QuestionGuard middleware');
    }

    if (!replyId) {
      throw new Error('please add replyId param to the route path');
    }

    if (!isValidObjectId(replyId)) {
      return c.json({ error: 'Invalid reply ID' }, 400);
    }

    const reply = await dbClient.replies?.findOne({
      _id: new ObjectId(replyId),
    });

    // validate if project exists
    if (!reply) {
      return c.json({ error: 'Question Reply Not Found' }, 404);
    }

    const isAuthor = reply.author.toString() !== userId;

    if (!isAuthor) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    if (options.allowAdmins && !isProjectOwner && !isQuestionAuthor) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    c.set('replyId', replyId);
    c.set('reply', reply);
    c.set('replyAuthorId', reply.author.toString());
    c.set('isReplyAuthor', isAuthor);

    return next();
  };
}
