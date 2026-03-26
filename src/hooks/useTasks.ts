import { useState } from "react";
import { Task } from "@/types/task";
import { STORAGE_KEYS } from "@/lib/storage-keys";

const STORAGE_KEY = STORAGE_KEYS.tasks;

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : getInitialTasks();
  } catch {
    return getInitialTasks();
  }
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function getInitialTasks(): Task[] {
  const now = new Date().toISOString();
  return [
    { id: "1", title: "Planejar a próxima semana", description: "Revisar agenda e definir prioridades", priority: "alta", time: "08:00", done: false, createdAt: now },
    { id: "2", title: "Revisar relatório mensal", description: "Conferir números e preparar apresentação", priority: "media", time: "10:00", done: true, createdAt: now },
    { id: "3", title: "Ligar para o dentista", description: "Agendar consulta de rotina", priority: "baixa", time: "14:00", done: false, createdAt: now },
    { id: "4", title: "Responder emails pendentes", description: "", priority: "media", time: "09:00", done: false, createdAt: now },
    { id: "5", title: "Fazer compras da semana", description: "Lista no app de notas", priority: "alta", time: "18:00", done: false, createdAt: now },
  ];
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
