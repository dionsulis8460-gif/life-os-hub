import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Filter, CheckSquare } from "lucide-react";
import ModuleGate from "@/components/layout/ModuleGate";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTasks } from "@/hooks/useTasks";
import { Task, Priority } from "@/types/task";
import TaskCard from "@/components/rotina/TaskCard";
import TaskDialog from "@/components/rotina/TaskDialog";

const spring = { type: "spring" as const, duration: 0.4, bounce: 0 };

type FilterStatus = "all" | "pending" | "done";
type FilterPriority = "all" | Priority;

const Rotina = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleDone } = useTasks();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterPriority, setFilterPriority] = useState<FilterPriority>("all");

  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    if (filterStatus === "pending") result = result.filter((t) => !t.done);
    if (filterStatus === "done") result = result.filter((t) => t.done);
    if (filterPriority !== "all") result = result.filter((t) => t.priority === filterPriority);
    // Sort: pending first, then by time
    result.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return a.time.localeCompare(b.time);
    });
    return result;
  }, [tasks, filterStatus, filterPriority]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.done).length;
    return { total, done, pending: total - done, progress: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, [tasks]);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleSave = (taskData: Omit<Task, "id" | "createdAt">) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
    setEditingTask(null);
  };

  const handleNewTask = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

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
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Rotina</h1>
          <p className="text-muted-foreground text-sm">Gerencie suas tarefas e atividades diárias.</p>
        </div>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} transition={spring}>
          <Button variant="hero" onClick={handleNewTask}>
            <Plus className="w-4 h-4 mr-1" /> Nova tarefa
          </Button>
        </motion.div>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        className="rounded-3xl bg-card p-6 shadow-card mb-6"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.05 }}
      >
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl accent-gradient flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Progresso do dia</p>
              <p className="text-lg font-bold tabular-nums">{stats.done}/{stats.total} tarefas</p>
            </div>
          </div>
          <div className="flex-1 min-w-[120px]">
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full accent-gradient"
                initial={{ width: 0 }}
                animate={{ width: `${stats.progress}%` }}
                transition={{ ...spring, delay: 0.2 }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1 tabular-nums">{stats.progress}% concluído</p>
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <p className="text-lg font-bold tabular-nums">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </div>
            <div>
              <p className="text-lg font-bold tabular-nums text-success">{stats.done}</p>
              <p className="text-xs text-muted-foreground">Concluídas</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="flex flex-wrap gap-3 mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.1 }}
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filtros:</span>
        </div>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
          <SelectTrigger className="w-[140px] rounded-xl bg-card border-0 shadow-subtle text-sm h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border rounded-xl">
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="done">Concluídas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={(v) => setFilterPriority(v as FilterPriority)}>
          <SelectTrigger className="w-[140px] rounded-xl bg-card border-0 shadow-subtle text-sm h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border rounded-xl">
            <SelectItem value="all">Todas prioridades</SelectItem>
            <SelectItem value="alta">🔴 Alta</SelectItem>
            <SelectItem value="media">🟡 Média</SelectItem>
            <SelectItem value="baixa">⚪ Baixa</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Task list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={toggleDone}
              onEdit={handleEdit}
              onDelete={deleteTask}
            />
          ))}
        </AnimatePresence>

        {filteredTasks.length === 0 && (
          <motion.div
            className="rounded-3xl bg-card p-12 shadow-card text-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
          >
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <CheckSquare className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">Nenhuma tarefa encontrada</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {filterStatus !== "all" || filterPriority !== "all"
                ? "Tente ajustar os filtros."
                : "Crie sua primeira tarefa para começar."}
            </p>
            {filterStatus === "all" && filterPriority === "all" && (
              <Button variant="hero" onClick={handleNewTask}>
                <Plus className="w-4 h-4 mr-1" /> Nova tarefa
              </Button>
            )}
          </motion.div>
        )}
      </div>

      {/* Dialog */}
      <TaskDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingTask(null);
        }}
        onSave={handleSave}
        editTask={editingTask}
      />
    </div>
  );
};

export default Rotina;
