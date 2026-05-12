import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Database from "@tauri-apps/plugin-sql";
import {
  CalendarEventSchema,
  CalendarEventInputSchema,
  EventTagSchema,
  type CalendarEvent,
  type CalendarEventInput,
  type EventTag,
} from "@/schemas/calendar";

const CALENDAR_EVENTS_KEY = ["calendar-events"];
const EVENT_TAGS_KEY = ["event-tags"];

async function getDb(): Promise<Database> {
  return Database.load("sqlite:lyfeos.db");
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function getEventsForMonth(year: number, month: number): Promise<CalendarEvent[]> {
  const db = await getDb();
  const start = formatDate(new Date(year, month, 1));
  const end = formatDate(new Date(year, month + 1, 0));
  const rows = await db.select<
    Array<{
      id: number;
      title: string;
      description: string | null;
      event_date: string;
      tag: string | null;
      created_at: string;
    }>
  >(
    "SELECT * FROM calendar_events WHERE event_date BETWEEN ?1 AND ?2 ORDER BY event_date, created_at",
    [start, end]
  );
  return rows.map((r) => CalendarEventSchema.parse(r));
}

async function createEvent(input: CalendarEventInput): Promise<void> {
  const parsed = CalendarEventInputSchema.parse(input);
  const db = await getDb();
  await db.execute(
    "INSERT INTO calendar_events (title, description, event_date, tag) VALUES (?1, ?2, ?3, ?4)",
    [parsed.title, parsed.description ?? null, parsed.event_date, parsed.tag ?? null]
  );
}

async function updateEvent(id: number, input: CalendarEventInput): Promise<void> {
  const parsed = CalendarEventInputSchema.parse(input);
  const db = await getDb();
  await db.execute(
    "UPDATE calendar_events SET title = ?1, description = ?2, event_date = ?3, tag = ?4 WHERE id = ?5",
    [parsed.title, parsed.description ?? null, parsed.event_date, parsed.tag ?? null, id]
  );
}

async function deleteEvent(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM calendar_events WHERE id = ?1", [id]);
}

async function getEventTags(): Promise<EventTag[]> {
  const db = await getDb();
  const rows = await db.select<
    Array<{ id: number; name: string; color: string }>
  >("SELECT * FROM event_tags ORDER BY name");
  return rows.map((r) => EventTagSchema.parse(r));
}

async function createEventTag(name: string, color: string): Promise<void> {
  const db = await getDb();
  await db.execute(
    "INSERT INTO event_tags (name, color) VALUES (?1, ?2)",
    [name.trim(), color]
  );
}

async function deleteEventTag(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM event_tags WHERE id = ?1", [id]);
}

export function useCalendarEvents(year: number, month: number) {
  return useQuery({
    queryKey: [...CALENDAR_EVENTS_KEY, year, month],
    queryFn: () => getEventsForMonth(year, month),
  });
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CALENDAR_EVENTS_KEY });
    },
  });
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: CalendarEventInput }) => updateEvent(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CALENDAR_EVENTS_KEY });
    },
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CALENDAR_EVENTS_KEY });
    },
  });
}

export function useEventTags() {
  return useQuery({
    queryKey: EVENT_TAGS_KEY,
    queryFn: getEventTags,
  });
}

export function useCreateEventTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, color }: { name: string; color: string }) => createEventTag(name, color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_TAGS_KEY });
    },
  });
}

export function useDeleteEventTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEventTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_TAGS_KEY });
    },
  });
}
