import { motion } from "framer-motion";

const spring = { type: "spring" as const, duration: 0.4, bounce: 0 };

const steps = [
  { num: "01", title: "Crie sua conta", desc: "Cadastro rápido com email ou Google. Sem cartão de crédito." },
  { num: "02", title: "Configure seus módulos", desc: "Ative os módulos que fazem sentido para você." },
  { num: "03", title: "Organize sua vida", desc: "Adicione tarefas, registre gastos, acompanhe hábitos." },
  { num: "04", title: "Veja o progresso", desc: "Acompanhe tudo no dashboard com dados reais." },
];

const HowItWorksSection = () => {
  return (
    <section className="py-24 lg:py-32" id="como-funciona">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={spring}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Como <span className="accent-gradient-text">funciona</span>
          </h2>
          <p className="text-muted-foreground text-lg">Quatro passos para transformar sua rotina.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              className="relative rounded-3xl bg-card p-6 shadow-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...spring, delay: i * 0.1 }}
            >
              <span className="text-5xl font-bold accent-gradient-text opacity-30">{step.num}</span>
              <h3 className="text-lg font-semibold mt-2 mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
