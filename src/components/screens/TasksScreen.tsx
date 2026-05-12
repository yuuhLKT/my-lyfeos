import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useTaskTags,
  useCreateTaskTag,
} from "@/hooks/useTasks";
import { useCalendarEvents } from "@/hooks/useCalendar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Plus,
  Trash2,
  Pencil,
  LayoutGrid,
  List,
  Search,
  X,
  Tag,
  CalendarDays,
  CheckCircle2,
  Circle,
  ArrowRightCircle,
  Clock,
  Flag,
  GripVertical,
  ChevronDown,
} from "lucide-react";
import type { TaskWithEvent, TaskInput, TaskStatus, TaskPriority } from "@/schemas/tasks";

const STATUSES: TaskStatus[] = ["todo", "pending", "in_progress", "done"];

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#f43f5e",
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: "#64748b",
  pending: "#f59e0b",
  in_progress: "#3b82f6",
  done: "#10b981",
};

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

function statusIcon(status: TaskStatus) {
  switch (status) {
    case "todo": return Circle;
    case "pending": return Clock;
    case "in_progress": return ArrowRightCircle;
    case "done": return CheckCircle2;
  }
}

function StatusBadge({ status }: { status: TaskStatus }) {
  const { t } = useTranslation();
  const Icon = statusIcon(status);
  const color = STATUS_COLORS[status];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium"
      style={{
        borderColor: color,
        color: color,
        backgroundColor: `${color}15`,
      }}
    >
      <Icon className="size-3" />
      {t(`tasks.statuses.${status}`)}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const color = PRIORITY_COLORS[priority];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium"
      style={{
        borderColor: color,
        color: color,
        backgroundColor: `${color}15`,
      }}
    >
      <span className="inline-block size-1.5 rounded-full" style={{ backgroundColor: color }} />
      {priority}
    </span>
  );
}

function PrioritySelectItem({ value, label }: { value: TaskPriority; label: string }) {
  return (
    <SelectItem value={value}>
      <span className="flex items-center gap-2">
        <span className="inline-block size-2 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[value] }} />
        {label}
      </span>
    </SelectItem>
  );
}

function StatusSelectItem({ value, label }: { value: TaskStatus; label: string }) {
  const Icon = statusIcon(value);
  const color = STATUS_COLORS[value];
  return (
    <SelectItem value={value}>
      <span className="flex items-center gap-2">
        <Icon className="size-3" style={{ color }} />
        {label}
      </span>
    </SelectItem>
  );
}

