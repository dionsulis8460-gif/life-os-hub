import { motion } from "framer-motion";
import { Task, priorityConfig } from "@/types/task";
import { Clock, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const spring = { type: "spring" as const, duration: 0.4, bounce: 0 };

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const TaskCard = ({ task, onToggle, onEdit, onDelete }: TaskCardProps) => {
  const prio = priorityConfig[task.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -24, transition: { duration: 0.2 } }}
      transition={spring}
      whileHover={{ y: -2 }}
      className="rounded-2xl bg-card p-4 shadow-card transition-shadow duration-200 hover:shadow-card-hover group"
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id)}
          className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all duration-200 ${
            task.done ? "accent-gradient" : "shadow-subtle bg-muted hover:bg-muted/80"
          }`}
        >
          {task.done && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-foreground text-xs font-bold"
            >
              ✓
            </motion.span>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-medium leading-tight ${task.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
              {task.title}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${prio.className}`}>
              {prio.label}
            </span>
          </div>
          {task.description && (
            <p className="text-xs text-muted-foreground leading-relaxed mb-1.5">{task.description}</p>
          )}
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span className="text-xs tabular-nums">{task.time}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(task)}>
            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(task.id)}>
            <Trash2 className="w-3.5 h-3.5 text-destructive" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;
