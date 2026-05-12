import { z } from "zod";

export const TaskStatusSchema = z.enum(["todo", "pending", "in_progress", "done"]);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const TaskPrioritySchema = z.enum(["low", "medium", "high"]);
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;

export const TaskTagSchema = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string(),
});

export type TaskTag = z.infer<typeof TaskTagSchema>;

export const TaskSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  tag: z.string().nullable(),
  start_date: z.string().nullable(),
  due_date: z.string().nullable(),
  event_id: z.number().nullable(),
  created_at: z.string(),
});

export type Task = z.infer<typeof TaskSchema>;

export const TaskInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  tag: z.string().optional(),
  start_date: z.string().optional(),
  due_date: z.string().optional(),
  event_id: z.number().optional(),
});

export type TaskInput = z.infer<typeof TaskInputSchema>;

export interface TaskWithEvent extends Task {
  event_title?: string | null;
  event_date?: string | null;
}
