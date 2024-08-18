import { z } from 'zod';
import { ObjectId } from 'mongodb';

export const ProjectPayloadSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  deadline: z.string().date(),
});

export const NotePayloadSchema = z.object({
  note: z.string(),
});

export const QuestionPayloadSchema = z.object({
  question: z.string(),
});

export const ReplyPayloadSchema = z.object({
  reply: z.string(),
});

export type ProjectPayload = z.infer<typeof ProjectPayloadSchema>;
export type NotePayload = z.infer<typeof NotePayloadSchema>;
export type QuestionPayload = z.infer<typeof QuestionPayloadSchema>;
export type ReplyPayload = z.infer<typeof ReplyPayloadSchema>;


export const ProjectUpdatePayloadSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  deadline: z.date().optional(),
});

export const NoteUpdatePayloadSchema = z.object({
  note: z.string().optional(),
});

export const QuestionUpdatePayloadSchema = z.object({
  question: z.string().optional(),
});

export const ReplyUpdatePayloadSchema = z.object({
  reply: z.string().optional(),
});

export type ProjectUpdatePayload = z.infer<typeof ProjectUpdatePayloadSchema>;
export type NoteUpdatePayload = z.infer<typeof NoteUpdatePayloadSchema>;
export type QuestionUpdatePayload = z.infer<typeof QuestionUpdatePayloadSchema>;
export type ReplyUpdatePayload = z.infer<typeof ReplyUpdatePayloadSchema>;

export type ProjectDocument = ProjectPayload & {
  owner: ObjectId,
  all_states: string[],
  all_labels: string[],
  members: ObjectId[],
  tasks: ObjectId[],
  notes: ObjectId[],
  questions: ObjectId[],
  created_at: Date
};

export type NoteDocument = NotePayload & {
  author: ObjectId;
  created_at: Date,
};

export type QuestionDocument = QuestionPayload & {
  author: ObjectId,
  replies: ObjectId[],
  created_at: Date,
};

export type ReplyDocument = ReplyPayload & {
  author: ObjectId,
  created_at: Date,
};
