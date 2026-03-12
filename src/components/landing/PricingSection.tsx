import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const spring = { type: "spring" as const, duration: 0.4, bounce: 0 };

const plans = [
  {
    name: "Modular",
    price: "R$ 9,90",
    period: "/módulo/mês",
    desc: "Pague apenas pelo que usar.",
    features: ["1 módulo à sua escolha", "Dashboard personalizado", "Histórico completo", "Suporte por email"],
    highlighted: false,
  },
  {
    name: "Full",
    price: "R$ 29,90",
    period: "/mês",
    desc: "Tudo incluído. Sem limites.",
    features: ["Todos os 6 módulos", "Assistente com IA", "Comandos por voz", "Suporte prioritário", "Exportação de dados"],
    highlighted: true,
  },
  {
    name: "Combo",
    price: "R$ 19,90",
    period: "/mês",
    desc: "Combine os módulos que precisa.",
    features: ["3 módulos à sua escolha", "Dashboard personalizado", "Histórico completo", "Suporte por email"],
    highlighted: false,
  },
];

const PricingSection = () => {
  return (
    <section className="py-24 lg:py-32" id="planos">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={spring}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Escolha seu <span className="accent-gradient-text">plano</span>
          </h2>
          <p className="text-muted-foreground text-lg">Comece com 7 dias grátis. Sem compromisso.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`rounded-3xl p-6 shadow-card relative ${plan.highlighted ? 'bg-card ring-2 ring-primary' : 'bg-card'}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...spring, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 accent-gradient text-foreground text-xs font-medium px-4 py-1 rounded-full">
                  Mais popular
                </div>
              )}
              <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
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
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} transition={spring}>
                <Button variant={plan.highlighted ? "hero" : "secondary"} className="w-full" asChild>
                  <Link to="/signup">Começar grátis</Link>
                </Button>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
