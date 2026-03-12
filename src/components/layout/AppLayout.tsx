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
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

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
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
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
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-all duration-200 w-full">
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-sidebar/95 backdrop-blur-xl" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="flex justify-around py-2">
          {navItems.slice(0, 5).map((item) => (
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
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-60 pb-20 lg:pb-0">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
