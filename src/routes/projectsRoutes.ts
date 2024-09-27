import { Hono } from 'hono';
import { AuthGuard } from '@middlewares/authMiddelwares';
import { WorkspaceGuard } from '@middlewares/workspacesMiddlewares';
import ProjectsControllers from '@controllers/projectsControllers';
import { ProjectGuard } from '@middlewares/projectsMiddlewares';

const app = new Hono();

app.get(
  '/',
  AuthGuard,
  WorkspaceGuard(),
  ProjectsControllers.getAllJoinedProjects,
);

app.post('/', AuthGuard, WorkspaceGuard(), ProjectsControllers.createProject);

app.get(
  '/:projectId',
  AuthGuard,
  WorkspaceGuard(),
  ProjectGuard(),
  ProjectsControllers.getProject,
);

app.put(
  '/:projectId',
  AuthGuard,
  WorkspaceGuard(),
  ProjectGuard({ onlyOwner: true }),
  ProjectsControllers.updateProject,
);

app.delete(
  '/:projectId',
  AuthGuard,
  WorkspaceGuard(),
  ProjectGuard({ onlyOwner: true }),
  ProjectsControllers.deleteProject,
);

app.get(
  '/:projectId/members',
  AuthGuard,
  WorkspaceGuard(),
  ProjectGuard(),
  ProjectsControllers.getMembers,
);

app.put(
  '/:projectId/add_members',
  AuthGuard,
  WorkspaceGuard(),
  ProjectGuard({ onlyOwner: true }),
  ProjectsControllers.addMembers,
);

app.put(
  '/:projectId/remove_members',
  AuthGuard,
  WorkspaceGuard(),
  ProjectGuard({ onlyOwner: true }),
  ProjectsControllers.deleteMembers,
);

export default app;
