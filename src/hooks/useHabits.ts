import { useState, useMemo } from "react";
import { Habit } from "@/types/habit";
import { format, subDays, getDay } from "date-fns";
import { STORAGE_KEYS } from "@/lib/storage-keys";

const STORAGE_KEY = STORAGE_KEYS.habits;

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

/** Returns true if a habit is expected to be completed on the given date. */
function isExpectedDay(habit: Habit, date: Date): boolean {
  const dow = getDay(date); // 0=Sun, 1=Mon, ..., 6=Sat
  if (habit.frequency === "daily") return true;
  if (habit.frequency === "weekdays") return dow >= 1 && dow <= 5;
  if (habit.frequency === "weekends") return dow === 0 || dow === 6;
  return true;
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
    // If today is an expected day but not yet completed, start from yesterday
    if (isExpectedDay(habit, day) && !habit.completedDates.includes(today)) {
      day = subDays(day, 1);
    }
    while (true) {
      // Skip days that are not expected for this habit's frequency
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
      // Mark non-expected days as true (not a miss) so the UI doesn't show false failures
      days.push(!isExpectedDay(habit, date) || habit.completedDates.includes(dateStr));
    }
    return days;
  };

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayStats = useMemo(() => {
    const today = new Date();
    const applicableHabits = habits.filter((h) => isExpectedDay(h, today));
    const total = applicableHabits.length;
    const done = applicableHabits.filter((h) => h.completedDates.includes(todayStr)).length;
    return { total, done, progress: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, [habits, todayStr]);

  return { habits, addHabit, deleteHabit, toggleToday, getStreak, getLast7Days, todayStats };
}
