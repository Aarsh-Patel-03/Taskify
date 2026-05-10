import { Task, Priority, SortType } from "../types";

export const generateId = (): string =>
  `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const PRIORITY_ORDER: Record<Priority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export const sortTasks = (tasks: Task[], sortBy: SortType): Task[] => {
  return [...tasks].sort((a, b) => {
    switch (sortBy) {
      case "priority":
        return PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
      case "title":
        return a.title.localeCompare(b.title);
      case "dueDate":
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case "createdAt":
      default:
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  });
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const formatDueDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
