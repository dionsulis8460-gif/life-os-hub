import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const spring = { type: "spring" as const, duration: 0.4, bounce: 0 };

const Navbar = () => {
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl"
      style={{ boxShadow: "var(--shadow-sm)" }}
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={spring}
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg accent-gradient" />
          <span className="font-bold text-lg tracking-tight">LifeOS</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#beneficios" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Benefícios</a>
          <a href="#como-funciona" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Como funciona</a>
          <a href="#planos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Planos</a>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Entrar</Link>
          </Button>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} transition={spring}>
            <Button variant="hero" size="sm" asChild>
              <Link to="/signup">Começar grátis</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
