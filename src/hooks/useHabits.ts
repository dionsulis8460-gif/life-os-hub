import { useState, useMemo } from "react";
import { Habit } from "@/types/habit";
import { format, subDays, isToday, parseISO, differenceInCalendarDays } from "date-fns";

const STORAGE_KEY = "app-habits";

function loadHabits(): Habit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHabits(habits: Habit[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>(loadHabits);

  const persist = (next: Habit[]) => {
    setHabits(next);
    saveHabits(next);
  };

  const addHabit = (habit: Omit<Habit, "id" | "createdAt" | "completedDates">) => {
    persist([...habits, { ...habit, id: crypto.randomUUID(), createdAt: new Date().toISOString(), completedDates: [] }]);
  };

  const deleteHabit = (id: string) => {
    persist(habits.filter((h) => h.id !== id));
  };

  const toggleToday = (id: string) => {
    const today = format(new Date(), "yyyy-MM-dd");
    persist(
      habits.map((h) => {
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
  };

  const getStreak = (habit: Habit): number => {
    let streak = 0;
    let day = new Date();
    const today = format(day, "yyyy-MM-dd");
    // If not completed today, start checking from yesterday
    if (!habit.completedDates.includes(today)) {
      day = subDays(day, 1);
    }
    while (true) {
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
      const dateStr = format(subDays(new Date(), i), "yyyy-MM-dd");
      days.push(habit.completedDates.includes(dateStr));
    }
    return days;
  };

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayStats = useMemo(() => {
    const total = habits.length;
    const done = habits.filter((h) => h.completedDates.includes(todayStr)).length;
    return { total, done, progress: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, [habits, todayStr]);

  return { habits, addHabit, deleteHabit, toggleToday, getStreak, getLast7Days, todayStats };
}
