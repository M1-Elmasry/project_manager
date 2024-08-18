import { Context } from 'hono';
import {
  QuestionPayloadSchema,
  QuestionUpdatePayloadSchema,
} from '../types/projects';
import dbClient from '../utils/db';
import { ObjectId } from 'mongodb';

export default class QuestionsController {
  static async createQuestion(c: Context) {
    const userId = c.get('userId') as string;
    const projectId = c.get('projectId') as string;
    const payload = await c.req.json();
    const parseResults = QuestionPayloadSchema.safeParse(payload);

    if (!parseResults.success) {
      return c.json(
        {
          error: 'invalid question payload',
          validations: parseResults.error.errors,
        },
        400,
      );
    }

    const { question } = parseResults.data;

    const insertedQuestion = await dbClient.questions?.insertOne({
      question,
      author: new ObjectId(userId),
      replies: [],
      created_at: new Date(),
    });

    if (insertedQuestion?.acknowledged) {
      await dbClient.projects?.updateOne(
        { _id: new ObjectId(projectId) },
        { $push: { questions: insertedQuestion.insertedId } },
      );
      return c.json({ questionId: insertedQuestion.insertedId }, 201);
    }

    return c.json({ error: 'failed to create a question' }, 500);
  }

  static async getAllQuestion(c: Context) {
    const projectId = c.get('projectId') as string;
    const questions = await dbClient.projects
      ?.aggregate([
        { $match: { _id: new ObjectId(projectId) } },
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
      ])
      .toArray();

    return c.json({ questions }, 201);
  }

  static async updateQuestion(c: Context) {
    //const userId = c.get('userId') as string;
    const questionId = c.get('questionId') as string;
    // !FIX: only owner of the question can update
    const payload = await c.req.json();
    const parseResults = QuestionUpdatePayloadSchema.safeParse(payload);

    if (!parseResults.success) {
      return c.json(
        {
          error: 'invalid update question payload',
          validations: parseResults.error.errors,
        },
        400,
      );
    }

    const newQuestion = parseResults.data as string;

    //if (Object.keys(changes).length === 0) {
    //  return c.json({ updated: 0 }, 200);
    //}

    const updateResults = await dbClient.questions?.updateOne(
      { _id: new ObjectId(questionId) },
      { $set: { question: newQuestion } },
    );

    if (updateResults?.acknowledged) {
      return c.json({ updated: updateResults?.modifiedCount }, 200);
    }

    return c.json({ error: 'failed to update question' }, 500);
  }

  static async deleteQuestion(c: Context) {
    const questionId = c.req.param('questionId') as string;
    const projectId = c.get('projectId') as string;

    // !FIX: only owner of the question can delete
    const question = await dbClient.questions?.findOne({
      _id: new ObjectId(questionId),
    });
    if (!question) {
      return c.json({ error: 'invalid quesiton id' }, 401);
    }

    const deleteReplies = await dbClient.replies?.deleteMany({
      _id: { $in: question?.replies },
    });
    if (!deleteReplies?.acknowledged) {
      return c.json({ error: "cannot delete question's replies" }, 500);
    }

    const deleteQuestion = await dbClient.questions?.deleteOne({
      _id: new ObjectId(questionId),
    });
    if (!deleteQuestion?.acknowledged) {
      return c.json({ error: "cannot delete question's replies" }, 500);
    }

    await dbClient.projects?.updateOne(
      { _id: new ObjectId(projectId) },
      { $pull: { questions: new ObjectId(questionId) } },
    );
    return c.json({ deleted: deleteQuestion.deletedCount }, 200);
  }
}
