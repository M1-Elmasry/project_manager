import { Context } from 'hono';
import { ReplyPayloadSchema } from '../types/projects';
import dbClient from '../utils/db';
import { ObjectId } from 'mongodb';

export default class RepliesController {
  static async createReply(c: Context) {
    const userId = c.get('userId') as string;
    const questionId = c.get('questionId') as string;
    const payload = await c.req.json();
    const parseResults = ReplyPayloadSchema.safeParse(payload);

    if (!parseResults.success) {
      return c.json(
        {
          error: 'invalid reply payload',
          validations: parseResults.error.errors,
        },
        400,
      );
    }

    const { reply } = parseResults.data;

    const insertedReply = await dbClient.replies?.insertOne({
      reply,
      author: new ObjectId(userId),
      created_at: new Date(),
    });

    if (!insertedReply?.acknowledged) {
      return c.json({ error: 'failed to create a question reply' }, 500);
    }

    const questionUpdate = await dbClient.questions?.updateOne(
      { _id: new ObjectId(questionId) },
      { $push: { replies: insertedReply.insertedId } },
    );

    if (!questionUpdate?.acknowledged) {
      return c.json(
        { error: 'failed to assign the reply to the question' },
        500,
      );
    }

    return c.json({ replyId: insertedReply.insertedId }, 201);
  }

  static async updateReply(c: Context) {
    const replyId = c.get('replyId') as string;
    const payload = await c.req.json();
    const parseResults = ReplyPayloadSchema.safeParse(payload);

    if (!parseResults.success) {
      return c.json(
        {
          error: 'invalid update reply payload',
          validations: parseResults.error.errors,
        },
        400,
      );
    }

    const updateResults = await dbClient.replies?.updateOne(
      { _id: new ObjectId(replyId) },
      { $set: parseResults.data },
    );

    if (updateResults?.acknowledged) {
      return c.json({ updated: updateResults?.modifiedCount }, 200);
    }

    return c.json({ error: 'failed to update question reply' }, 500);
  }

  static async deleteReply(c: Context) {
    const replyId = c.get('replyId') as string;
    const questionId = c.get('questionId') as string;

    const deleteReply = await dbClient.replies?.deleteOne({
      _id: new ObjectId(replyId),
    });

    if (!deleteReply?.acknowledged) {
      return c.json({ error: 'cannot delete question reply' }, 500);
    }

    const updateResult = await dbClient.questions?.updateOne(
      { _id: new ObjectId(questionId) },
      { $pull: { replies: new ObjectId(replyId) } },
    );

    if (!updateResult?.acknowledged) {
      return c.json(
        { error: 'failed to remove the reply from the question' },
        500,
      );
    }

    return c.json(
      {
        deleted: deleteReply.deletedCount,
      },
      200,
    );
  }
}
