import { Hono } from "hono";
import { WorkspaceGuard } from "../middlewares/workspacesMiddlewares";
import { ProjectGuard } from "../middlewares/projectsMiddlewares";
import QuestionsController from "../controllers/questionsControllers";
import { verifyToken } from "../middlewares/authMiddelwares";

const app = new Hono();

app.post(
  '/questions',
  verifyToken,
  WorkspaceGuard(),
  ProjectGuard(),
  QuestionsController.createQuestion,
);

app.get(
  '/questions',
  verifyToken,
  WorkspaceGuard(),
  ProjectGuard(),
  QuestionsController.getAllQuestion,
);

// !FIX: only author who can update the question, not project owner !

app.put(
  '/questions/:questionId',
  verifyToken,
  WorkspaceGuard(),
  ProjectGuard({ onlyOwner: true }),
  QuestionsController.updateQuestion,
);

app.delete(
  '/questions/:questionId',
  verifyToken,
  WorkspaceGuard(),
  ProjectGuard({ onlyOwner: true }),
  QuestionsController.deleteQuestion,
);

export default app;
