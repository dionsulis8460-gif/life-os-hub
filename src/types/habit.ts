export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency: "daily" | "weekdays" | "weekends";
  createdAt: string;
  completedDates: string[]; // ISO date strings (YYYY-MM-DD)
}

export const HABIT_ICONS = ["💪", "📖", "🧘", "💧", "🏃", "🍎", "😴", "✍️", "🎯", "🧠", "💊", "🚶"];

export const HABIT_COLORS = [
  "12 90% 60%",    // primary/orange
  "152 69% 53%",   // success/green
  "220 70% 55%",   // blue
  "340 90% 65%",   // pink
  "45 93% 58%",    // yellow
  "270 70% 60%",   // purple
];
