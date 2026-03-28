import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-lg accent-gradient animate-pulse" />
      </div>
    );
  }

  if (!user) {
    // If Supabase redirected back here with an OAuth error in the hash,
    // forward the hash to /login so the error message can be displayed.
    const hash = location.hash;
    if (hash && new URLSearchParams(hash.slice(1)).has("error")) {
      return <Navigate to={`/login${hash}`} replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
