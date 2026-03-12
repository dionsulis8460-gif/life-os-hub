import { useState } from "react";
import { Task, Priority } from "@/types/task";

const INITIAL_TASKS: Task[] = [
  { id: "1", title: "Planejar a próxima semana", description: "Revisar agenda e definir prioridades", priority: "alta", time: "08:00", done: false, createdAt: new Date().toISOString() },
  { id: "2", title: "Revisar relatório mensal", description: "Conferir números e preparar apresentação", priority: "media", time: "10:00", done: true, createdAt: new Date().toISOString() },
  { id: "3", title: "Ligar para o dentista", description: "Agendar consulta de rotina", priority: "baixa", time: "14:00", done: false, createdAt: new Date().toISOString() },
  { id: "4", title: "Responder emails pendentes", description: "", priority: "media", time: "09:00", done: false, createdAt: new Date().toISOString() },
  { id: "5", title: "Fazer compras da semana", description: "Lista no app de notas", priority: "alta", time: "18:00", done: false, createdAt: new Date().toISOString() },
];

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  const addTask = (task: Omit<Task, "id" | "createdAt">) => {
    setTasks((prev) => [
      ...prev,
      { ...task, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
    ]);
  };

  const updateTask = (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleDone = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  return { tasks, addTask, updateTask, deleteTask, toggleDone };
}
