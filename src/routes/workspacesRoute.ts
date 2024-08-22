import { Hono } from 'hono';
import WorkspacesController from '../controllers/workspacesController';
import { AuthGuard } from '../middlewares/authMiddelwares';
import { WorkspaceGuard } from '../middlewares/workspacesMiddlewares';

const route = new Hono();

// get all workspaces where the user is a member
route.get('/', AuthGuard, WorkspacesController.getAllJoinedWorkspaces);

route.post('/', AuthGuard, WorkspacesController.createWorkspace);

route.get(
  '/:workspaceId',
  AuthGuard,
  WorkspaceGuard(),
  WorkspacesController.getWorkspace,
);

route.delete(
  '/:workspaceId',
  AuthGuard,
  WorkspaceGuard({ onlyOwner: true }),
  WorkspacesController.deleteWorkspace,
);

route.put(
  '/:workspaceId',
  AuthGuard,
  WorkspaceGuard({ onlyOwner: true }),
  WorkspacesController.updateWorkspace,
);

route.get(
  '/:workspaceId/members',
  AuthGuard,
  WorkspaceGuard(),
  WorkspacesController.getWorkspaceMembers,
);

route.post(
  '/:workspaceId/members',
  AuthGuard,
  WorkspaceGuard({ onlyOwner: true }),
  WorkspacesController.addMembers,
);

route.delete(
  '/:workspaceId/members',
  AuthGuard,
  WorkspaceGuard({ onlyOwner: true }),
  WorkspacesController.deleteMembers,
);

route.post(
  '/:workspaceId/change_owner',
  AuthGuard,
  WorkspaceGuard({ onlyOwner: true }),
  WorkspacesController.changeOwner,
);

export default route;
