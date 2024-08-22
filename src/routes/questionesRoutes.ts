import { Hono } from 'hono';
import { WorkspaceGuard } from '../middlewares/workspacesMiddlewares';
import { ProjectGuard } from '../middlewares/projectsMiddlewares';
import QuestionsController from '../controllers/questionsControllers';
import { AuthGuard } from '../middlewares/authMiddelwares';
import { QuestionGuard } from '../middlewares/questionsMiddlewares';

const app = new Hono();

app.post(
  '/',
  AuthGuard,
  WorkspaceGuard(),
  ProjectGuard(),
  QuestionsController.createQuestion,
);

app.get(
  '/',
  AuthGuard,
  WorkspaceGuard(),
  ProjectGuard(),
  QuestionsController.getAllQuestion,
);

app.put(
  '/:questionId',
  AuthGuard,
  WorkspaceGuard(),
  ProjectGuard(),
  QuestionGuard({ permissionMode: 'Author' }),
  QuestionsController.updateQuestion,
);

app.delete(
  '/:questionId',
  AuthGuard,
  WorkspaceGuard(),
  ProjectGuard(),
  QuestionGuard({ permissionMode: 'Owner&Author' }),
  QuestionsController.deleteQuestion,
);

export default app;
