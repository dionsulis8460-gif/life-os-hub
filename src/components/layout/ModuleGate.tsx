import { motion } from "framer-motion";
import { Lock, Crown, Zap, ArrowRight, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const spring = { type: "spring" as const, duration: 0.4, bounce: 0 };

interface ModuleGateProps {
  module: string;
  moduleName: string;
  children: ReactNode;
}

const ModuleGate = ({ module, moduleName, children }: ModuleGateProps) => {
  const { hasModuleAccess, isLoading, isError, subscription, isTrialActive, isLimitedFreeActive, limitedFreeDaysLeft, refetch } = useSubscription();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-lg accent-gradient animate-pulse" />
      </div>
    );
  }

  // If the subscription check failed AND there is no cached data, show a
  // retry prompt instead of a false "module locked" screen. When stale data
  // is still available (subscription !== undefined), fall through to the
  // normal hasModuleAccess check so existing cached status is honoured.
  if (isError && !subscription) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
        >
          <p className="text-muted-foreground text-sm">
            Não foi possível verificar sua assinatura.
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </motion.div>
      </div>
    );
  }

  if (hasModuleAccess(module)) {
    return <>{children}</>;
  }

  const status = subscription?.status;
  const isExpiredTrial = status === "trial" && !isTrialActive;
  const isCancelled = status === "cancelled";
  const isLimitedFree = status === "limited_free";
  const canSelectFreeModule = isLimitedFreeActive && (!subscription?.selected_modules || subscription.selected_modules.length === 0);

  const handleSelectFreeModule = async () => {
    if (!subscription) return;
    const { error } = await supabase
      .from("subscriptions")
      .update({ selected_modules: [module] })
      .eq("id", subscription.id);

    if (error) {
      toast.error("Erro ao selecionar módulo gratuito.");
      return;
    }
    toast.success(`${moduleName} ativado como módulo gratuito!`);
    refetch();
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        className="max-w-md w-full text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        <motion.div
          className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-card shadow-card flex items-center justify-center"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ ...spring, delay: 0.1 }}
        >
          <Lock className="w-9 h-9 text-muted-foreground" />
        </motion.div>

        <h2 className="text-2xl font-bold mb-2">
          {moduleName} bloqueado
        </h2>

        <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
          {isExpiredTrial
            ? "Seu período de teste expirou. Assine um plano para continuar usando todos os módulos."
            : isCancelled
            ? "Sua assinatura foi cancelada. Renove para acessar este módulo."
            : canSelectFreeModule
            ? `No modo gratuito, você pode escolher 1 módulo por ${limitedFreeDaysLeft} dias. Deseja ativar ${moduleName}?`
            : isLimitedFree
            ? "No modo gratuito, você tem acesso a apenas 1 módulo. Faça upgrade para desbloquear mais."
            : "Assine um plano para acessar este módulo."}
        </p>

        <div className="space-y-3">
          {canSelectFreeModule && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={spring}>
              <Button
                onClick={handleSelectFreeModule}
                className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Gift className="w-4 h-4" />
                Ativar {moduleName} gratuitamente
              </Button>
            </motion.div>
          )}

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={spring}>
            <Button variant="hero" className="w-full gap-2" asChild>
              <Link to="/app/planos">
                <Crown className="w-4 h-4" />
                Ver planos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>

          {isExpiredTrial && (
            <p className="text-xs text-muted-foreground">
              Escolha entre Modular (R$ 9,90), Combo (R$ 19,90) ou Full (R$ 29,90).
            </p>
          )}
        </div>

        <motion.div
          className="mt-8 rounded-2xl bg-card p-4 shadow-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl accent-gradient flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-foreground" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Plano Full</p>
              <p className="text-xs text-muted-foreground">Todos os módulos + IA + comandos por voz</p>
            </div>
            <span className="text-sm font-bold text-primary ml-auto whitespace-nowrap">R$ 29,90/mês</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ModuleGate;
