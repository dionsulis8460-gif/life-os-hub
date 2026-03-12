import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const spring = { type: "spring" as const, duration: 0.4, bounce: 0 };

const CTASection = () => {
  return (
    <section className="py-24 lg:py-32">
      <div className="container mx-auto px-6">
        <motion.div
          className="relative rounded-3xl shadow-card overflow-hidden p-12 md:p-16 text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={spring}
        >
          <div className="absolute inset-0 accent-gradient opacity-10" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comece a organizar sua vida <span className="accent-gradient-text">hoje.</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
              7 dias grátis com acesso a todos os módulos. Sem cartão de crédito.
            </p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} transition={spring} className="inline-block">
              <Button variant="hero" size="lg" asChild>
                <Link to="/signup">
                  Começar teste gratuito
                  <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
