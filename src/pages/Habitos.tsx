import { useState } from "react";
import ModuleGate from "@/components/layout/ModuleGate";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Brain, Flame, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHabits } from "@/hooks/useHabits";
import HabitCard from "@/components/habitos/HabitCard";
import HabitDialog from "@/components/habitos/HabitDialog";
import { format } from "date-fns";

const spring = { type: "spring" as const, duration: 0.4, bounce: 0 };

const Habitos = () => {
  const { habits, addHabit, deleteHabit, toggleToday, getStreak, getLast7Days, todayStats } = useHabits();
  const [dialogOpen, setDialogOpen] = useState(false);

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const bestStreak = habits.reduce((max, h) => Math.max(max, getStreak(h)), 0);

  return (
    <div>
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Hábitos</h1>
          <p className="text-muted-foreground text-sm">Construa e acompanhe seus hábitos diários.</p>
        </div>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} transition={spring}>
          <Button variant="hero" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Novo hábito
          </Button>
        </motion.div>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.05 }}
      >
        <div className="rounded-3xl bg-card p-5 shadow-card flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl accent-gradient flex items-center justify-center">
            <Target className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Hoje</p>
            <p className="text-lg font-bold tabular-nums">{todayStats.done}/{todayStats.total}</p>
          </div>
          <div className="ml-auto">
            <div className="w-12 h-12 relative">
              <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.5" fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${todayStats.progress * 0.974} 100`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold tabular-nums">
                {todayStats.progress}%
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-card p-5 shadow-card flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
            <Flame className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Melhor sequência</p>
            <p className="text-lg font-bold tabular-nums">{bestStreak} {bestStreak === 1 ? "dia" : "dias"}</p>
          </div>
        </div>

        <div className="rounded-3xl bg-card p-5 shadow-card flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total de hábitos</p>
            <p className="text-lg font-bold tabular-nums">{habits.length}</p>
          </div>
        </div>
      </motion.div>

      {/* Habit list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              streak={getStreak(habit)}
              last7Days={getLast7Days(habit)}
              isCompletedToday={habit.completedDates.includes(todayStr)}
              onToggle={toggleToday}
              onDelete={deleteHabit}
            />
          ))}
        </AnimatePresence>

        {habits.length === 0 && (
          <motion.div
            className="rounded-3xl bg-card p-12 shadow-card text-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
          >
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Brain className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">Nenhum hábito criado</h3>
            <p className="text-sm text-muted-foreground mb-4">Comece adicionando um hábito para acompanhar.</p>
            <Button variant="hero" onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-1" /> Novo hábito
            </Button>
          </motion.div>
        )}
      </div>

      <HabitDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={addHabit} />
    </div>
  );
};

const HabitosPage = () => (
  <ModuleGate module="habitos" moduleName="Hábitos">
    <Habitos />
  </ModuleGate>
);

export default HabitosPage;
