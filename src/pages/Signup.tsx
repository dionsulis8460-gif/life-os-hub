import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

const spring = { type: "spring" as const, duration: 0.4, bounce: 0 };

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

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
      const code = (error as { code?: string }).code ?? "";
      const msg = error.message?.toLowerCase() ?? "";
      if (
        code === "user_already_exists" ||
        msg.includes("user already registered") ||
        msg.includes("already registered")
      ) {
        toast.error("Este email já está cadastrado. Tente fazer login.");
        navigate("/login");
      } else if (code === "weak_password" || msg.includes("password is too weak") || msg.includes("should be at least")) {
        toast.error("Senha muito fraca. Use pelo menos 8 caracteres com letras e números.");
      } else if (code === "invalid_email" || msg.includes("invalid email")) {
        toast.error("Email inválido. Verifique e tente novamente.");
      } else {
        toast.error("Erro ao criar conta. Tente novamente.");
      }
    } else {
      toast.success("Conta criada com sucesso!");
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    const { error } = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast.error(`Erro ao cadastrar com ${provider === "google" ? "Google" : "Apple"}.`);
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
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">ou</span></div>
          </div>
          <div className="space-y-2">
            <Button type="button" variant="secondary" className="w-full shadow-subtle" onClick={() => handleOAuth("google")}>
              Continuar com Google
            </Button>
            <Button type="button" variant="secondary" className="w-full shadow-subtle" onClick={() => handleOAuth("apple")}>
              Continuar com Apple
            </Button>
          </div>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Já tem conta? <Link to="/login" className="text-primary hover:underline">Entrar</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
