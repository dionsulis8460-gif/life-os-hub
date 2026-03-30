import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, User, Shield, Trash2, Info, Save, LogOut, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const spring = { type: "spring" as const, duration: 0.4, bounce: 0 };

const SectionCard = ({
  icon: Icon,
  title,
  children,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    className="rounded-3xl bg-card p-6 shadow-card"
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ ...spring, delay }}
  >
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl accent-gradient flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-foreground" />
      </div>
      <h2 className="font-semibold text-base">{title}</h2>
    </div>
    {children}
  </motion.div>
);

const Configuracoes = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Email/password users have provider "email"; OAuth users have "google", "apple", etc.
  const isPasswordUser = user?.app_metadata?.provider === "email";

  const [displayName, setDisplayName] = useState(
    typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : ""
  );
  const [savingProfile, setSavingProfile] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      toast.error("O nome não pode estar vazio.");
      return;
    }
    setSavingProfile(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: displayName.trim() },
    });
    setSavingProfile(false);
    if (error) {
      toast.error("Erro ao salvar perfil.");
    } else {
      toast.success("Perfil atualizado com sucesso!");
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Preencha todos os campos.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) {
      toast.error("Erro ao alterar senha. Tente novamente.");
    } else {
      toast.success("Senha alterada com sucesso!");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  // Export all user data from Supabase as a JSON file download
  const handleExportData = async () => {
    if (!user) return;
    setExporting(true);
    try {
      // Fetch goals first so we can use their IDs to fetch milestones.
      const [tasks, habits, completions, transactions, goals, meals, sessions, subjects] =
        await Promise.all([
          supabase.from("tasks").select("*").eq("user_id", user.id),
          supabase.from("habits").select("*").eq("user_id", user.id),
          supabase.from("habit_completions").select("*").eq("user_id", user.id),
          supabase.from("transactions").select("*").eq("user_id", user.id),
          supabase.from("goals").select("*").eq("user_id", user.id),
          supabase.from("meals").select("*").eq("user_id", user.id),
          supabase.from("study_sessions").select("*").eq("user_id", user.id),
          supabase.from("study_subjects").select("*, study_topics(*)").eq("user_id", user.id),
        ]);

      // Fetch milestones scoped to the user's goals (milestones have no user_id,
      // they are owned indirectly through the goal).
      const goalIds = (goals.data ?? []).map((g: { id: string }) => g.id);
      const milestonesRes =
        goalIds.length > 0
          ? await supabase.from("milestones").select("*").in("goal_id", goalIds)
          : { data: [] };

      const exportData = {
        exportedAt: new Date().toISOString(),
        user: { id: user.id, email: user.email },
        tasks: tasks.data ?? [],
        habits: habits.data ?? [],
        habit_completions: completions.data ?? [],
        transactions: transactions.data ?? [],
        goals: goals.data ?? [],
        milestones: milestonesRes.data ?? [],
        meals: meals.data ?? [],
        study_sessions: sessions.data ?? [],
        study_subjects: subjects.data ?? [],
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lifeos-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Dados exportados com sucesso!");
    } catch {
      toast.error("Erro ao exportar dados. Tente novamente.");
    } finally {
      setExporting(false);
    }
  };

  // Delete all user data from Supabase tables (cascades handle relations)
  const handleClearData = async () => {
    if (!user) return;
    try {
      await Promise.all([
        supabase.from("tasks").delete().eq("user_id", user.id),
        supabase.from("habits").delete().eq("user_id", user.id),
        supabase.from("transactions").delete().eq("user_id", user.id),
        supabase.from("goals").delete().eq("user_id", user.id),
        supabase.from("meals").delete().eq("user_id", user.id),
        supabase.from("study_sessions").delete().eq("user_id", user.id),
        supabase.from("study_subjects").delete().eq("user_id", user.id),
      ]);
      toast.success("Todos os dados foram apagados com sucesso!");
    } catch {
      toast.error("Erro ao apagar dados. Tente novamente.");
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div>
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Configurações</h1>
        <p className="text-muted-foreground text-sm">Gerencie seu perfil e preferências.</p>
      </motion.div>

      <div className="space-y-6 max-w-2xl">
        {/* Profile */}
        <SectionCard icon={User} title="Perfil" delay={0.05}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                Nome
              </label>
              <Input
                type="text"
                placeholder="Seu nome"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="rounded-lg bg-input border-0 focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                Email
              </label>
              <Input
                type="email"
                value={user?.email ?? ""}
                readOnly
                className="rounded-lg bg-input border-0 opacity-60 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1">
                O email não pode ser alterado por aqui.
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={spring}>
              <Button
                variant="hero"
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {savingProfile ? "Salvando..." : "Salvar perfil"}
              </Button>
            </motion.div>
          </div>
        </SectionCard>

        {/* Security — only shown for email/password accounts */}
        {isPasswordUser && (
          <SectionCard icon={Shield} title="Segurança" delay={0.1}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                  Nova senha
                </label>
                <Input
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="rounded-lg bg-input border-0 focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                  Confirmar nova senha
                </label>
                <Input
                  type="password"
                  placeholder="Repita a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rounded-lg bg-input border-0 focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={spring}
              >
                <Button
                  variant="secondary"
                  onClick={handleChangePassword}
                  disabled={savingPassword}
                  className="gap-2"
                >
                  <Shield className="w-4 h-4" />
                  {savingPassword ? "Alterando..." : "Alterar senha"}
                </Button>
              </motion.div>
            </div>
          </SectionCard>
        )}

        {/* Data Management */}
        <SectionCard icon={Trash2} title="Gerenciar Dados" delay={0.15}>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Exporte todos os seus dados (tarefas, hábitos, finanças, refeições, metas e
                sessões de estudo) em formato JSON.
              </p>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={spring}
              >
                <Button
                  variant="secondary"
                  onClick={handleExportData}
                  disabled={exporting}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  {exporting ? "Exportando..." : "Exportar dados"}
                </Button>
              </motion.div>
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                Apague permanentemente todos os seus dados. Esta ação não pode ser desfeita.
              </p>
              <AlertDialog>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={spring}
                >
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2">
                      <Trash2 className="w-4 h-4" />
                      Apagar todos os dados
                    </Button>
                  </AlertDialogTrigger>
                </motion.div>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Apagar todos os dados?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação apagará permanentemente todas as suas tarefas, hábitos, finanças,
                      refeições, metas e sessões de estudo. Essa operação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearData}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Sim, apagar tudo
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </SectionCard>

        {/* Account */}
        <SectionCard icon={Settings} title="Conta" delay={0.2}>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Encerre sua sessão atual em todos os dispositivos.
            </p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={spring}>
              <Button variant="secondary" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Sair da conta
              </Button>
            </motion.div>
          </div>
        </SectionCard>

        {/* About */}
        <SectionCard icon={Info} title="Sobre" delay={0.25}>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span>Aplicativo</span>
              <span className="font-medium text-foreground">LifeOS Hub</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span>Versão</span>
              <span className="font-medium text-foreground">1.0.0</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span>Conta</span>
              <span className="font-medium text-foreground truncate max-w-[200px]">
                {user?.email}
              </span>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default Configuracoes;
