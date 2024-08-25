import { ObjectId } from 'mongodb';
import { z } from 'zod';

// Task //

export const TaskPayloadSchema = z.object({
  title: z.string().min(3),
  body: z.string(),
  deadline: z.string().date('example: yyyy-mm-dd').optional(),
  state: z.string().min(1, 'state cannot be empty'),
  labels: z.array(z.string()),
});

export const TaskUpdatePayloadSchema = z.object({
  title: z.string().min(3).optional(),
  body: z.string().optional(),
  deadline: z.string().date('example: yyyy-mm-dd').optional(),
  state: z.string().min(1, 'state cannot be empty').optional(),
  labels: z.array(z.string()).optional(),
});

export type TaskPayload = z.infer<typeof TaskPayloadSchema>;
export type TaskUpdatePayload = z.infer<typeof TaskUpdatePayloadSchema>;

export type TaskDocument = TaskPayload & {
  createdAt: Date;
  isArchived: boolean;
  checklists: ObjectId[];
};

// Checklist //

export const ChecklistPayloadSchema = z.object({
  title: z.string().min(1, 'checklist title cannot be empty'),
});

export type ChecklistPayload = z.infer<typeof ChecklistPayloadSchema>;

export type ChecklistDocument = ChecklistPayload & {
  items: ObjectId[];
};

// ChecklistItem //

export const ChecklistItemPayloadSchema = z.object({
  content: z.string().min(1, 'checklist item title cannot be empty'),
});

export type ChecklistItemPayload = z.infer<typeof ChecklistItemPayloadSchema>;

export type ChecklistItemDocument = ChecklistItemPayload & {
  isChecked: boolean;
};
