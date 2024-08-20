import { Hono } from 'hono';
import { verifyToken } from '../middlewares/authMiddelwares';
import { WorkspaceGuard } from '../middlewares/workspacesMiddlewares';
import ProjectsControllers from '../controllers/projectsControllers';
import { ProjectGuard } from '../middlewares/projectsMiddlewares';

const app = new Hono();

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

export default app;
