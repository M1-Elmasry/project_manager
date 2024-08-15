import { Hono } from 'hono';
import WorkspacesController from '../controllers/workspacesController';
import { verifyToken } from '../middlewares/authMiddelwares';
import { WorkspaceGuard } from '../middlewares/workspacesMiddlewares';

const route = new Hono();

// get all workspaces where the user is a member
route.get('/', verifyToken, WorkspacesController.getAllJoinedWorkspaces);

route.post('/', verifyToken, WorkspacesController.createWorkspace);

route.get(
  '/:workspaceId',
  verifyToken,
  WorkspaceGuard(),
  WorkspacesController.getWorkspace,
);

route.delete(
  '/:workspaceId',
  verifyToken,
  WorkspaceGuard({ onlyOwner: true }),
  WorkspacesController.deleteWorkspace,
);

route.put(
  '/:workspaceId',
  verifyToken,
  WorkspaceGuard({ onlyOwner: true }),
  WorkspacesController.updateWorkspace,
);

route.get(
  '/:workspaceId/members',
  verifyToken,
  WorkspaceGuard(),
  WorkspacesController.getWorkspaceMembers,
);

route.post(
  '/:workspaceId/members',
  verifyToken,
  WorkspaceGuard({ onlyOwner: true }),
  WorkspacesController.addMembers,
);

route.delete(
  '/:workspaceId/members',
  verifyToken,
  WorkspaceGuard({ onlyOwner: true }),
  WorkspacesController.deleteMembers,
);

route.get(
  '/:workspaceId/projects',
  verifyToken,
  WorkspaceGuard(),
  WorkspacesController.getWorkspaceProjects,
);

route.post(
  '/:workspaceId/change_owner',
  verifyToken,
  WorkspaceGuard({ onlyOwner: true }),
  WorkspacesController.changeOwner,
);

export default route;
