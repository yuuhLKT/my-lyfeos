import { z } from "zod";

export const EventTagSchema = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string(),
});

export type EventTag = z.infer<typeof EventTagSchema>;

export const CalendarEventSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  event_date: z.string(),
  tag: z.string().nullable(),
  created_at: z.string(),
});

export type CalendarEvent = z.infer<typeof CalendarEventSchema>;

export const CalendarEventInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  event_date: z.string(),
  tag: z.string().optional(),
});

export type CalendarEventInput = z.infer<typeof CalendarEventInputSchema>;
