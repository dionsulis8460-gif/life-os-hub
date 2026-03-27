import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Task, Priority } from "@/types/task";

type TaskInsert = Omit<Task, "id" | "createdAt">;

export function useTasks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const KEY = ["tasks", user?.id];

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        priority: r.priority as Priority,
        time: r.time,
        done: r.done,
        createdAt: r.created_at,
      }));
    },
    enabled: !!user,
  });

  const addTaskMut = useMutation({
    mutationFn: async (task: TaskInsert) => {
      const { error } = await supabase
        .from("tasks")
        .insert({ ...task, user_id: user!.id });
      if (error) throw error;
    },
    onMutate: async (task) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const prev = queryClient.getQueryData<Task[]>(KEY);
      queryClient.setQueryData<Task[]>(KEY, (old = []) => [
        { ...task, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
        ...old,
      ]);
      return { prev };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(KEY, ctx?.prev),
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });

  const updateTaskMut = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TaskInsert> }) => {
      const { error } = await supabase.from("tasks").update(updates).eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const prev = queryClient.getQueryData<Task[]>(KEY);
      queryClient.setQueryData<Task[]>(KEY, (old = []) =>
        old.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(KEY, ctx?.prev),
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });

  const deleteTaskMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const prev = queryClient.getQueryData<Task[]>(KEY);
      queryClient.setQueryData<Task[]>(KEY, (old = []) => old.filter((t) => t.id !== id));
      return { prev };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(KEY, ctx?.prev),
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });

  const toggleDoneMut = useMutation({
    mutationFn: async (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      const { error } = await supabase.from("tasks").update({ done: !task.done }).eq("id", id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const prev = queryClient.getQueryData<Task[]>(KEY);
      queryClient.setQueryData<Task[]>(KEY, (old = []) =>
        old.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(KEY, ctx?.prev),
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });

  return {
    tasks,
    addTask: (task: TaskInsert) => addTaskMut.mutate(task),
    updateTask: (id: string, updates: Partial<TaskInsert>) => updateTaskMut.mutate({ id, updates }),
    deleteTask: (id: string) => deleteTaskMut.mutate(id),
    toggleDone: (id: string) => toggleDoneMut.mutate(id),
  };
}

