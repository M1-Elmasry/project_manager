import { Context } from 'hono';
import { isValidObjectId } from '@utils/helpers';

export interface GuardOptions {
  onlyOwner?: boolean;
}

export const DEFAULT_GUARDS: [key: string, guardName: string][] = [
  ['userId', 'AuthGuard'],
  ['projectId', 'ProjectGuard'],
  ['workspaceId', 'WorkspaceGuard'],
];

export const guardUsageValidator = (
  paramName: string,
  c: Context,
): string | undefined => {
  // validate default guards existence
  for (const [key, guardName] of DEFAULT_GUARDS) {
    if (!c.get(key)) {
      throw new Error(`Must be used after ${guardName} middleware`);
    }
  }

  // validate param existence
  const paramValue = c.req.param(paramName);
  if (!paramValue) {
    throw new Error(
      `Missing param: ${paramName}, add :${paramName} it to the route path`,
    );
  }

  return isValidObjectId(paramValue) ? paramValue : undefined;
};
