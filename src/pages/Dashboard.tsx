import { motion } from "framer-motion";
import { CheckSquare, Wallet, Brain, Target, BookOpen, Plus, TrendingUp, TrendingDown, ArrowRight, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTasks } from "@/hooks/useTasks";
import { useFinances } from "@/hooks/useFinances";
import { useHabits } from "@/hooks/useHabits";
import { useGoals } from "@/hooks/useGoals";
import { useStudy } from "@/hooks/useStudy";
import { useMeals } from "@/hooks/useMeals";
import { format } from "date-fns";

const spring = { type: "spring" as const, duration: 0.4, bounce: 0 };

const DashboardCard = ({
  title,
  icon: Icon,
  children,
  delay = 0,
  onNavigate,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  delay?: number;
  onNavigate?: () => void;
}) => (
  <motion.div
    className="rounded-3xl bg-card p-6 shadow-card transition-shadow duration-200 hover:shadow-card-hover"
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ ...spring, delay }}
    whileHover={{ y: -4 }}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg accent-gradient flex items-center justify-center">
          <Icon className="w-4 h-4 text-foreground" />
        </div>
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      {onNavigate && (
        <button
          onClick={onNavigate}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Abrir módulo"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
    {children}
  </motion.div>
);

function formatMinutes(minutes: number): string {
  if (minutes === 0) return "0min";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

const MIN_BAR_PX = 8;   // minimum visible bar height (px) when there is data
const MAX_BAR_PX = 40;  // maximum bar height (px) at 100 % of peak
const EMPTY_BAR_PX = 4; // stub height (px) for days with no data

const Dashboard = () => {
  const navigate = useNavigate();

  const { tasks } = useTasks();
  const { totalIncome, totalExpense, balance } = useFinances();
  const { habits, getStreak } = useHabits();
  const { activeGoals } = useGoals();
  const { todayMinutes, totalWeekMinutes, dailyData } = useStudy();
  const { todayCalories, todayProtein, todayCarbs, todayFat } = useMeals();

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const pendingTasks = tasks.filter((t) => !t.done).slice(0, 3);
  const todayHabits = habits.slice(0, 4);

  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const maxDailyMins = Math.max(...dailyData.map((d) => d.minutos), 1);

  return (
    <div>
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Aqui está o resumo do seu dia.</p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tasks */}
        <DashboardCard
          title="Tarefas para Hoje"
          icon={CheckSquare}
          delay={0.05}
          onNavigate={() => navigate("/app/rotina")}
        >
          <div className="space-y-3">
            {pendingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">Nenhuma tarefa pendente 🎉</p>
            ) : (
              pendingTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-md border-2 border-muted-foreground/30 flex-shrink-0" />
                  <span className="text-sm flex-1 text-foreground truncate">{task.title}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                      task.priority === "alta"
                        ? "bg-destructive/20 text-destructive"
                        : task.priority === "media"
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {task.priority === "alta" ? "Alta" : task.priority === "media" ? "Média" : "Baixa"}
                  </span>
                </div>
              ))
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-muted-foreground"
              onClick={() => navigate("/app/rotina")}
            >
              <Plus className="w-4 h-4 mr-1" /> Adicionar tarefa
            </Button>
          </div>
        </DashboardCard>

        {/* Finances */}
        <DashboardCard
          title="Resumo Financeiro"
          icon={Wallet}
          delay={0.1}
          onNavigate={() => navigate("/app/financas")}
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Saldo atual</p>
              <p className={`text-2xl font-bold tabular-nums ${balance < 0 ? "text-destructive" : ""}`}>
                {formatCurrency(balance)}
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[hsl(var(--success))]" />
                <div>
                  <p className="text-xs text-muted-foreground">Receitas</p>
                  <p className="text-sm font-semibold text-[hsl(var(--success))] tabular-nums">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                <div>
                  <p className="text-xs text-muted-foreground">Despesas</p>
                  <p className="text-sm font-semibold text-destructive tabular-nums">
                    {formatCurrency(totalExpense)}
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={() => navigate("/app/financas")}
            >
              <Plus className="w-4 h-4 mr-1" /> Nova transação
            </Button>
          </div>
        </DashboardCard>

        {/* Habits */}
        <DashboardCard
          title="Hábitos do Dia"
          icon={Brain}
          delay={0.15}
          onNavigate={() => navigate("/app/habitos")}
        >
          <div className="space-y-3">
            {todayHabits.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">Nenhum hábito cadastrado.</p>
            ) : (
              todayHabits.map((habit) => {
                const done = habit.completedDates.includes(todayStr);
                return (
                  <div key={habit.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-md ${done ? "accent-gradient" : "bg-muted"}`}
                      />
                      <span className="text-sm text-foreground">{habit.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {getStreak(habit)} {getStreak(habit) === 1 ? "dia" : "dias"}
                    </span>
                  </div>
                );
              })
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-1 text-muted-foreground"
              onClick={() => navigate("/app/habitos")}
            >
              <Plus className="w-4 h-4 mr-1" /> Novo hábito
            </Button>
          </div>
        </DashboardCard>

        {/* Goals */}
        <DashboardCard
          title="Metas"
          icon={Target}
          delay={0.2}
          onNavigate={() => navigate("/app/metas")}
        >
          <div className="space-y-4">
            {activeGoals.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">Nenhuma meta ativa.</p>
            ) : (
              activeGoals.slice(0, 3).map((goal) => (
                <div key={goal.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-foreground truncate flex-1 mr-2">{goal.title}</span>
                    <span className="text-xs text-muted-foreground tabular-nums flex-shrink-0">
                      {goal.progress}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full accent-gradient"
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress}%` }}
                      transition={{ ...spring, delay: 0.4 }}
                    />
                  </div>
                </div>
              ))
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-1 text-muted-foreground"
              onClick={() => navigate("/app/metas")}
            >
              <Plus className="w-4 h-4 mr-1" /> Nova meta
            </Button>
          </div>
        </DashboardCard>

        {/* Study */}
        <DashboardCard
          title="Tempo de Estudo"
          icon={BookOpen}
          delay={0.25}
          onNavigate={() => navigate("/app/estudos")}
        >
          <div className="space-y-4">
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Hoje</p>
                <p className="text-2xl font-bold tabular-nums">{formatMinutes(todayMinutes)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Esta semana</p>
                <p className="text-2xl font-bold tabular-nums">{formatMinutes(totalWeekMinutes)}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Últimos 7 dias</p>
              <div className="flex gap-1.5 items-end h-12">
                {dailyData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <motion.div
                      className="w-full rounded-t-md accent-gradient"
                      initial={{ height: 0 }}
                      animate={{
                        height: d.minutos > 0 ? `${Math.max(MIN_BAR_PX, Math.round((d.minutos / maxDailyMins) * MAX_BAR_PX))}px` : `${EMPTY_BAR_PX}px`,
                      }}
                      transition={{ ...spring, delay: 0.3 + i * 0.05 }}
                      style={{
                        opacity: d.minutos > 0 ? 1 : 0.2,
                      }}
                    />
                    <span className="text-[10px] text-muted-foreground">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DashboardCard>

        {/* Alimentação */}
        <DashboardCard
          title="Alimentação de Hoje"
          icon={Utensils}
          delay={0.3}
          onNavigate={() => navigate("/app/alimentacao")}
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Calorias</p>
              <p className="text-2xl font-bold tabular-nums">{todayCalories} <span className="text-sm font-normal text-muted-foreground">kcal</span></p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-muted p-3 text-center">
                <p className="text-[11px] text-muted-foreground mb-1">Proteína</p>
                <p className="text-sm font-bold tabular-nums">{todayProtein}g</p>
              </div>
              <div className="rounded-xl bg-muted p-3 text-center">
                <p className="text-[11px] text-muted-foreground mb-1">Carbos</p>
                <p className="text-sm font-bold tabular-nums">{todayCarbs}g</p>
              </div>
              <div className="rounded-xl bg-muted p-3 text-center">
                <p className="text-[11px] text-muted-foreground mb-1">Gordura</p>
                <p className="text-sm font-bold tabular-nums">{todayFat}g</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={() => navigate("/app/alimentacao")}
            >
              <Plus className="w-4 h-4 mr-1" /> Registrar refeição
            </Button>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default Dashboard;
