import { motion } from "framer-motion";

const spring = { type: "spring" as const, duration: 0.4, bounce: 0 };

const testimonials = [
  { name: "Ana Beatriz", role: "Empreendedora", text: "Finalmente consegui organizar minhas finanças e hábitos em um só lugar. A interface é linda e intuitiva." },
  { name: "Carlos Eduardo", role: "Estudante de Medicina", text: "O cronômetro de estudos e o tracker de hábitos mudaram minha rotina. Meu rendimento melhorou muito." },
  { name: "Marina Costa", role: "Designer", text: "Já usei Notion, Todoist, vários apps. O LifeOS é o primeiro que eu realmente uso todo dia." },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 lg:py-32" id="depoimentos">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={spring}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            O que dizem <span className="accent-gradient-text">nossos usuários</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="rounded-3xl bg-card p-6 shadow-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...spring, delay: i * 0.1 }}
            >
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full accent-gradient flex items-center justify-center text-sm font-bold text-foreground">
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-medium text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
