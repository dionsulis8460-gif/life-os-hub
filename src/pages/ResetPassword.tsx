import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const spring = { type: "spring" as const, duration: 0.4, bounce: 0 };

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Subscribe FIRST so we never miss the PASSWORD_RECOVERY event, regardless
    // of which auth flow is used (implicit hash or PKCE ?code=).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // Implicit flow: Supabase appends #access_token=...&type=recovery to the URL.
    if (window.location.hash.includes("type=recovery")) {
      setReady(true);
    }

    // PKCE flow: Supabase appends ?code= to the URL and the client exchanges it
    // asynchronously. If the exchange completed before this effect ran the
    // PASSWORD_RECOVERY event is already gone, so we fall back to getSession().
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has("code")) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setReady(true);
        }
      });
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error("Preencha todos os campos.");
      return;
    }
    if (password.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error("Erro ao redefinir senha. Tente novamente.");
    } else {
      toast.success("Senha redefinida com sucesso!");
      navigate("/login");
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <motion.div
          className="w-full max-w-sm text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
        >
          <div className="rounded-3xl bg-card p-6 shadow-card space-y-4">
            <h1 className="text-xl font-bold">Link inválido</h1>
            <p className="text-sm text-muted-foreground">
              Este link de redefinição é inválido ou expirou. Solicite um novo.
            </p>
            <Button variant="hero" className="w-full" asChild>
              <Link to="/forgot-password">Solicitar novo link</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold mb-2">Nova senha</h1>
          <p className="text-muted-foreground text-sm">Defina sua nova senha abaixo.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl bg-card p-6 shadow-card space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Nova senha</label>
            <Input
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg bg-input border-0 focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Confirmar senha</label>
            <Input
              type="password"
              placeholder="Repita a nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-lg bg-input border-0 focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={spring}>
            <Button variant="hero" className="w-full" type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Redefinir senha"}
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
