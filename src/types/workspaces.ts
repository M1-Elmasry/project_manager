import { ObjectId } from 'mongodb';
import { z } from 'zod';

export const WorkspacePayloadSchema = z.object({
  name: z.string().min(3),
  description: z.string(),
});

export type WorkspacePayload = z.infer<typeof WorkspacePayloadSchema>;

export type Workspace = WorkspacePayload & {
  owner: ObjectId;
  projects: ObjectId[];
  members: ObjectId[];
};
