import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const spring = { type: "spring" as const, duration: 0.4, bounce: 0 };

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Informe seu email.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error("Erro ao enviar email. Tente novamente.");
    } else {
      setSent(true);
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
          <h1 className="text-2xl font-bold mb-2">Recuperar senha</h1>
          <p className="text-muted-foreground text-sm">
            {sent
              ? "Verifique sua caixa de entrada."
              : "Informe seu email para receber o link de redefinição."}
          </p>
        </div>

        {sent ? (
          <div className="rounded-3xl bg-card p-6 shadow-card text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl accent-gradient flex items-center justify-center text-2xl">
              ✉️
            </div>
            <p className="text-sm text-muted-foreground">
              Enviamos um link de redefinição para <span className="font-medium text-foreground">{email}</span>.
              Verifique também a pasta de spam.
            </p>
            <Button variant="secondary" className="w-full" onClick={() => setSent(false)}>
              Enviar novamente
            </Button>
          </div>
        ) : (
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
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={spring}>
              <Button variant="hero" className="w-full" type="submit" disabled={loading}>
                {loading ? "Enviando..." : "Enviar link de redefinição"}
              </Button>
            </motion.div>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link to="/login" className="inline-flex items-center gap-1 text-primary hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
