import { motion } from "framer-motion";
import { Check, Crown, Zap, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { Badge } from "@/components/ui/badge";

const spring = { type: "spring" as const, duration: 0.4, bounce: 0 };

const plans = [
  {
    key: "modular",
    name: "Modular",
    icon: Layers,
    price: "R$ 9,90",
    period: "/módulo/mês",
    desc: "Pague apenas pelo que usar.",
    features: ["1 módulo à sua escolha", "Dashboard personalizado", "Histórico completo", "Suporte por email"],
    highlighted: false,
    storeId: "lifeos_modular_monthly",
  },
  {
    key: "full",
    name: "Full",
    icon: Crown,
    price: "R$ 29,90",
    period: "/mês",
    desc: "Tudo incluído. Sem limites.",
    features: ["Todos os 6 módulos", "Assistente com IA", "Comandos por voz", "Suporte prioritário", "Exportação de dados"],
    highlighted: true,
    storeId: "lifeos_full_monthly",
  },
  {
    key: "combo",
    name: "Combo",
    icon: Zap,
    price: "R$ 19,90",
    period: "/mês",
    desc: "Combine os módulos que precisa.",
    features: ["3 módulos à sua escolha", "Dashboard personalizado", "Histórico completo", "Suporte por email"],
    highlighted: false,
    storeId: "lifeos_combo_monthly",
  },
];

const Planos = () => {
  const { subscription, isTrialActive, isActive, trialDaysLeft } = useSubscription();

  const currentPlan = subscription?.plan;
  const status = subscription?.status;

  return (
    <div>
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Planos e Assinatura</h1>
        <p className="text-muted-foreground text-sm">Gerencie seu plano e assinatura.</p>
      </motion.div>

      {/* Status banner */}
      <motion.div
        className="rounded-2xl bg-card p-5 shadow-card mb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.05 }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">Status atual</span>
              <Badge variant={isActive ? "default" : isTrialActive ? "secondary" : "destructive"}>
                {status === "trial" && isTrialActive ? "Teste gratuito" :
                 status === "active" ? `Plano ${currentPlan?.charAt(0).toUpperCase()}${currentPlan?.slice(1)}` :
                 status === "limited_free" ? "Modo gratuito limitado" :
                 status === "cancelled" ? "Cancelado" : "—"}
              </Badge>
            </div>
            {isTrialActive && (
              <p className="text-sm text-muted-foreground">
                Restam <span className="font-medium text-primary">{trialDaysLeft} dias</span> de teste gratuito.
              </p>
            )}
            {status === "active" && subscription?.current_period_end && (
              <p className="text-sm text-muted-foreground">
                Renova em {new Date(subscription.current_period_end).toLocaleDateString("pt-BR")}.
              </p>
            )}
          </div>
          <p className="text-xs text-muted-foreground max-w-xs">
            O pagamento é processado pela loja de aplicativos (Google Play ou App Store).
          </p>
        </div>
      </motion.div>

      {/* Plans grid */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl">
        {plans.map((plan, i) => {
          const isCurrent = currentPlan === plan.key && isActive;
          return (
            <motion.div
              key={plan.key}
              className={`rounded-3xl p-6 shadow-card relative ${plan.highlighted ? "bg-card ring-2 ring-primary" : "bg-card"}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.1 + i * 0.08 }}
              whileHover={{ y: -4 }}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 accent-gradient text-foreground text-xs font-medium px-4 py-1 rounded-full">
                  Mais popular
                </div>
              )}
              <div className="flex items-center gap-2 mb-1">
                <plan.icon className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold">{plan.name}</h3>
              </div>
              <p className="text-muted-foreground text-sm mb-4">{plan.desc}</p>
              <div className="mb-6">
                <span className="text-3xl font-bold tabular-nums">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant={isCurrent ? "secondary" : plan.highlighted ? "hero" : "secondary"}
                className="w-full"
                disabled={isCurrent}
              >
                {isCurrent ? "Plano atual" : "Assinar pela loja"}
              </Button>
            </motion.div>
          );
        })}
      </div>

      <motion.p
        className="text-xs text-muted-foreground mt-8 text-center max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        As assinaturas são gerenciadas pela Google Play Store ou Apple App Store. Para cancelar ou alterar seu plano,
        acesse as configurações de assinatura da sua loja de aplicativos.
      </motion.p>
    </div>
  );
};

export default Planos;
