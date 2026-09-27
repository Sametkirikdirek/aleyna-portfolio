import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Sayfa yüklendiğinde mevcut kilit durumunu kontrol et
  useEffect(() => {
    try {
      const lockUntil = parseInt(localStorage.getItem("admin_lockout_until") || "0", 10);
      const now = Date.now();
      if (lockUntil > now) {
        setLockoutTimer(Math.ceil((lockUntil - now) / 1000));
      }
    } catch {}
  }, []);

  // Geri sayım sayacı
  useEffect(() => {
    if (lockoutTimer <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimer((prev) => {
        if (prev <= 1) {
          try {
            localStorage.removeItem("admin_lockout_until");
            localStorage.removeItem("admin_failed_attempts");
          } catch {}
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;

    setError("");
    setLoading(true);

    const cleanEmail = email.trim();
    const result = await login(cleanEmail, password);
    setLoading(false);

    if (result.success) {
      try {
        localStorage.removeItem("admin_failed_attempts");
        localStorage.removeItem("admin_lockout_until");
      } catch {}
      navigate("/admin/dashboard");
    } else {
      let attempts = 1;
      try {
        attempts = parseInt(localStorage.getItem("admin_failed_attempts") || "0", 10) + 1;
        localStorage.setItem("admin_failed_attempts", String(attempts));
      } catch {}

      if (attempts >= MAX_FAILED_ATTEMPTS) {
        const lockUntil = Date.now() + LOCKOUT_SECONDS * 1000;
        try {
          localStorage.setItem("admin_lockout_until", String(lockUntil));
        } catch {}
        setLockoutTimer(LOCKOUT_SECONDS);
        setError(`Güvenlik uyarısı: Çok fazla hatalı deneme! Lütfen ${LOCKOUT_SECONDS} saniye bekleyin.`);
      } else {
        setError(`${result.error} (Kalan deneme hakkı: ${MAX_FAILED_ATTEMPTS - attempts})`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d12] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Arka plan parlaması */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-rose-900/10 blur-[120px]" />
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-indigo-900/10 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-sm"
      >
        {/* Kart */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
          {/* Logo / Başlık */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-rose-500/30 blur-md" />
              <img
                src="/logo.png"
                alt="Aleyna Altunsu"
                className="relative w-16 h-16 rounded-full object-cover border-2 border-rose-500/40 shadow-xl"
              />
            </div>
            <div className="text-center">
              <h1 className="text-white font-semibold text-lg tracking-tight">Admin Girişi</h1>
              <p className="text-white/40 text-sm mt-0.5">Aleyna Altunsu · Kontrol Paneli</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* E-posta */}
            <div className="space-y-1.5">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">
                E-posta
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  disabled={loading || lockoutTimer > 0}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@mail.com"
                  className="w-full bg-white/[0.06] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-white/20 outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                />
              </div>
            </div>

            {/* Şifre */}
            <div className="space-y-1.5">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">
                Şifre
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  id="admin-password"
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  disabled={loading || lockoutTimer > 0}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.06] border border-white/10 rounded-lg pl-10 pr-10 py-2.5 text-white text-sm placeholder:text-white/20 outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  disabled={lockoutTimer > 0}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors disabled:opacity-30"
                  aria-label="Şifreyi göster/gizle"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Kilit Uyarısı */}
            {lockoutTimer > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-medium"
              >
                <ShieldAlert size={16} className="shrink-0 text-amber-400" />
                <span>Kaba kuvvet (brute-force) koruması devrede. Lütfen {lockoutTimer} saniye bekleyin.</span>
              </motion.div>
            )}

            {/* Hata mesajı */}
            {error && lockoutTimer <= 0 && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2 font-medium"
              >
                {error}
              </motion.p>
            )}

            {/* Giriş Butonu */}
            <button
              id="admin-login-btn"
              type="submit"
              disabled={loading || lockoutTimer > 0}
              className="w-full mt-2 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-950 disabled:text-white/40 disabled:cursor-not-allowed text-white font-medium text-sm py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-rose-900/30"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Giriş yapılıyor…
                </>
              ) : lockoutTimer > 0 ? (
                `Kilitli (${lockoutTimer}s)`
              ) : (
                "Giriş Yap"
              )}
            </button>
          </form>
        </div>

        {/* Alt not */}
        <p className="text-center text-white/20 text-xs mt-6">
          Bu sayfa kamuya açık değildir.
        </p>
      </motion.div>
    </div>
  );
}