export function TasksScreen() {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<TaskPriority | "all">("all");
  const [filterTag, setFilterTag] = useState<string>("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithEvent | null>(null);
  const [viewingTask, setViewingTask] = useState<TaskWithEvent | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);

  const { data: tasks = [] } = useTasks();
  const { data: taskTags = [] } = useTaskTags();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const tagMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const tag of taskTags) map.set(tag.name, tag.color);
    return map;
  }, [taskTags]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        (task.description?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchesStatus = filterStatus === "all" || task.status === filterStatus;
      const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
      const matchesTag = filterTag === "all" || task.tag === filterTag;
      const matchesDateRange = (() => {
        if (!filterDateFrom && !filterDateTo) return true;
        const checkDate = task.due_date || task.start_date;
        if (!checkDate) return false;
        if (filterDateFrom && checkDate < filterDateFrom) return false;
        if (filterDateTo && checkDate > filterDateTo) return false;
        return true;
      })();
      return matchesSearch && matchesStatus && matchesPriority && matchesTag && matchesDateRange;
    });
  }, [tasks, search, filterStatus, filterPriority, filterTag, filterDateFrom, filterDateTo]);

  const tasksByStatus = useMemo(() => {
    const map = new Map<TaskStatus, TaskWithEvent[]>();
    for (const s of STATUSES) map.set(s, []);
    for (const task of filteredTasks) {
      const list = map.get(task.status) ?? [];
      list.push(task);
      map.set(task.status, list);
    }
    return map;
  }, [filteredTasks]);

  const handleSave = (input: TaskInput) => {
    if (editingTask) {
      updateTask.mutate(
        { id: editingTask.id, input },
        { onSuccess: () => { setEditingTask(null); setIsFormOpen(false); } }
      );
    } else {
      createTask.mutate(input, { onSuccess: () => { setEditingTask(null); setIsFormOpen(false); } });
    }
  };

  const handleDelete = (id: number) => {
    deleteTask.mutate(id, {
      onSuccess: () => { setIsDetailOpen(false); setViewingTask(null); },
    });
  };

  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData("text/plain", taskId.toString());
    e.dataTransfer.effectAllowed = "move";
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStatus(status);
  };

  const handleDragLeave = () => {
    setDragOverStatus(null);
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = Number(e.dataTransfer.getData("text/plain")) || draggedTaskId;
    setDragOverStatus(null);
    setDraggedTaskId(null);
    if (!taskId) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === status) return;
    updateTask.mutate({
      id: taskId,
      input: {
        title: task.title,
        description: task.description ?? undefined,
        status,
        priority: task.priority,
        tag: task.tag ?? undefined,
        start_date: task.start_date ?? undefined,
        due_date: task.due_date ?? undefined,
        event_id: task.event_id ?? undefined,
      },
    });
  };

  const openDetail = (task: TaskWithEvent) => {
    setViewingTask(task);
    setIsDetailOpen(true);
  };

  const openEdit = (task: TaskWithEvent) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const hasActiveFilters = search || filterStatus !== "all" || filterPriority !== "all" || filterTag !== "all" || filterDateFrom || filterDateTo;

  const clearFilters = () => {
    setSearch("");
    setFilterStatus("all");
    setFilterPriority("all");
    setFilterTag("all");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 py-6 px-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("tasks.title")}</h1>
          <p className="text-muted-foreground">{t("tasks.description")}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border">
            <Button
              variant={viewMode === "kanban" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 rounded-none rounded-l-md"
              onClick={() => setViewMode("kanban")}
            >
              <LayoutGrid className="mr-1 size-3.5" />
              {t("tasks.kanban")}
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 rounded-none rounded-r-md"
              onClick={() => setViewMode("list")}
            >
              <List className="mr-1 size-3.5" />
              {t("tasks.list")}
            </Button>
          </div>
          <Button
            size="sm"
            className="h-8"
            onClick={() => { setEditingTask(null); setIsFormOpen(true); }}
          >
            <Plus className="mr-1 size-3.5" />
            {t("tasks.newTask")}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("tasks.search")}
            className="h-8 pl-8 text-sm"
          />
        </div>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as TaskStatus | "all")}>
          <SelectTrigger className="h-8 w-32 text-xs">
            <SelectValue placeholder={t("tasks.filter.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("tasks.statuses.all")}</SelectItem>
            <StatusSelectItem value="todo" label={t("tasks.statuses.todo")} />
            <StatusSelectItem value="pending" label={t("tasks.statuses.pending")} />
            <StatusSelectItem value="in_progress" label={t("tasks.statuses.in_progress")} />
            <StatusSelectItem value="done" label={t("tasks.statuses.done")} />
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={(v) => setFilterPriority(v as TaskPriority | "all")}>
          <SelectTrigger className="h-8 w-32 text-xs">
            <SelectValue placeholder={t("tasks.filter.priority")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("tasks.priorities.all")}</SelectItem>
            <PrioritySelectItem value="low" label={t("tasks.priorities.low")} />
            <PrioritySelectItem value="medium" label={t("tasks.priorities.medium")} />
            <PrioritySelectItem value="high" label={t("tasks.priorities.high")} />
          </SelectContent>
        </Select>
        <Select value={filterTag} onValueChange={setFilterTag}>
          <SelectTrigger className="h-8 w-32 text-xs">
            <SelectValue placeholder={t("tasks.filter.tag")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("tasks.filter.allTags")}</SelectItem>
            {taskTags.map((tag) => (
              <SelectItem key={tag.id} value={tag.name}>
                <span className="flex items-center gap-2">
                  <span className="inline-block size-2 rounded-full" style={{ backgroundColor: tag.color }} />
                  {tag.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1">
          <Input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            className="h-8 w-32 text-[11px]"
            placeholder={t("tasks.filter.from")}
          />
          <span className="text-xs text-muted-foreground">-</span>
          <Input
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            className="h-8 w-32 text-[11px]"
            placeholder={t("tasks.filter.to")}
          />
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={clearFilters}>
            <X className="mr-1 size-3" />
            {t("tasks.clearFilters")}
          </Button>
        )}
      </div>

      <Separator />

      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STATUSES.map((status) => {
            const StatusIcon = statusIcon(status);
            const columnTasks = tasksByStatus.get(status) ?? [];
            const isDropTarget = dragOverStatus === status;
            return (
              <div
                key={status}
                className={cn(
                  "flex flex-col gap-2 rounded-lg p-2 transition-all duration-200",
                  isDropTarget && "bg-primary/5 ring-2 ring-primary/30 scale-[1.01]"
                )}
                onDragOver={(e) => handleDragOver(e, status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, status)}
              >
                <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
                  <StatusIcon className="size-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">{t(`tasks.statuses.${status}`)}</span>
                  <Badge variant="secondary" className="ml-auto h-4 text-[10px]">
                    {columnTasks.length}
                  </Badge>
                </div>
                <div className="flex min-h-[6rem] flex-col gap-2">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      tagMap={tagMap}
                      isDragging={draggedTaskId === task.id}
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => openDetail(task)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-xs text-muted-foreground">
                <th className="px-3 py-2 text-left font-medium">{t("tasks.form.title")}</th>
                <th className="px-3 py-2 text-left font-medium w-36">{t("tasks.form.status")}</th>
                <th className="px-3 py-2 text-left font-medium w-32">{t("tasks.form.priority")}</th>
                <th className="px-3 py-2 text-left font-medium w-28">{t("tasks.form.tag")}</th>
                <th className="px-3 py-2 text-left font-medium w-28">{t("tasks.form.startDate")}</th>
                <th className="px-3 py-2 text-left font-medium w-28">{t("tasks.form.dueDate")}</th>
                <th className="px-3 py-2 text-left font-medium w-32">{t("tasks.form.linkedEvent")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <TaskTableRow
                  key={task.id}
                  task={task}
                  tagMap={tagMap}
                  onTitleClick={() => openDetail(task)}
                  onUpdate={(input) => updateTask.mutate({ id: task.id, input })}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">{viewingTask?.title}</DialogTitle>
            <DialogDescription>{t("tasks.detail.description")}</DialogDescription>
          </DialogHeader>
          {viewingTask && (
            <div className="space-y-4">
              {viewingTask.description && (
                <p className="text-sm text-muted-foreground">{viewingTask.description}</p>
              )}
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={viewingTask.status} />
                <PriorityBadge priority={viewingTask.priority} />
                {viewingTask.tag && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium"
                    style={{
                      borderColor: tagMap.get(viewingTask.tag) ?? "#64748b",
                      color: tagMap.get(viewingTask.tag) ?? "#64748b",
                      backgroundColor: `${tagMap.get(viewingTask.tag) ?? "#64748b"}15`,
                    }}
                  >
                    <span className="inline-block size-1.5 rounded-full" style={{ backgroundColor: tagMap.get(viewingTask.tag) ?? "#64748b" }} />
                    {viewingTask.tag}
                  </span>
                )}
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                {viewingTask.start_date && (
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" />
                    <span>{t("tasks.form.startDate")}: {viewingTask.start_date}</span>
                  </div>
                )}
                {viewingTask.due_date && (
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" />
                    <span>{t("tasks.form.dueDate")}: {viewingTask.due_date}</span>
                  </div>
                )}
                {viewingTask.event_title && (
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" />
                    <span>{t("tasks.form.linkedEvent")}: {viewingTask.event_title}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  <span>{t("tasks.detail.created")}: {new Date(viewingTask.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <Separator />
              <div className="flex gap-2">
                <Button
                  className="h-8 flex-1 text-xs"
                  onClick={() => { setIsDetailOpen(false); openEdit(viewingTask); }}
                >
                  <Pencil className="mr-1 size-3.5" />
                  {t("tasks.form.edit")}
                </Button>
                <Button
                  variant="destructive"
                  className="h-8 text-xs"
                  onClick={() => handleDelete(viewingTask.id)}
                  disabled={deleteTask.isPending}
                >
                  <Trash2 className="mr-1 size-3.5" />
                  {t("tasks.form.delete")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTask ? t("tasks.editTask") : t("tasks.newTask")}</DialogTitle>
          </DialogHeader>
          <TaskForm
            key={editingTask?.id ?? "new"}
            initial={editingTask}
            onSave={handleSave}
            onCancel={() => { setEditingTask(null); setIsFormOpen(false); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TaskCard({
  task,
  tagMap,
  isDragging,
  onDragStart,
  onClick,
}: {
  task: TaskWithEvent;
  tagMap: Map<string, string>;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onClick: () => void;
}) {
  const tagColor = task.tag ? (tagMap.get(task.tag) ?? "#64748b") : undefined;

  return (
    <Card
      className={cn(
        "cursor-grab transition-all duration-200 active:cursor-grabbing",
        isDragging && "opacity-50 scale-[1.02] rotate-1 shadow-2xl ring-2 ring-primary/40"
      )}
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
    >
      <CardContent className="flex items-start gap-2 p-3">
        <GripVertical className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{task.title}</p>
          {task.description && (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              className="h-4 text-[10px] px-1.5 py-0"
              style={{
                borderColor: PRIORITY_COLORS[task.priority],
                color: PRIORITY_COLORS[task.priority],
              }}
            >
              <Flag className="mr-0.5 size-2.5" />
              {task.priority}
            </Badge>
            {task.tag && tagColor && (
              <Badge
                variant="outline"
                className="h-4 text-[10px] px-1.5 py-0"
                style={{
                  borderColor: tagColor,
                  color: tagColor,
                  backgroundColor: `${tagColor}15`,
                }}
              >
                <span className="mr-0.5 inline-block size-1.5 rounded-full" style={{ backgroundColor: tagColor }} />
                {task.tag}
              </Badge>
            )}
            {task.due_date && (
              <Badge variant="outline" className="h-4 text-[10px] px-1.5 py-0">
                <CalendarDays className="mr-0.5 size-2.5" />
                {task.due_date}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TaskTableRow({
  task,
  tagMap,
  onTitleClick,
  onUpdate,
}: {
  task: TaskWithEvent;
  tagMap: Map<string, string>;
  onTitleClick: () => void;
  onUpdate: (input: TaskInput) => void;
}) {
  const tagColor = task.tag ? (tagMap.get(task.tag) ?? "#64748b") : undefined;

  const updateField = (partial: Partial<TaskInput>) => {
    onUpdate({
      title: task.title,
      description: task.description ?? undefined,
      status: task.status,
      priority: task.priority,
      tag: task.tag ?? undefined,
      start_date: task.start_date ?? undefined,
      due_date: task.due_date ?? undefined,
      event_id: task.event_id ?? undefined,
      ...partial,
    });
  };

  return (
    <tr className="border-b transition-colors hover:bg-muted/20">
      {/* Title — clickable */}
      <td className="px-3 py-2">
        <button
          className="text-left text-sm font-medium hover:text-primary hover:underline"
          onClick={onTitleClick}
        >
          {task.title}
        </button>
      </td>

      {/* Status — DropdownMenu */}
      <td className="px-3 py-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="inline-flex items-center gap-1 outline-none">
              <StatusBadge status={task.status} />
              <ChevronDown className="size-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[10rem]">
            {STATUSES.map((s) => (
              <DropdownMenuItem key={s} onClick={() => updateField({ status: s })}>
                <StatusBadge status={s} />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>

      {/* Priority — DropdownMenu */}
      <td className="px-3 py-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="inline-flex items-center gap-1 outline-none">
              <PriorityBadge priority={task.priority} />
              <ChevronDown className="size-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[10rem]">
            {(["low", "medium", "high"] as TaskPriority[]).map((p) => (
              <DropdownMenuItem key={p} onClick={() => updateField({ priority: p })}>
                <PriorityBadge priority={p} />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>

      {/* Tag */}
      <td className="px-3 py-2">
        {task.tag && tagColor ? (
          <span
            className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium"
            style={{
              borderColor: tagColor,
              color: tagColor,
              backgroundColor: `${tagColor}15`,
            }}
          >
            <span className="inline-block size-1.5 rounded-full" style={{ backgroundColor: tagColor }} />
            {task.tag}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>

      {/* Dates */}
      <td className="px-3 py-2 text-xs text-muted-foreground">
        {task.start_date ?? "—"}
      </td>
      <td className="px-3 py-2 text-xs text-muted-foreground">
        {task.due_date ?? "—"}
      </td>
      <td className="px-3 py-2 text-xs text-muted-foreground truncate max-w-[8rem]">
        {task.event_title ?? "—"}
      </td>
    </tr>
  );
}

function TaskForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: TaskWithEvent | null;
  onSave: (input: TaskInput) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const { data: tags = [] } = useTaskTags();
  const { data: events = [] } = useCalendarEvents(
    new Date().getFullYear(),
    new Date().getMonth()
  );
  const createTag = useCreateTaskTag();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? "todo");
  const [priority, setPriority] = useState<TaskPriority>(initial?.priority ?? "medium");
  const [selectedTag, setSelectedTag] = useState<string | undefined>(initial?.tag ?? undefined);
  const [startDate, setStartDate] = useState(initial?.start_date ?? "");
  const [dueDate, setDueDate] = useState(initial?.due_date ?? "");
  const [eventId, setEventId] = useState<string>(initial?.event_id?.toString() ?? "none");
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0].hex);
  const [showNewTag, setShowNewTag] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      tag: selectedTag,
      start_date: startDate || undefined,
      due_date: dueDate || undefined,
      event_id: eventId && eventId !== "none" ? Number(eventId) : undefined,
    });
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
    <form onSubmit={handleSubmit} className="space-y-3 pt-2">
      <div className="space-y-1.5">
        <Label className="text-xs">{t("tasks.form.title")}</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("tasks.form.titlePlaceholder")}
          required
          className="h-8 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label className="text-xs">{t("tasks.form.status")}</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <StatusSelectItem value="todo" label={t("tasks.statuses.todo")} />
              <StatusSelectItem value="pending" label={t("tasks.statuses.pending")} />
              <StatusSelectItem value="in_progress" label={t("tasks.statuses.in_progress")} />
              <StatusSelectItem value="done" label={t("tasks.statuses.done")} />
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{t("tasks.form.priority")}</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <PrioritySelectItem value="low" label={t("tasks.priorities.low")} />
              <PrioritySelectItem value="medium" label={t("tasks.priorities.medium")} />
              <PrioritySelectItem value="high" label={t("tasks.priorities.high")} />
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label className="text-xs">{t("tasks.form.startDate")}</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{t("tasks.form.dueDate")}</Label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs flex items-center gap-1">
            <Tag className="size-3" />
            {t("tasks.form.tag")}
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-5 px-1.5 text-[10px]"
            onClick={() => setShowNewTag((s) => !s)}
          >
            {showNewTag ? t("tasks.form.selectTag") : t("tasks.form.newTag")}
          </Button>
        </div>

        {showNewTag ? (
          <div className="space-y-2 rounded-md border bg-muted/30 p-2.5">
            <Input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder={t("tasks.form.tagNamePlaceholder")}
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
              {t("tasks.form.createTag")}
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {tags.length === 0 && (
              <span className="text-xs text-muted-foreground">{t("tasks.form.noTags")}</span>
            )}
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => setSelectedTag((prev) => (prev === tag.name ? undefined : tag.name))}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-all",
                  selectedTag === tag.name ? "ring-1 ring-offset-1" : "opacity-70 hover:opacity-100"
                )}
                style={{
                  borderColor: tag.color,
                  color: tag.color,
                  backgroundColor: `${tag.color}15`,
                  ...(selectedTag === tag.name ? { ringColor: tag.color } : {}),
                }}
              >
                <span className="inline-block size-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
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
                {t("tasks.form.clearTag")}
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">{t("tasks.form.linkedEvent")}</Label>
        <Select value={eventId} onValueChange={setEventId}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder={t("tasks.form.noEvent")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{t("tasks.form.noEvent")}</SelectItem>
            {events.map((evt) => (
              <SelectItem key={evt.id} value={evt.id.toString()}>
                {evt.title} ({evt.event_date})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">{t("tasks.form.description")}</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("tasks.form.descriptionPlaceholder")}
          rows={3}
          className="min-h-0 text-sm"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="submit" className="h-8 flex-1 text-xs">
          <Plus className="mr-1 size-3.5" />
          {initial ? t("tasks.form.save") : t("tasks.form.add")}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="h-8 text-xs">
          {t("tasks.form.cancel")}
        </Button>
      </div>
    </form>
  );
}
