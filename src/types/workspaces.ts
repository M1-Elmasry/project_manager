import { ObjectId } from 'mongodb';
import { z } from 'zod';

export const WorkspacePayloadSchema = z.object({
  name: z.string().min(3),
  description: z.string(),
});

export const WorkspaceUpdatePayloadSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional(),
});

export type WorkspacePayload = z.infer<typeof WorkspacePayloadSchema>;
export type WorkspaceUpdatePayload = z.infer<
  typeof WorkspaceUpdatePayloadSchema
>;

export type Workspace = WorkspacePayload & {
  owner: ObjectId;
  projects: ObjectId[];
  members: ObjectId[];
};
