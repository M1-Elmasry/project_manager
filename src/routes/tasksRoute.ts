import { Hono } from 'hono';
import TasksController from '../controllers/tasksController';
import ChecklistsController from '../controllers/checklistsController';
import ChecklistItemsController from '../controllers/checklistItemsController';
import {
  ChecklistGuard,
  ChecklistItemGuard,
  TaskGuard,
} from '../middlewares/tasksMiddlewares';

const tasksRoute = new Hono();
const checklistsRoute = new Hono();
const checklistItemsRoute = new Hono();

tasksRoute.use('/:taskId/*', TaskGuard());
checklistsRoute.use('/:checklistId/*', ChecklistGuard());
checklistItemsRoute.use('/:itemId/*', ChecklistItemGuard());

// Tasks CRUD //

tasksRoute.get('/', TasksController.getTasks);
tasksRoute.post('/', TasksController.createTask);
tasksRoute.put('/:taskId', TasksController.updateTask);
tasksRoute.delete('/:taskId', TasksController.deleteTask);

// Tasks Operations //

tasksRoute.get('/:taskId/set_archived', TasksController.setArchived);
tasksRoute.get('/:taskId/unset_archived', TasksController.unsetArchived);

// Checklists CRUD //

checklistsRoute.post('/', ChecklistsController.createChecklist);
checklistsRoute.put('/:checklistId', ChecklistsController.updateChecklist);
checklistsRoute.delete('/:checklistId', ChecklistsController.deleteChecklist);

// ChecklistItems CRUD //

checklistItemsRoute.post('/', ChecklistItemsController.createItem);
checklistItemsRoute.put('/:itemId', ChecklistItemsController.updateItem);
checklistItemsRoute.delete('/:itemId', ChecklistItemsController.deleteItem);

// ChecklistItems Operations //

checklistItemsRoute.get('/:itemId/check', ChecklistItemsController.checkItem);
checklistItemsRoute.get(
  '/:itemId/uncheck',
  ChecklistItemsController.uncheckItem,
);

// Sub Routes //

tasksRoute.route('/:taskId/checklists', checklistsRoute);
tasksRoute.route('/:taskId/checklists/:checklistId/items', checklistItemsRoute);

export default tasksRoute;
