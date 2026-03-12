import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const spring = { type: "spring" as const, duration: 0.4, bounce: 0 };

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Preencha todos os campos.");
      return;
    }
    if (password.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, name);
    setLoading(false);
    if (error) {
      toast.error("Erro ao criar conta. Tente novamente.");
    } else {
      toast.success("Conta criada! Verifique seu email para confirmar.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg accent-gradient" />
            <span className="font-bold text-xl">LifeOS</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">Crie sua conta</h1>
          <p className="text-muted-foreground text-sm">7 dias grátis. Sem cartão de crédito.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl bg-card p-6 shadow-card space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Nome</label>
            <Input
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg bg-input border-0 focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Email</label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg bg-input border-0 focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Senha</label>
            <Input
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg bg-input border-0 focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={spring}>
            <Button variant="hero" className="w-full" type="submit" disabled={loading}>
              {loading ? "Criando conta..." : "Começar teste gratuito"}
            </Button>
          </motion.div>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Já tem conta? <Link to="/login" className="text-primary hover:underline">Entrar</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
