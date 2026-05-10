import { useState, useEffect } from "react";
import { Task, Priority, Category } from "../types";
import { useTaskContext } from "../store/TaskContext";
import { NotificationService } from "../utils/notifications";

export interface TaskFormData {
  title: string;
  description: string;
  priority: Priority;
  category: Category;
  dueDate?: string;
  reminderTime?: string;
}

const defaultForm: TaskFormData = {
  title: "",
  description: "",
  priority: "medium",
  category: "personal",
};

const taskToForm = (task: Task): TaskFormData => ({
  title: task.title,
  description: task.description || "",
  priority: task.priority,
  category: task.category,
  dueDate: task.dueDate,
  reminderTime: task.reminderTime,
});

export const useTaskForm = (existingTask?: Task, defaultDueDate?: string) => {
  const { addTask, updateTask } = useTaskContext();
  const [form, setForm] = useState<TaskFormData>(
    existingTask
      ? taskToForm(existingTask)
      : { ...defaultForm, dueDate: defaultDueDate },
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof TaskFormData, string>>
  >({});

  useEffect(() => {
    setForm(
      existingTask
        ? taskToForm(existingTask)
        : { ...defaultForm, dueDate: defaultDueDate },
    );
    setErrors({});
  }, [existingTask?.id, defaultDueDate]);

  const setField = <K extends keyof TaskFormData>(
    key: K,
    value: TaskFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (form.title.trim().length > 100)
      newErrors.title = "Title too long (max 100 chars)";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (): Promise<boolean> => {
    if (!validate()) return false;

    // Cancel any existing notification for this task before rescheduling
    if (existingTask?.notificationId) {
      await NotificationService.cancelReminder(existingTask.notificationId);
    }

    // Schedule new notification if a reminder time was set
    let notificationId: string | undefined = undefined;
    if (form.reminderTime) {
      const id = await NotificationService.scheduleTaskReminder(
        existingTask?.id ?? "new",
        form.title.trim(),
        new Date(form.reminderTime),
      );
      notificationId = id ?? undefined;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      priority: form.priority,
      category: form.category,
      dueDate: form.dueDate,
      reminderTime: form.reminderTime,
      notificationId,
    };

    if (existingTask) {
      updateTask(existingTask.id, payload);
    } else {
      addTask({ ...payload, completed: false });
    }
    return true;
  };

  const reset = () => {
    setForm(existingTask ? taskToForm(existingTask) : defaultForm);
    setErrors({});
  };

  return { form, setField, errors, submit, reset };
};
