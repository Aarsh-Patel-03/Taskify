export type Priority = "low" | "medium" | "high";

export type Category = "personal" | "work" | "health" | "shopping" | "other";

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  category: Category;
  createdAt: string;
  completedAt?: string;
  dueDate?: string;
  reminderTime?: string; // ISO string — when to fire the notification
  notificationId?: string; // expo-notifications identifier for cancellation
}

export interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  sortBy: SortType;
  setSortBy: (sort: SortType) => void;
  isLoading: boolean;
}

export type FilterType = "all" | "active" | "completed" | Category;
export type SortType = "createdAt" | "priority" | "dueDate" | "title";
