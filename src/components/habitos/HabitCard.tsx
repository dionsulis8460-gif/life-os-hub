import { motion } from "framer-motion";
import { Flame, Pencil, Trash2 } from "lucide-react";
import { Habit } from "@/types/habit";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HabitCardProps {
  habit: Habit;
  streak: number;
  last7Days: boolean[];
  isCompletedToday: boolean;
  onToggle: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
}

const spring = { type: "spring" as const, duration: 0.4, bounce: 0 };

const DAY_LABELS = () => {
  const labels: string[] = [];
  for (let i = 6; i >= 0; i--) {
    labels.push(format(subDays(new Date(), i), "EEEEE", { locale: ptBR }).toUpperCase());
  }
  return labels;
};

const HabitCard = ({ habit, streak, last7Days, isCompletedToday, onToggle, onEdit, onDelete }: HabitCardProps) => {
  const days = DAY_LABELS();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={spring}
      className="group rounded-3xl bg-card p-5 shadow-card hover:shadow-card-hover transition-shadow"
    >
      <div className="flex items-start gap-4">
        {/* Check button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onToggle(habit.id)}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 transition-all ${
            isCompletedToday ? "shadow-md" : "bg-muted"
          }`}
          style={isCompletedToday ? { backgroundColor: `hsl(${habit.color})` } : {}}
        >
          {habit.icon}
        </motion.button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-semibold transition-colors ${isCompletedToday ? "text-muted-foreground line-through" : ""}`}>
              {habit.name}
            </h3>
            {/* Edit / Delete actions — visible on hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(habit)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Editar hábito"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(habit.id)}
                className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Excluir hábito"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-1.5 mb-3">
            <Flame className="w-4 h-4" style={{ color: streak > 0 ? `hsl(${habit.color})` : undefined }} />
            <span className="text-sm font-medium tabular-nums" style={streak > 0 ? { color: `hsl(${habit.color})` } : {}}>
              {streak} {streak === 1 ? "dia" : "dias"} seguidos
            </span>
          </div>

          {/* Last 7 days */}
          <div className="flex gap-1.5">
            {last7Days.map((done, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                    done ? "text-foreground" : "bg-muted text-muted-foreground"
                  }`}
                  style={done ? { backgroundColor: `hsl(${habit.color} / 0.25)`, color: `hsl(${habit.color})` } : {}}
                >
                  {done ? "✓" : ""}
                </div>
                <span className="text-[10px] text-muted-foreground">{days[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HabitCard;
