import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Habit, HABIT_ICONS, HABIT_COLORS } from "@/types/habit";

interface HabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (habit: Omit<Habit, "id" | "createdAt" | "completedDates">) => void;
  /** When provided the dialog is in edit mode. */
  editHabit?: Habit | null;
}

const spring = { type: "spring" as const, duration: 0.4, bounce: 0 };

const HabitDialog = ({ open, onOpenChange, onSave, editHabit }: HabitDialogProps) => {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(HABIT_ICONS[0]);
  const [color, setColor] = useState(HABIT_COLORS[0]);
  const [frequency, setFrequency] = useState<Habit["frequency"]>("daily");

  // Pre-populate fields when editing an existing habit.
  useEffect(() => {
    if (editHabit) {
      setName(editHabit.name);
      setIcon(editHabit.icon);
      setColor(editHabit.color);
      setFrequency(editHabit.frequency);
    } else {
      setName("");
      setIcon(HABIT_ICONS[0]);
      setColor(HABIT_COLORS[0]);
      setFrequency("daily");
    }
  }, [editHabit, open]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), icon, color, frequency });
    onOpenChange(false);
  };

  const isEdit = !!editHabit;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl bg-card border-0 shadow-card-hover sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar hábito" : "Novo hábito"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Altere as informações do hábito."
              : "Defina um hábito para acompanhar diariamente."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Nome</label>
            <Input
              placeholder="Ex: Beber 2L de água"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg bg-input border-0 focus-visible:ring-2 focus-visible:ring-primary"
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Ícone</label>
            <div className="flex flex-wrap gap-2">
              {HABIT_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all ${
                    icon === ic ? "bg-primary/20 ring-2 ring-primary scale-110" : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Cor</label>
            <div className="flex gap-2">
              {HABIT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c ? "ring-2 ring-foreground scale-110" : ""
                  }`}
                  style={{ backgroundColor: `hsl(${c})` }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Frequência</label>
            <Select value={frequency} onValueChange={(v) => setFrequency(v as Habit["frequency"])}>
              <SelectTrigger className="rounded-lg bg-input border-0 focus:ring-2 focus:ring-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border rounded-xl">
                <SelectItem value="daily">Todos os dias</SelectItem>
                <SelectItem value="weekdays">Dias úteis</SelectItem>
                <SelectItem value="weekends">Fins de semana</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} className="shadow-subtle">
            Cancelar
          </Button>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} transition={spring}>
            <Button variant="hero" onClick={handleSave} disabled={!name.trim()}>
              {isEdit ? "Salvar" : "Criar hábito"}
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HabitDialog;
