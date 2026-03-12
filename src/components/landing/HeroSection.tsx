import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const spring = { type: "spring" as const, duration: 0.4, bounce: 0 };

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full opacity-10 accent-gradient blur-[120px]" />
      
      <div className="container mx-auto px-6 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.1 }}
          >
            <motion.p
              className="text-sm font-medium tracking-wide uppercase text-muted-foreground mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ ...spring, delay: 0.2 }}
            >
              Sistema Operacional da Vida
            </motion.p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              Sua vida,{" "}
              <span className="accent-gradient-text">organizada.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed">
              Menos caos, mais clareza. Centralize rotinas, finanças, hábitos e metas em um único lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} transition={spring}>
                <Button variant="hero" size="lg" asChild>
                  <Link to="/signup">
                    Começar teste gratuito
                    <ArrowRight className="ml-2" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} transition={spring}>
                <Button variant="secondary" size="lg" asChild>
                  <a href="#como-funciona">Ver como funciona</a>
                </Button>
              </motion.div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              7 dias grátis · Sem cartão de crédito
            </p>
          </motion.div>

          <motion.div
            className="relative hidden lg:block"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...spring, delay: 0.3 }}
          >
            <div className="relative rounded-3xl shadow-card overflow-hidden bg-card p-6">
              {/* Mock dashboard preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg accent-gradient" />
                    <span className="font-semibold text-foreground">LifeOS</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-muted" />
                    <div className="w-3 h-3 rounded-full bg-muted" />
                    <div className="w-3 h-3 rounded-full bg-muted" />
                  </div>
                </div>
                {/* Task cards */}
                {["Planejar a próxima semana", "Sessão de estudo: 47 min", "R$ 47,50 em Café"].map((task, i) => (
                  <motion.div
                    key={task}
                    className="rounded-xl bg-card-elevated p-4 shadow-subtle"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...spring, delay: 0.5 + i * 0.1 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{task}</span>
                      <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-primary' : i === 1 ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                    </div>
                  </motion.div>
                ))}
                {/* Streak */}
                <div className="rounded-xl bg-card-elevated p-4 shadow-subtle">
                  <p className="text-xs text-muted-foreground mb-2">Sequência de hábitos</p>
                  <div className="flex gap-1.5">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className={`w-4 h-4 rounded-sm ${i < 9 ? 'accent-gradient' : 'bg-muted'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 tabular-nums">Sequência de 12 dias</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
