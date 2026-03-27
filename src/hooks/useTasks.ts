import { useState } from "react";
import { Task } from "@/types/task";
import { STORAGE_KEYS } from "@/lib/storage-keys";

const STORAGE_KEY = STORAGE_KEYS.tasks;

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);

  const update = (fn: (prev: Task[]) => Task[]) => {
    setTasks((prev) => {
      const next = fn(prev);
      saveTasks(next);
      return next;
    });
  };

  const addTask = (task: Omit<Task, "id" | "createdAt">) => {
    update((prev) => [
      ...prev,
      { ...task, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
    ]);
  };

  const updateTask = (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => {
    update((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTask = (id: string) => {
    update((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleDone = (id: string) => {
    update((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  return { tasks, addTask, updateTask, deleteTask, toggleDone };
}
