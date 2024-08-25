import { Hono } from 'hono';
import QuestionsController from '../controllers/questionsControllers';
import { QuestionGuard } from '../middlewares/questionsMiddlewares';

const app = new Hono();

app.post('/', QuestionsController.createQuestion);

app.get('/', QuestionsController.getAllQuestion);

app.put(
  '/:questionId',
  QuestionGuard({ permissionMode: 'Author' }),
  QuestionsController.updateQuestion,
);

app.delete(
  '/:questionId',
  QuestionGuard({ permissionMode: 'Owner&Author' }),
  QuestionsController.deleteQuestion,
);

export default app;
