import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  useCalendarEvents,
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
  useDeleteCalendarEvent,
  useEventTags,
  useCreateEventTag,
} from "@/hooks/useCalendar";
import { useTasksForMonth } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Pencil,
  X,
  Tag,
  CheckSquare,
  Square,
} from "lucide-react";
import type { CalendarEvent, CalendarEventInput, EventTag } from "@/schemas/calendar";
import type { TaskWithEvent } from "@/schemas/tasks";

const WEEKDAYS_SHORT = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

const PRESET_COLORS = [
  { hex: "#3b82f6" },
  { hex: "#f59e0b" },
  { hex: "#10b981" },
  { hex: "#f43f5e" },
  { hex: "#8b5cf6" },
  { hex: "#06b6d4" },
  { hex: "#f97316" },
  { hex: "#64748b" },
];

function getCalendarGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = firstDay.getDay();
  const grid: (number | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) grid.push(null);
  for (let d = 1; d <= daysInMonth; d++) grid.push(d);
  return grid;
}

function formatDateKey(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function monthYearLabel(year: number, month: number, locale: string): string {
  return new Date(year, month).toLocaleDateString(locale === "pt-BR" ? "pt-BR" : "en-US", {
    month: "long",
    year: "numeric",
  });
}

function tagColor(tagName: string | null, tagMap: Map<string, string>): string {
  if (!tagName) return "#64748b";
  return tagMap.get(tagName) ?? "#64748b";
}

export function CalendarScreen() {
  const { t, i18n } = useTranslation();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [activeTab, setActiveTab] = useState<"events" | "tasks">("events");

  const { data: events = [] } = useCalendarEvents(viewYear, viewMonth);
  const { data: tasks = [] } = useTasksForMonth(viewYear, viewMonth);
  const { data: tags = [] } = useEventTags();
  const createEvent = useCreateCalendarEvent();
  const updateEvent = useUpdateCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();

  const grid = useMemo(() => getCalendarGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const tagMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const tag of tags) map.set(tag.name, tag.color);
    return map;
  }, [tags]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const evt of events) {
      const list = map.get(evt.event_date) ?? [];
      list.push(evt);
      map.set(evt.event_date, list);
    }
    return map;
  }, [events]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, TaskWithEvent[]>();
    for (const task of tasks) {
      const date = task.due_date ?? task.event_date;
      if (!date) continue;
      const list = map.get(date) ?? [];
      list.push(task);
      map.set(date, list);
    }
    return map;
  }, [tasks]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleDayClick = (day: number) => {
    const dateKey = formatDateKey(viewYear, viewMonth, day);
    setSelectedDate(dateKey);
    setEditingEvent(null);
    setActiveTab("events");
    setIsDialogOpen(true);
  };

  const handleSave = (input: CalendarEventInput) => {
    if (editingEvent) {
      updateEvent.mutate(
        { id: editingEvent.id, input },
        { onSuccess: () => setEditingEvent(null) }
      );
    } else {
      createEvent.mutate(input, { onSuccess: () => setEditingEvent(null) });
    }
  };

  const handleDelete = (id: number) => {
    deleteEvent.mutate(id);
  };

  const selectedEvents = selectedDate ? (eventsByDate.get(selectedDate) ?? []) : [];
  const selectedTasks = selectedDate ? (tasksByDate.get(selectedDate) ?? []) : [];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 py-6 px-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("calendar.title")}</h1>
          <p className="text-muted-foreground">{t("calendar.description")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-[10rem] text-center font-semibold capitalize">
            {monthYearLabel(viewYear, viewMonth, i18n.language)}
          </span>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <Separator />

      <div className="rounded-lg border">
        <div className="grid grid-cols-7 border-b bg-muted/50">
          {WEEKDAYS_SHORT.map((d) => (
            <div
              key={d}
              className="px-2 py-3 text-center text-xs font-semibold uppercase text-muted-foreground"
            >
              {t(`calendar.weekdays.${d}`)}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {grid.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="min-h-[6rem] border-b border-r bg-muted/20" />;
            }
            const dateKey = formatDateKey(viewYear, viewMonth, day);
            const dayEvents = eventsByDate.get(dateKey) ?? [];
            const dayTasks = tasksByDate.get(dateKey) ?? [];
            const isToday =
              today.getFullYear() === viewYear &&
              today.getMonth() === viewMonth &&
              today.getDate() === day;

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "relative flex min-h-[6rem] flex-col items-start border-b border-r p-2 text-left transition-colors hover:bg-muted/50",
                  isToday && "bg-primary/5"
                )}
              >
                <span
                  className={cn(
                    "mb-1 flex size-7 items-center justify-center rounded-full text-sm font-medium",
                    isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                  )}
                >
                  {day}
                </span>
                <div className="flex w-full flex-col gap-0.5">
                  {dayEvents.slice(0, 2).map((evt) => (
                    <div
                      key={evt.id}
                      className="flex w-full items-center gap-1 rounded-sm px-1 py-0.5 text-[10px] font-medium"
                      style={{
                        backgroundColor: `${tagColor(evt.tag, tagMap)}20`,
                        color: tagColor(evt.tag, tagMap),
                      }}
                    >
                      <span
                        className="inline-block h-1.5 w-1 shrink-0 rounded-full"
                        style={{ backgroundColor: tagColor(evt.tag, tagMap) }}
                      />
                      <span className="truncate">{evt.title}</span>
                    </div>
                  ))}
                  {dayTasks.slice(0, 2).map((task) => (
                    <div
                      key={task.id}
                      className="flex w-full items-center gap-1 rounded-sm px-1 py-0.5 text-[10px] font-medium"
                      style={{
                        backgroundColor: `${PRIORITY_COLORS[task.priority]}20`,
                        color: PRIORITY_COLORS[task.priority],
                      }}
                    >
                      {task.status === "done" ? (
                        <CheckSquare className="inline-block h-2.5 w-2.5 shrink-0" />
                      ) : (
                        <Square className="inline-block h-2.5 w-2.5 shrink-0" />
                      )}
                      <span className="truncate">{task.title}</span>
                    </div>
                  ))}
                  {dayEvents.length + dayTasks.length > 4 && (
                    <span className="px-1 text-[10px] font-medium text-muted-foreground">
                      +{dayEvents.length + dayTasks.length - 4}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg">
              {selectedDate
                ? new Date(selectedDate + "T00:00:00").toLocaleDateString(
                    i18n.language === "pt-BR" ? "pt-BR" : "en-US",
                    { weekday: "long", year: "numeric", month: "long", day: "numeric" }
                  )
                : t("calendar.title")}
            </DialogTitle>
            <DialogDescription>{t("calendar.sheetDescription")}</DialogDescription>
          </DialogHeader>

          <div className="flex rounded-md border">
            <Button
              variant={activeTab === "events" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 flex-1 rounded-none rounded-l-md text-xs"
              onClick={() => { setActiveTab("events"); setEditingEvent(null); }}
            >
              {t("calendar.tabs.events")} ({selectedEvents.length})
            </Button>
            <Button
              variant={activeTab === "tasks" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 flex-1 rounded-none rounded-r-md text-xs"
              onClick={() => { setActiveTab("tasks"); setEditingEvent(null); }}
            >
              {t("calendar.tabs.tasks")} ({selectedTasks.length})
            </Button>
          </div>

          <div className="space-y-4">
            {activeTab === "events" ? (
              <>
                <EventForm
                  key={editingEvent?.id ?? "new"}
                  date={selectedDate ?? ""}
                  initial={editingEvent}
                  tags={tags}
                  onSave={handleSave}
                  onCancel={() => setEditingEvent(null)}
                  isSubmitting={createEvent.isPending || updateEvent.isPending}
                />

                <Separator />

                {selectedEvents.length > 0 ? (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">{t("calendar.eventsForDay")}</h3>
                    <div className="space-y-2">
                      {selectedEvents.map((evt) => (
                        <div
                          key={evt.id}
                          className="flex items-start justify-between gap-2 rounded-md border p-2.5"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-medium">{evt.title}</p>
                              {evt.tag && (
                                <span
                                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                                  style={{ backgroundColor: tagColor(evt.tag, tagMap) }}
                                />
                              )}
                            </div>
                            {evt.description && (
                              <p className="mt-0.5 text-xs text-muted-foreground">{evt.description}</p>
                            )}
                            {evt.tag && (
                              <Badge
                                variant="outline"
                                className="mt-1.5 h-4 text-[10px] px-1.5 py-0"
                                style={{
                                  borderColor: tagColor(evt.tag, tagMap),
                                  color: tagColor(evt.tag, tagMap),
                                }}
                              >
                                {evt.tag}
                              </Badge>
                            )}
                          </div>
                          <div className="flex shrink-0 gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setEditingEvent(evt)}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleDelete(evt.id)}
                              disabled={deleteEvent.isPending}
                            >
                              <Trash2 className="size-3.5 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  !editingEvent && (
                    <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                      <CalendarIcon className="mb-1.5 size-7 opacity-50" />
                      <p className="text-sm">{t("calendar.noEvents")}</p>
                    </div>
                  )
                )}
              </>
            ) : (
              <>
                {selectedTasks.length > 0 ? (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">{t("calendar.tasksForDay")}</h3>
                    <div className="space-y-2">
                      {selectedTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-start justify-between gap-2 rounded-md border p-2.5"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              {task.status === "done" ? (
                                <CheckSquare className="size-4 shrink-0 text-emerald-500" />
                              ) : (
                                <Square className="size-4 shrink-0 text-muted-foreground" />
                              )}
                              <p className={cn("truncate text-sm font-medium", task.status === "done" && "line-through text-muted-foreground")}>
                                {task.title}
                              </p>
                            </div>
                            {task.description && (
                              <p className="mt-0.5 text-xs text-muted-foreground">{task.description}</p>
                            )}
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {task.tag && (
                                <Badge variant="outline" className="h-4 text-[10px] px-1.5 py-0">
                                  {task.tag}
                                </Badge>
                              )}
                              <Badge
                                variant="outline"
                                className="h-4 text-[10px] px-1.5 py-0"
                                style={{
                                  borderColor: PRIORITY_COLORS[task.priority],
                                  color: PRIORITY_COLORS[task.priority],
                                }}
                              >
                                {t(`tasks.priorities.${task.priority}`)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                    <CheckSquare className="mb-1.5 size-7 opacity-50" />
                    <p className="text-sm">{t("calendar.noTasks")}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const PRIORITY_COLORS: Record<string, string> = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#f43f5e",
};

function EventForm({
  date,
  initial,
  tags,
  onSave,
  onCancel,
  isSubmitting,
}: {
  date: string;
  initial: CalendarEvent | null;
  tags: EventTag[];
  onSave: (input: CalendarEventInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const { t } = useTranslation();
  const createTag = useCreateEventTag();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [selectedTag, setSelectedTag] = useState<string | undefined>(initial?.tag ?? undefined);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0].hex);
  const [showNewTag, setShowNewTag] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      event_date: initial?.event_date ?? date,
      tag: selectedTag,
    });
    if (!initial) {
      setTitle("");
      setDescription("");
      setSelectedTag(undefined);
    }
  };

  const handleCreateTag = () => {
    const name = newTagName.trim();
    if (!name) return;
    createTag.mutate(
      { name, color: newTagColor },
      {
        onSuccess: () => {
          setSelectedTag(name);
          setNewTagName("");
          setShowNewTag(false);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="event-title" className="text-xs">{t("calendar.form.title")}</Label>
        <Input
          id="event-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("calendar.form.titlePlaceholder")}
          required
          className="h-8 text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs flex items-center gap-1">
            <Tag className="size-3" />
            {t("calendar.form.tag")}
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-5 px-1.5 text-[10px]"
            onClick={() => setShowNewTag((s) => !s)}
          >
            {showNewTag ? t("calendar.form.selectTag") : t("calendar.form.newTag")}
          </Button>
        </div>

        {showNewTag ? (
          <div className="space-y-2 rounded-md border bg-muted/30 p-2.5">
            <Input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder={t("calendar.form.tagNamePlaceholder")}
              className="h-8 text-sm"
            />
            <div className="flex flex-wrap gap-1.5">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setNewTagColor(c.hex)}
                  className={cn(
                    "size-5 rounded-full ring-2 ring-offset-1 transition-all",
                    newTagColor === c.hex ? "ring-foreground" : "ring-transparent"
                  )}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
            <Button
              type="button"
              size="sm"
              className="h-7 w-full text-xs"
              onClick={handleCreateTag}
              disabled={!newTagName.trim() || createTag.isPending}
            >
              <Plus className="mr-1 size-3" />
              {t("calendar.form.createTag")}
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {tags.length === 0 && (
              <span className="text-xs text-muted-foreground">{t("calendar.form.noTags")}</span>
            )}
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() =>
                  setSelectedTag((prev) => (prev === tag.name ? undefined : tag.name))
                }
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-all",
                  selectedTag === tag.name
                    ? "ring-1 ring-offset-1"
                    : "opacity-70 hover:opacity-100"
                )}
                style={{
                  borderColor: tag.color,
                  color: tag.color,
                  backgroundColor: `${tag.color}15`,
                  ...(selectedTag === tag.name ? { ringColor: tag.color } : {}),
                }}
              >
                <span
                  className="inline-block size-1.5 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                {tag.name}
              </button>
            ))}
            {selectedTag && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-5 px-1.5 text-[10px] text-muted-foreground"
                onClick={() => setSelectedTag(undefined)}
              >
                <X className="mr-0.5 size-3" />
                {t("calendar.form.clearTag")}
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="event-desc" className="text-xs">{t("calendar.form.description")}</Label>
        <Textarea
          id="event-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("calendar.form.descriptionPlaceholder")}
          rows={2}
          className="min-h-0 text-sm"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={isSubmitting} className="h-8 flex-1 text-xs">
          <Plus className="mr-1 size-3.5" />
          {initial ? t("calendar.form.save") : t("calendar.form.add")}
        </Button>
        {initial && (
          <Button type="button" variant="outline" onClick={onCancel} className="h-8 text-xs">
            {t("calendar.form.cancel")}
          </Button>
        )}
      </div>
    </form>
  );
}
