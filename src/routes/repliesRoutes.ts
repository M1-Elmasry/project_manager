import { Hono } from 'hono';
import { ReplyGuard } from '@middlewares/repliesMiddlewares';
import RepliesController from '@controllers/repliesControllers';

const app = new Hono();

app.post('/', RepliesController.createReply);

app.put('/:replyId', ReplyGuard(), RepliesController.updateReply);

app.delete(
  '/:replyId',
  ReplyGuard({ allowAdmins: true }),
  RepliesController.deleteReply,
);

export default app;
