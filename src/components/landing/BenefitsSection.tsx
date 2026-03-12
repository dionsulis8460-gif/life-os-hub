import { motion } from "framer-motion";
import { Brain, Wallet, Target, BookOpen, Utensils, CheckSquare } from "lucide-react";

const spring = { type: "spring" as const, duration: 0.4, bounce: 0 };

const benefits = [
  { icon: CheckSquare, title: "Rotina", desc: "Organize tarefas com prioridades e horários definidos." },
  { icon: Wallet, title: "Finanças", desc: "Controle gastos e receitas com gráficos claros." },
  { icon: Brain, title: "Hábitos", desc: "Construa hábitos sólidos com streaks visuais." },
  { icon: BookOpen, title: "Estudos", desc: "Acompanhe sessões com cronômetro e progresso semanal." },
  { icon: Utensils, title: "Alimentação", desc: "Registre refeições e mantenha o histórico." },
  { icon: Target, title: "Metas", desc: "Defina objetivos, prazos e acompanhe o progresso." },
];

const BenefitsSection = () => {
  return (
    <section className="py-24 lg:py-32" id="beneficios">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={spring}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tudo que você precisa, <span className="accent-gradient-text">em um lugar.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Seis módulos integrados que trabalham juntos para simplificar sua vida.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              className="rounded-3xl bg-card p-6 shadow-card transition-shadow duration-200 hover:shadow-card-hover group cursor-default"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...spring, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <div className="w-10 h-10 rounded-xl accent-gradient flex items-center justify-center mb-4">
                <b.icon className="w-5 h-5 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{b.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
