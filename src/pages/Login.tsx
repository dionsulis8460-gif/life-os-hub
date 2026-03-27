import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const spring = { type: "spring" as const, duration: 0.4, bounce: 0 };

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithOAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      if (error.message?.includes("Email not confirmed")) {
        toast.error("Email ainda não confirmado. Verifique sua caixa de entrada.");
      } else {
        toast.error("Email ou senha inválidos.");
      }
    } else {
      navigate("/app");
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    const { error } = await signInWithOAuth(provider);
    if (error) {
      toast.error(`Erro ao entrar com ${provider === "google" ? "Google" : "Apple"}.`);
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
          <h1 className="text-2xl font-bold mb-2">Bem-vindo de volta</h1>
          <p className="text-muted-foreground text-sm">Entre na sua conta para continuar.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl bg-card p-6 shadow-card space-y-4">
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg bg-input border-0 focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={spring}>
            <Button variant="hero" className="w-full" type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </motion.div>
          <div className="text-right">
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">Esqueci minha senha</Link>
          </div>
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
          Não tem conta? <Link to="/signup" className="text-primary hover:underline">Criar conta</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
