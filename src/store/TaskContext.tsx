import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Task, TaskContextType, FilterType, SortType, Category } from '../types';
import { StorageService } from '../utils/storage';
import { generateId, sortTasks } from '../utils/helpers';

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('createdAt');
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks from storage on mount
  useEffect(() => {
    const load = async () => {
      const stored = await StorageService.loadTasks();
      setTasks(stored);
      setIsLoading(false);
    };
    load();
  }, []);

  // Persist tasks whenever they change
  useEffect(() => {
    if (!isLoading) {
      StorageService.saveTasks(tasks);
    }
  }, [tasks, isLoading]);

  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev =>
      prev.map(task => (task.id === id ? { ...task, ...updates } : task))
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const toggleComplete = useCallback((id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date().toISOString() : undefined,
            }
          : task
      )
    );
  }, []);

  // Apply filter + sort
  const filteredTasks = React.useMemo(() => {
    let result = tasks;
    if (filter === 'active') result = tasks.filter(t => !t.completed);
    else if (filter === 'completed') result = tasks.filter(t => t.completed);
    else if (filter !== 'all') result = tasks.filter(t => t.category === filter);
    return sortTasks(result, sortBy);
  }, [tasks, filter, sortBy]);

  return (
    <TaskContext.Provider
      value={{
        tasks: filteredTasks,
        addTask,
        updateTask,
        deleteTask,
        toggleComplete,
        filter,
        setFilter,
        sortBy,
        setSortBy,
        isLoading,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = (): TaskContextType => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTaskContext must be used inside TaskProvider');
  return ctx;
};
