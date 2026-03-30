import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Task, Priority } from "@/types/task";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { localRead, localWrite } from "@/lib/local-store";

type TaskInsert = Omit<Task, "id" | "createdAt">;

export function useTasks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const KEY = ["tasks", user?.id];
  const isLocal = !isSupabaseConfigured;
  const LKEY = STORAGE_KEYS.tasks;

  const persist = () =>
    localWrite(LKEY, queryClient.getQueryData<Task[]>(KEY) ?? []);

  const { data: tasks = [], isLoading, isError } = useQuery<Task[]>({
    queryKey: KEY,
    queryFn: async () => {
      if (isLocal) return localRead<Task>(LKEY);
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
    enabled: isLocal || !!user,
  });

  const addTaskMut = useMutation({
    mutationFn: async (task: TaskInsert) => {
      if (isLocal) return;
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
    onSuccess: () => { if (isLocal) persist(); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });

  const updateTaskMut = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TaskInsert> }) => {
      if (isLocal) return;
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
    onSuccess: () => { if (isLocal) persist(); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });

  const deleteTaskMut = useMutation({
    mutationFn: async (id: string) => {
      if (isLocal) return;
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
    onSuccess: () => { if (isLocal) persist(); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });

  const toggleDoneMut = useMutation({
    mutationFn: async (id: string) => {
      if (isLocal) return;
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
    onSuccess: () => { if (isLocal) persist(); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });

  return {
    isLoading,
    isError,
    tasks,
    addTask: (task: TaskInsert) => addTaskMut.mutate(task),
    updateTask: (id: string, updates: Partial<TaskInsert>) => updateTaskMut.mutate({ id, updates }),
    deleteTask: (id: string) => deleteTaskMut.mutate(id),
    toggleDone: (id: string) => toggleDoneMut.mutate(id),
  };
}
