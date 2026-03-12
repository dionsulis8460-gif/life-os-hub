import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { useState } from "react";

const spring = { type: "spring" as const, duration: 0.4, bounce: 0 };

const TrialAlertBanner = () => {
  const { subscription, isTrialActive, trialDaysLeft, isLimitedFreeActive, limitedFreeDaysLeft } = useSubscription();
  const [dismissed, setDismissed] = useState(false);

  // Show during trial with 2 or fewer days left
  const showTrialWarning = isTrialActive && trialDaysLeft <= 2 && !dismissed;

  // Show during limited_free mode
  const showLimitedFree = isLimitedFreeActive && !dismissed;

  // Show if trial expired (before auto-transition kicks in)
  const isExpired = subscription?.status === "trial" && !isTrialActive;
  const showExpired = isExpired && !dismissed;

  if (!showTrialWarning && !showExpired && !showLimitedFree) return null;

  const isUrgent = showExpired || trialDaysLeft <= 1 || (showLimitedFree && limitedFreeDaysLeft <= 2);

  return (
    <AnimatePresence>
      <motion.div
        className={`rounded-2xl p-4 mb-6 shadow-card flex items-center gap-4 flex-wrap ${
          isUrgent
            ? "bg-destructive/10 border border-destructive/20"
            : "bg-primary/10 border border-primary/20"
        }`}
        initial={{ opacity: 0, y: -12, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -12, height: 0 }}
        transition={spring}
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isUrgent ? "bg-destructive/20" : "accent-gradient"
          }`}
        >
          <AlertTriangle
            className={`w-5 h-5 ${isUrgent ? "text-destructive" : "text-foreground"}`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">
            {showExpired
              ? "Seu período de teste expirou"
              : showLimitedFree
              ? `Modo gratuito: ${limitedFreeDaysLeft} dia${limitedFreeDaysLeft !== 1 ? "s" : ""} restante${limitedFreeDaysLeft !== 1 ? "s" : ""}`
              : trialDaysLeft === 0
              ? "Último dia do seu teste gratuito!"
              : trialDaysLeft === 1
              ? "Falta apenas 1 dia para o fim do teste!"
              : `Faltam ${trialDaysLeft} dias para o fim do teste`}
          </p>
          <p className="text-xs text-muted-foreground">
            {showExpired
              ? "Assine agora para continuar usando todos os módulos."
              : showLimitedFree
              ? "Você pode usar 1 módulo gratuitamente. Assine para desbloquear todos."
              : "Assine um plano para não perder acesso aos módulos."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={spring}
          >
            <Button variant="hero" size="sm" className="gap-1.5" asChild>
              <Link to="/app/planos">
                <Crown className="w-3.5 h-3.5" />
                Ver planos
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </motion.div>

          {!showExpired && (
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TrialAlertBanner;
