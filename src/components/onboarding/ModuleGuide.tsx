import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { X, ChevronLeft, ChevronRight, Check, BookOpen, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MODULE_GUIDE_STEPS } from "@/lib/onboarding-steps";

const spring = { type: "spring" as const, duration: 0.4, bounce: 0.05 };

interface ModuleGuideProps {
  isModuleVisited: (key: string) => boolean;
  markModuleVisited: (key: string) => void;
}

/**
 * Derives the module key from the current route path.
 * /app          → ""  (dashboard)
 * /app/rotina   → "rotina"
 * etc.
 */
function moduleKeyFromPath(pathname: string): string {
  const segment = pathname.replace(/^\/app\/?/, "").split("/")[0] ?? "";
  // Ignore pages that don't have a guide (configuracoes, planos)
  const guided = ["", "rotina", "financas", "estudos", "habitos", "alimentacao", "metas"];
  return guided.includes(segment) ? segment : "__none__";
}

const ModuleGuide = ({ isModuleVisited, markModuleVisited }: ModuleGuideProps) => {
  const { pathname } = useLocation();
  const moduleKey = moduleKeyFromPath(pathname);
  const steps = MODULE_GUIDE_STEPS[moduleKey] ?? [];

  const [open, setOpen] = useState(false);
  const [minimised, setMinimised] = useState(false);
  const [step, setStep] = useState(0);
  const [activeModule, setActiveModule] = useState<string | null>(null);

  // When the route changes, check if we should auto-open the guide.
  // `isModuleVisited` is intentionally excluded from the deps — we only want
  // this effect to re-run on navigation (pathname change), not whenever the
  // visited-modules set changes (that would re-trigger the guide mid-session).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (moduleKey === "__none__" || steps.length === 0) {
      setOpen(false);
      return;
    }

    // Reset step counter when switching modules.
    setStep(0);

    if (!isModuleVisited(moduleKey)) {
      // Small delay so the page content is visible before the guide pops up.
      const timerId = setTimeout(() => {
        setActiveModule(moduleKey);
        setOpen(true);
        setMinimised(false);
      }, 600);
      return () => clearTimeout(timerId);
    } else {
      setOpen(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleClose = () => {
    setOpen(false);
    if (activeModule) markModuleVisited(activeModule);
  };

  const handleMinimise = () => {
    setMinimised(true);
    if (activeModule) markModuleVisited(activeModule);
  };

  const handleReopen = () => {
    setStep(0);
    setMinimised(false);
    setOpen(true);
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => setStep((s) => Math.max(0, s - 1));

  const currentStep = steps[step];

  return (
    <>
      {/* Floating guide panel */}
      <AnimatePresence>
        {open && !minimised && currentStep && (
          <motion.div
            key={`guide-${moduleKey}-${step}`}
            className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-50 w-80 max-w-[calc(100vw-2rem)]"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={spring}
          >
            <div className="rounded-3xl bg-card shadow-card border border-border overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border accent-gradient">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-foreground" />
                  <span className="text-sm font-semibold text-foreground">Guia rápido</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleMinimise}
                    className="p-1 rounded-lg hover:bg-background/20 transition-colors text-foreground"
                    aria-label="Minimizar guia"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Step content */}
              <div className="p-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h4 className="font-semibold text-sm mb-1.5 text-foreground">
                      {currentStep.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {currentStep.description}
                    </p>
                    {currentStep.hint && (
                      <p className="text-xs text-primary mt-2 font-medium">
                        {currentStep.hint}
                      </p>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer: progress dots + navigation */}
              <div className="flex items-center justify-between px-4 pb-4">
                {/* Progress dots */}
                <div className="flex gap-1">
                  {steps.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setStep(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                        i === step
                          ? "bg-primary w-4"
                          : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
                      }`}
                      aria-label={`Ir para passo ${i + 1}`}
                    />
                  ))}
                </div>

                {/* Step counter + nav buttons */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground tabular-nums mr-1">
                    {step + 1}/{steps.length}
                  </span>
                  <button
                    onClick={handlePrev}
                    disabled={step === 0}
                    className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    aria-label="Passo anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      step === steps.length - 1
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    }`}
                  >
                    {step === steps.length - 1 ? (
                      <>
                        <Check className="w-3 h-3" />
                        Entendi
                      </>
                    ) : (
                      <>
                        Próximo
                        <ChevronRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating re-open button (shown after guide is dismissed for that module) */}
      <AnimatePresence>
        {!open && moduleKey !== "__none__" && steps.length > 0 && (
          <motion.button
            onClick={handleReopen}
            className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-50 w-11 h-11 rounded-2xl accent-gradient shadow-card flex items-center justify-center hover:scale-105 transition-transform"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={spring}
            title="Ver guia deste módulo"
            aria-label="Ver guia deste módulo"
          >
            <RotateCcw className="w-4 h-4 text-foreground" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default ModuleGuide;
