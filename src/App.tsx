import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Rotina from "./pages/Rotina";
import Financas from "./pages/Financas";
import Estudos from "./pages/Estudos";
import Habitos from "./pages/Habitos";
import Alimentacao from "./pages/Alimentacao";
import Metas from "./pages/Metas";
import Configuracoes from "./pages/Configuracoes";
import Planos from "./pages/Planos";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="rotina" element={<Rotina />} />
              <Route path="financas" element={<Financas />} />
              <Route path="estudos" element={<Estudos />} />
              <Route path="habitos" element={<Habitos />} />
              <Route path="alimentacao" element={<Alimentacao />} />
              <Route path="metas" element={<Metas />} />
              <Route path="configuracoes" element={<Configuracoes />} />
              <Route path="planos" element={<Planos />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
