import { Context } from 'hono';
import { QuestionPayloadSchema } from '../types/projects';
import dbClient from '../utils/db';
import { deleteQuestion } from '../utils/helpers';
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
    const userId = c.get('userId') as string;
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
        {
          $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'author',
          },
        },
        { $unwind: '$author' },
        {
          $addFields: {
            id: '$_id',
            author: { id: '$author._id' },
            isAuthor: { $eq: ['$author._id', new ObjectId(userId)] },
          },
        },
        { $unset: ['_id', 'author._id', 'author.password'] },
        {
          $lookup: {
            from: 'replies',
            localField: 'replies',
            foreignField: '_id',
            as: 'replies',
            pipeline: [
              {
                $lookup: {
                  from: 'users',
                  localField: 'author',
                  foreignField: '_id',
                  as: 'author',
                },
              },
              { $unwind: '$author' },
              {
                $set: {
                  id: '$_id',
                  isAuthor: { $eq: [new ObjectId(userId), '$author._id'] },
                  author: { id: '$author._id' },
                },
              },
              { $unset: ['_id', 'author._id', 'author.password'] },
            ],
          },
        },
      ])
      .toArray();

    return c.json(questions, 201);
  }

  static async updateQuestion(c: Context) {
    const questionId = c.get('questionId') as string;
    const payload = await c.req.json();
    const parseResults = QuestionPayloadSchema.safeParse(payload);

    if (!parseResults.success) {
      return c.json(
        {
          error: 'invalid update question payload',
          validations: parseResults.error.errors,
        },
        400,
      );
    }

    const updateResults = await dbClient.questions?.updateOne(
      { _id: new ObjectId(questionId) },
      { $set: parseResults.data },
    );

    if (updateResults?.acknowledged) {
      return c.json({ updated: updateResults?.modifiedCount }, 200);
    }

    return c.json({ error: 'failed to update question' }, 500);
  }

  static async deleteQuestion(c: Context) {
    const questionId = c.get('questionId') as string;
    const projectId = c.get('projectId') as string;

    const isDeleted = await deleteQuestion(new ObjectId(questionId));
    if (!isDeleted) {
      return c.json({ error: 'failed to delete a question' }, 500);
    }

    await dbClient.projects?.updateOne(
      { _id: new ObjectId(projectId) },
      { $pull: { questions: new ObjectId(questionId) } },
    );

    return c.json({ deleted: 1 }, 200);
  }
}
