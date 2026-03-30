import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Habit } from "@/types/habit";
import { format, subDays, getDay } from "date-fns";

/** Returns true if a habit is expected to be completed on the given date. */
function isExpectedDay(habit: Habit, date: Date): boolean {
  const dow = getDay(date); // 0=Sun, 1=Mon, ..., 6=Sat
  if (habit.frequency === "daily") return true;
  if (habit.frequency === "weekdays") return dow >= 1 && dow <= 5;
  if (habit.frequency === "weekends") return dow === 0 || dow === 6;
  return true;
}

type HabitInsert = Omit<Habit, "id" | "createdAt" | "completedDates">;

export function useHabits() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const KEY = ["habits", user?.id];

  const { data: habits = [], isLoading, isError } = useQuery<Habit[]>({
    queryKey: KEY,
    queryFn: async () => {
      const [habitsRes, completionsRes] = await Promise.all([
        supabase.from("habits").select("*").eq("user_id", user!.id).order("created_at"),
        supabase.from("habit_completions").select("*").eq("user_id", user!.id),
      ]);
      if (habitsRes.error) throw habitsRes.error;
      if (completionsRes.error) throw completionsRes.error;
      return (habitsRes.data ?? []).map((h) => ({
        id: h.id,
        name: h.name,
        icon: h.icon,
        color: h.color,
        frequency: h.frequency as Habit["frequency"],
        createdAt: h.created_at,
        completedDates: (completionsRes.data ?? [])
          .filter((c) => c.habit_id === h.id)
          .map((c) => c.completed_date),
      }));
    },
    enabled: !!user,
  });

  const addHabitMut = useMutation({
    mutationFn: async (habit: HabitInsert) => {
      const { error } = await supabase.from("habits").insert({ ...habit, user_id: user!.id });
      if (error) throw error;
    },
    onMutate: async (habit) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const prev = queryClient.getQueryData<Habit[]>(KEY);
      queryClient.setQueryData<Habit[]>(KEY, (old = []) => [
        ...old,
        { ...habit, id: crypto.randomUUID(), createdAt: new Date().toISOString(), completedDates: [] },
      ]);
      return { prev };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(KEY, ctx?.prev),
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });

  const deleteHabitMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("habits").delete().eq("id", id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const prev = queryClient.getQueryData<Habit[]>(KEY);
      queryClient.setQueryData<Habit[]>(KEY, (old = []) => old.filter((h) => h.id !== id));
      return { prev };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(KEY, ctx?.prev),
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });

  const toggleTodayMut = useMutation({
    mutationFn: async (id: string) => {
      const today = format(new Date(), "yyyy-MM-dd");
      const habit = habits.find((h) => h.id === id);
      if (!habit) return;
      const has = habit.completedDates.includes(today);
      if (has) {
        const { error } = await supabase
          .from("habit_completions")
          .delete()
          .eq("habit_id", id)
          .eq("completed_date", today);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("habit_completions")
          .insert({ habit_id: id, user_id: user!.id, completed_date: today });
        if (error) throw error;
      }
    },
    onMutate: async (id) => {
      const today = format(new Date(), "yyyy-MM-dd");
      await queryClient.cancelQueries({ queryKey: KEY });
      const prev = queryClient.getQueryData<Habit[]>(KEY);
      queryClient.setQueryData<Habit[]>(KEY, (old = []) =>
        old.map((h) => {
          if (h.id !== id) return h;
          const has = h.completedDates.includes(today);
          return {
            ...h,
            completedDates: has
              ? h.completedDates.filter((d) => d !== today)
              : [...h.completedDates, today],
          };
        })
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(KEY, ctx?.prev),
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });

  const updateHabitMut = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: HabitInsert }) => {
      const { error } = await supabase.from("habits").update(updates).eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const prev = queryClient.getQueryData<Habit[]>(KEY);
      queryClient.setQueryData<Habit[]>(KEY, (old = []) =>
        old.map((h) => (h.id === id ? { ...h, ...updates } : h))
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(KEY, ctx?.prev),
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });

  const getStreak = (habit: Habit): number => {
    let streak = 0;
    let day = new Date();
    const today = format(day, "yyyy-MM-dd");
    if (isExpectedDay(habit, day) && !habit.completedDates.includes(today)) {
      day = subDays(day, 1);
    }
    while (true) {
      if (!isExpectedDay(habit, day)) {
        day = subDays(day, 1);
        continue;
      }
      const dateStr = format(day, "yyyy-MM-dd");
      if (habit.completedDates.includes(dateStr)) {
        streak++;
        day = subDays(day, 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const getLast7Days = (habit: Habit): boolean[] => {
    const days: boolean[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, "yyyy-MM-dd");
      days.push(!isExpectedDay(habit, date) || habit.completedDates.includes(dateStr));
    }
    return days;
  };

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayStats = useMemo(() => {
    const today = new Date();
    const applicable = habits.filter((h) => isExpectedDay(h, today));
    const total = applicable.length;
    const done = applicable.filter((h) => h.completedDates.includes(todayStr)).length;
    return { total, done, progress: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, [habits, todayStr]);

  return {
    isLoading,
    isError,
    habits,
    addHabit: (h: HabitInsert) => addHabitMut.mutate(h),
    updateHabit: (id: string, updates: HabitInsert) => updateHabitMut.mutate({ id, updates }),
    deleteHabit: (id: string) => deleteHabitMut.mutate(id),
    toggleToday: (id: string) => toggleTodayMut.mutate(id),
    getStreak,
    getLast7Days,
    todayStats,
  };
}
