import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Database from "@tauri-apps/plugin-sql";
import { z } from "zod";
import {
  TaskSchema,
  TaskInputSchema,
  TaskTagSchema,
  type TaskInput,
  type TaskTag,
  type TaskWithEvent,
} from "@/schemas/tasks";

const TASKS_KEY = ["tasks"];
const TASK_TAGS_KEY = ["task-tags"];

async function getDb(): Promise<Database> {
  return Database.load("sqlite:lyfeos.db");
}

async function getTasks(): Promise<TaskWithEvent[]> {
  const db = await getDb();
  const rows = await db.select<
    Array<{
      id: number;
      title: string;
      description: string | null;
      status: string;
      priority: string;
      tag: string | null;
      start_date: string | null;
      due_date: string | null;
      event_id: number | null;
      created_at: string;
      event_title: string | null;
      event_date: string | null;
    }>
  >(
    `SELECT t.*, e.title as event_title, e.event_date as event_date
     FROM tasks t
     LEFT JOIN calendar_events e ON t.event_id = e.id
     ORDER BY t.created_at DESC`
  );
  return rows.map((r) =>
    TaskSchema.extend({
      event_title: z.string().nullable().optional(),
      event_date: z.string().nullable().optional(),
    }).parse(r)
  );
}

async function getTasksForMonth(year: number, month: number): Promise<TaskWithEvent[]> {
  const db = await getDb();
  const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const end = `${year}-${String(month + 1).padStart(2, "0")}-31`;
  const rows = await db.select<
    Array<{
      id: number;
      title: string;
      description: string | null;
      status: string;
      priority: string;
      tag: string | null;
      start_date: string | null;
      due_date: string | null;
      event_id: number | null;
      created_at: string;
      event_title: string | null;
      event_date: string | null;
    }>
  >(
    `SELECT t.*, e.title as event_title, e.event_date as event_date
     FROM tasks t
     LEFT JOIN calendar_events e ON t.event_id = e.id
     WHERE t.due_date BETWEEN ?1 AND ?2
     ORDER BY t.due_date, t.created_at`,
    [start, end]
  );
  return rows.map((r) =>
    TaskSchema.extend({
      event_title: z.string().nullable().optional(),
      event_date: z.string().nullable().optional(),
    }).parse(r)
  );
}

async function createTask(input: TaskInput): Promise<void> {
  const parsed = TaskInputSchema.parse(input);
  const db = await getDb();
  await db.execute(
    `INSERT INTO tasks (title, description, status, priority, tag, start_date, due_date, event_id)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`,
    [
      parsed.title,
      parsed.description ?? null,
      parsed.status,
      parsed.priority,
      parsed.tag ?? null,
      parsed.start_date ?? null,
      parsed.due_date ?? null,
      parsed.event_id ?? null,
    ]
  );
}

async function updateTask(id: number, input: TaskInput): Promise<void> {
  const parsed = TaskInputSchema.parse(input);
  const db = await getDb();
  await db.execute(
    `UPDATE tasks
     SET title = ?1, description = ?2, status = ?3, priority = ?4, tag = ?5, start_date = ?6, due_date = ?7, event_id = ?8
     WHERE id = ?9`,
    [
      parsed.title,
      parsed.description ?? null,
      parsed.status,
      parsed.priority,
      parsed.tag ?? null,
      parsed.start_date ?? null,
      parsed.due_date ?? null,
      parsed.event_id ?? null,
      id,
    ]
  );
}

async function deleteTask(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM tasks WHERE id = ?1", [id]);
}

async function getTaskTags(): Promise<TaskTag[]> {
  const db = await getDb();
  const rows = await db.select<
    Array<{ id: number; name: string; color: string }>
  >("SELECT * FROM task_tags ORDER BY name");
  return rows.map((r) => TaskTagSchema.parse(r));
}

async function createTaskTag(name: string, color: string): Promise<void> {
  const db = await getDb();
  await db.execute(
    "INSERT INTO task_tags (name, color) VALUES (?1, ?2)",
    [name.trim(), color]
  );
}

async function deleteTaskTag(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM task_tags WHERE id = ?1", [id]);
}

export function useTasks() {
  return useQuery({
    queryKey: TASKS_KEY,
    queryFn: getTasks,
  });
}

export function useTasksForMonth(year: number, month: number) {
  return useQuery({
    queryKey: [...TASKS_KEY, year, month],
    queryFn: () => getTasksForMonth(year, month),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: TaskInput }) => updateTask(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}

export function useTaskTags() {
  return useQuery({
    queryKey: TASK_TAGS_KEY,
    queryFn: getTaskTags,
  });
}

export function useCreateTaskTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, color }: { name: string; color: string }) => createTaskTag(name, color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_TAGS_KEY });
    },
  });
}

export function useDeleteTaskTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTaskTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_TAGS_KEY });
    },
  });
}
