import { Hono } from 'hono';
import { verifyToken } from '../middlewares/authMiddelwares';
import { WorkspaceGuard } from '../middlewares/workspacesMiddlewares';
import ProjectsControllers from '../controllers/projectsControllers';
import { ProjectGuard } from '../middlewares/projectsMiddlewares';
import QuestionsController from '../controllers/questionsControllers';

const app = new Hono();

// !WARN: any other controller in any of each (projects, questions, notes) not used here is not tested yet

app.get(
  '/',
  verifyToken,
  WorkspaceGuard(),
  ProjectsControllers.getAllJoinedProjects,
);

app.post('/', verifyToken, WorkspaceGuard(), ProjectsControllers.createProject);

app.get(
  '/:projectId',
  verifyToken,
  WorkspaceGuard(),
  ProjectGuard(),
  ProjectsControllers.getProject,
);

app.put(
  '/:projectId',
  verifyToken,
  WorkspaceGuard(),
  ProjectGuard({ onlyOwner: true }),
  ProjectsControllers.updateProject,
);

app.delete(
  '/:projectId',
  verifyToken,
  WorkspaceGuard(),
  ProjectGuard({ onlyOwner: true }),
  ProjectsControllers.deleteProject,
);

app.get(
  '/:projectId/members',
  verifyToken,
  WorkspaceGuard(),
  ProjectGuard(),
  ProjectsControllers.getMembers,
);


app.post(
  '/:projectId/members',
  verifyToken,
  WorkspaceGuard(),
  ProjectGuard({ onlyOwner: true }),
  ProjectsControllers.addMembers,
);

app.delete(
  '/:projectId/members',
  verifyToken,
  WorkspaceGuard(),
  ProjectGuard({ onlyOwner: true }),
  ProjectsControllers.deleteMembers,
);

app.post(
  '/:projectId/questions',
  verifyToken,
  WorkspaceGuard(),
  ProjectGuard(),
  QuestionsController.createQuestion,
);

app.get(
  '/:projectId/questions',
  verifyToken,
  WorkspaceGuard(),
  ProjectGuard(),
  QuestionsController.getAllQuestion,
);


export default app;
