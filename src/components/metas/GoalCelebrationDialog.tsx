import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Sparkles } from "lucide-react";

interface GoalCelebrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalTitle: string;
  goalNumber: number;
}

const MESSAGES: Record<number, { title: string; message: string }> = {
  1: {
    title: "Primeira meta concluída! 🎉",
    message: "Parabéns por cumprir sua primeira meta conosco! Juntos podemos crescer cada vez mais!",
  },
  2: {
    title: "Segunda meta! 🔥",
    message: "Você está criando um hábito incrível! Continue nesse ritmo e conquiste tudo!",
  },
  3: {
    title: "Três metas! ⭐",
    message: "Tripla conquista! Sua dedicação está fazendo a diferença. O sucesso é inevitável!",
  },
  5: {
    title: "Cinco metas! 🏆",
    message: "Meia dezena de conquistas! Você é uma máquina de resultados!",
  },
  10: {
    title: "Dez metas! 💎",
    message: "Uma dezena de vitórias! Você é um exemplo de persistência e foco!",
  },
};

function getCelebration(goalNumber: number) {
  if (MESSAGES[goalNumber]) return MESSAGES[goalNumber];
  return {
    title: `Meta nº ${goalNumber} concluída! 🎯`,
    message: `Mais uma conquista para sua coleção! Você já completou ${goalNumber} metas. Continue evoluindo!`,
  };
}

export function GoalCelebrationDialog({ open, onOpenChange, goalTitle, goalNumber }: GoalCelebrationDialogProps) {
  const celebration = getCelebration(goalNumber);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm text-center p-8 overflow-hidden">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="flex flex-col items-center gap-4"
            >
              {/* Badge */}
              <motion.div
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
                className="relative"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Trophy className="h-10 w-10 text-white" />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shadow-md"
                >
                  #{goalNumber}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="absolute -top-2 -left-2"
                >
                  <Sparkles className="h-5 w-5 text-amber-400" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="absolute -bottom-1 -left-3"
                >
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                </motion.div>
              </motion.div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold">{celebration.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {celebration.message}
                </p>
              </div>

              <div className="px-4 py-2 rounded-lg bg-secondary">
                <p className="text-xs text-muted-foreground">Meta concluída</p>
                <p className="text-sm font-semibold">{goalTitle}</p>
              </div>

              <Button onClick={() => onOpenChange(false)} className="mt-2 w-full">
                Continuar conquistando! 💪
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
