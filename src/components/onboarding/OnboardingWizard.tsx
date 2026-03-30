import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WIZARD_MODULES } from "@/lib/onboarding-steps";

const spring = { type: "spring" as const, duration: 0.45, bounce: 0.1 };

interface OnboardingWizardProps {
  onComplete: (selectedModule: string) => void;
  onSkip: () => void;
}

const OnboardingWizard = ({ onComplete, onSkip }: OnboardingWizardProps) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleStart = () => {
    if (!selected) return;
    const mod = WIZARD_MODULES.find((m) => m.key === selected);
    if (!mod) return;
    setSubmitting(true);
    onComplete(selected);
    navigate(mod.path);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="w-full max-w-2xl"
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...spring, delay: 0.1 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="w-16 h-16 rounded-2xl accent-gradient flex items-center justify-center mx-auto mb-4 shadow-card"
              initial={{ scale: 0.6, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ ...spring, delay: 0.2 }}
            >
              <Sparkles className="w-8 h-8 text-foreground" />
            </motion.div>
            <motion.h1
              className="text-3xl font-bold mb-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.25 }}
            >
              Bem-vindo ao LifeOS! 🎉
            </motion.h1>
            <motion.p
              className="text-muted-foreground max-w-md mx-auto"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.3 }}
            >
              Seu assistente pessoal de produtividade. Por onde você quer começar?
            </motion.p>
          </div>

          {/* Module grid */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.35 }}
          >
            {WIZARD_MODULES.map((mod, i) => (
              <motion.button
                key={mod.key}
                onClick={() => setSelected(mod.key)}
                className={`relative rounded-2xl p-4 text-left transition-all duration-200 border-2 ${
                  selected === mod.key
                    ? "border-primary bg-primary/10 shadow-card"
                    : "border-border bg-card hover:border-primary/40 hover:bg-card/80 shadow-subtle"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ ...spring, delay: 0.35 + i * 0.06 }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {selected === mod.key && (
                  <motion.div
                    layoutId="wizard-selection"
                    className="absolute inset-0 rounded-2xl border-2 border-primary"
                    transition={spring}
                  />
                )}
                <span className="text-2xl mb-2 block">{mod.emoji}</span>
                <p className="font-semibold text-sm text-foreground">{mod.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                  {mod.description}
                </p>
              </motion.button>
            ))}
          </motion.div>

          {/* Actions */}
          <motion.div
            className="flex items-center justify-between gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-muted-foreground gap-1.5"
            >
              <SkipForward className="w-3.5 h-3.5" />
              Explorar sozinho
            </Button>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={spring}>
              <Button
                variant="hero"
                disabled={!selected || submitting}
                onClick={handleStart}
                className="gap-2 px-6"
              >
                Começar
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingWizard;
