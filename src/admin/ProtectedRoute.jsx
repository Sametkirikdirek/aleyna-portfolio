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
  const { user, loading, logout } = useAuth();

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

  if (!user.role) {
    return (
      <div className="min-h-screen bg-[#0d0d12] text-white flex flex-col items-center justify-center gap-4 p-8 text-center">
        <h1 className="text-xl font-bold">Yetkisiz hesap</h1>
        <p className="text-white/70 max-w-lg">
          Bu e-posta için yönetim paneli erişimi tanımlı değil. Hesap yöneticisinden yetkilendirme isteyin.
        </p>
        <button onClick={logout} className="rounded-lg bg-white/10 px-5 py-2 border border-white/20">
          Oturumu kapat
        </button>
      </div>
    );
  }

  return children;
}
