import { motion } from "framer-motion";
import { CheckSquare, Wallet, Brain, Target, BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const spring = { type: "spring" as const, duration: 0.4, bounce: 0 };

const DashboardCard = ({ title, icon: Icon, children, delay = 0 }: { title: string; icon: React.ElementType; children: React.ReactNode; delay?: number }) => (
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
    </div>
    {children}
  </motion.div>
);

const Dashboard = () => {
  return (
    <div>
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Bom dia. Aqui está o resumo do seu dia.</p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tasks */}
        <DashboardCard title="Tarefas para Hoje" icon={CheckSquare} delay={0.05}>
          <div className="space-y-3">
            {[
              { text: "Planejar a próxima semana", priority: "Alta", done: false },
              { text: "Revisar relatório mensal", priority: "Média", done: true },
              { text: "Ligar para o dentista", priority: "Baixa", done: false },
            ].map((task) => (
              <div key={task.text} className="flex items-center gap-3 group">
                <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-colors ${task.done ? 'accent-gradient border-transparent' : 'border-muted-foreground/30'}`}>
                  {task.done && <span className="text-foreground text-xs">✓</span>}
                </div>
                <span className={`text-sm flex-1 ${task.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.text}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  task.priority === 'Alta' ? 'bg-destructive/20 text-destructive' :
                  task.priority === 'Média' ? 'bg-primary/20 text-primary' :
                  'bg-muted text-muted-foreground'
                }`}>{task.priority}</span>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="w-full mt-2 text-muted-foreground">
              <Plus className="w-4 h-4 mr-1" /> Adicionar tarefa
            </Button>
          </div>
        </DashboardCard>

        {/* Finances */}
        <DashboardCard title="Resumo Financeiro" icon={Wallet} delay={0.1}>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Saldo atual</p>
              <p className="text-2xl font-bold tabular-nums">R$ 3.247,80</p>
            </div>
            <div className="flex gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Receitas</p>
                <p className="text-sm font-semibold text-success tabular-nums">+ R$ 5.000,00</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Despesas</p>
                <p className="text-sm font-semibold text-destructive tabular-nums">- R$ 1.752,20</p>
              </div>
            </div>
            {/* Mini bar chart */}
            <div className="flex items-end gap-1.5 h-16">
              {[40, 65, 35, 80, 55, 45, 70].map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-t-md accent-gradient"
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ ...spring, delay: 0.3 + i * 0.05 }}
                />
              ))}
            </div>
          </div>
        </DashboardCard>

        {/* Habits */}
        <DashboardCard title="Hábitos do Dia" icon={Brain} delay={0.15}>
          <div className="space-y-3">
            {[
              { name: "Meditar", done: true, streak: 12 },
              { name: "Exercício", done: true, streak: 8 },
              { name: "Leitura", done: false, streak: 5 },
              { name: "Beber 2L de água", done: false, streak: 3 },
            ].map((habit) => (
              <div key={habit.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-md ${habit.done ? 'accent-gradient' : 'bg-muted'}`} />
                  <span className="text-sm text-foreground">{habit.name}</span>
                </div>
                <span className="text-xs text-muted-foreground tabular-nums">{habit.streak} dias</span>
              </div>
            ))}
          </div>
        </DashboardCard>

        {/* Goals */}
        <DashboardCard title="Metas" icon={Target} delay={0.2}>
          <div className="space-y-4">
            {[
              { name: "Economizar R$ 10.000", progress: 65 },
              { name: "Ler 24 livros no ano", progress: 42 },
              { name: "Correr 5km sem parar", progress: 80 },
            ].map((goal) => (
              <div key={goal.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-foreground">{goal.name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{goal.progress}%</span>
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
            ))}
          </div>
        </DashboardCard>

        {/* Study */}
        <DashboardCard title="Tempo de Estudo" icon={BookOpen} delay={0.25}>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Hoje</p>
              <p className="text-2xl font-bold tabular-nums">2h 15min</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Esta semana</p>
              <div className="flex gap-1.5">
                {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day, i) => (
                  <div key={day} className="flex-1 text-center">
                    <motion.div
                      className={`h-12 rounded-md mb-1 ${i < 4 ? 'accent-gradient' : 'bg-muted'}`}
                      style={{ height: i < 4 ? `${[30, 45, 28, 52][i]}px` : '12px' }}
                      initial={{ height: 0 }}
                      animate={{ height: i < 4 ? `${[30, 45, 28, 52][i]}px` : '12px' }}
                      transition={{ ...spring, delay: 0.3 + i * 0.05 }}
                    />
                    <span className="text-[10px] text-muted-foreground">{day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default Dashboard;
