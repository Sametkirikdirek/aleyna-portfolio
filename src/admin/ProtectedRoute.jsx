import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

/**
 * Admin rotalarını oturum durumuna göre korur.
 * - Yükleniyorsa: spinner göster
 * - Oturum açık: children render et
 * - Oturum kapalı: /admin/login'e yönlendir
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d12] flex items-center justify-center">
        <Loader2 size={28} className="text-rose-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
