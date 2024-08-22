import { Hono } from 'hono';
import { WorkspaceGuard } from '../middlewares/workspacesMiddlewares';
import { ProjectGuard } from '../middlewares/projectsMiddlewares';
import { AuthGuard } from '../middlewares/authMiddelwares';
import { QuestionGuard } from '../middlewares/questionsMiddlewares';
import { ReplyGuard } from '../middlewares/repliesMiddlewares';
import RepliesController from '../controllers/repliesControllers';

const app = new Hono();

app.post(
  '/',
  AuthGuard,
  WorkspaceGuard(),
  ProjectGuard(),
  QuestionGuard(),
  RepliesController.createReply,
);

app.put(
  '/:replyId',
  AuthGuard,
  WorkspaceGuard(),
  ProjectGuard(),
  QuestionGuard(),
  ReplyGuard(),
  RepliesController.updateReply,
);

app.delete(
  '/:replyId',
  AuthGuard,
  WorkspaceGuard(),
  ProjectGuard(),
  QuestionGuard(),
  ReplyGuard({ allowAdmins: true }),
  RepliesController.deleteReply,
);

export default app;
