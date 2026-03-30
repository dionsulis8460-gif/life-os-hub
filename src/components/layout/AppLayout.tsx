import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CheckSquare,
  Wallet,
  BookOpen,
  Brain,
  Utensils,
  Target,
  Settings,
  CreditCard,
  LogOut,
  MoreHorizontal,
  X,
} from "lucide-react";
import { useState } from "react";
import TrialAlertBanner from "./TrialAlertBanner";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/hooks/useOnboarding";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import ModuleGuide from "@/components/onboarding/ModuleGuide";

const spring = { type: "spring" as const, duration: 0.4, bounce: 0 };

const navItems = [
  { to: "/app", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/app/rotina", icon: CheckSquare, label: "Rotina" },
  { to: "/app/financas", icon: Wallet, label: "Finanças" },
  { to: "/app/estudos", icon: BookOpen, label: "Estudos" },
  { to: "/app/habitos", icon: Brain, label: "Hábitos" },
  { to: "/app/alimentacao", icon: Utensils, label: "Alimentação" },
  { to: "/app/metas", icon: Target, label: "Metas" },
];

const bottomItems = [
  { to: "/app/planos", icon: CreditCard, label: "Planos" },
  { to: "/app/configuracoes", icon: Settings, label: "Configurações" },
];

const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { state: onboarding, completeWizard, skipWizard, markModuleVisited, isModuleVisited } = useOnboarding();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col fixed inset-y-0 left-0 bg-sidebar z-40" style={{ boxShadow: "var(--shadow-sm)" }}>
        <div className="h-16 flex items-center px-6 gap-2">
          <div className="w-7 h-7 rounded-lg accent-gradient" />
          <span className="font-bold text-lg tracking-tight text-foreground">LifeOS</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "text-foreground shadow-subtle bg-sidebar-accent"
                    : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className="w-5 h-5" />
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="absolute left-0 w-1 h-5 rounded-r-full accent-gradient"
                      transition={spring}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 space-y-1 border-t border-sidebar-border">
          {bottomItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "text-foreground shadow-subtle bg-sidebar-accent"
                    : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/50"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-all duration-200 w-full"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-sidebar/95 backdrop-blur-xl mobile-bottom-nav" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="flex justify-around py-2">
          {navItems.slice(0, 4).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-2 py-1.5 text-xs ${
                  isActive ? "text-primary" : "text-sidebar-foreground"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
          <button
            onClick={() => setMobileOpen(true)}
            className="flex flex-col items-center gap-1 px-2 py-1.5 text-xs text-sidebar-foreground"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span>Mais</span>
          </button>
        </div>
      </div>

      {/* Mobile "Mais" drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="lg:hidden fixed inset-0 bg-black/50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-sidebar rounded-t-3xl pb-8"
              style={{ boxShadow: "var(--shadow-lg)" }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={spring}
            >
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <span className="font-semibold text-sm">Mais</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-3 space-y-1">
                {[...navItems.slice(4), ...bottomItems].map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "text-foreground bg-sidebar-accent"
                          : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/50"
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </NavLink>
                ))}
                <button
                  onClick={() => { setMobileOpen(false); handleLogout(); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-all duration-200 w-full"
                >
                  <LogOut className="w-5 h-5" />
                  Sair
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 lg:ml-60 pb-20 lg:pb-0">
        <div className="p-6 lg:p-8">
          <TrialAlertBanner />
          <Outlet />
        </div>
      </main>

      {/* Onboarding wizard — shown to first-time users */}
      {!onboarding.wizardCompleted && (
        <OnboardingWizard onComplete={completeWizard} onSkip={skipWizard} />
      )}

      {/* Per-module guide — shown on first visit to each module */}
      {onboarding.wizardCompleted && (
        <ModuleGuide isModuleVisited={isModuleVisited} markModuleVisited={markModuleVisited} />
      )}
    </div>
  );
};

export default AppLayout;
