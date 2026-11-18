import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  Home,
  Image,
  FileText,
  Cpu,
  Clock,
  BookOpen,
  Mail,
  LogOut,
  Menu,
  X,
  BarChart3,
  Palette,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import ProfileEditor from "./editors/ProfileEditor";
import GalleryEditor from "./editors/GalleryEditor";
import CommissionEditor from "./editors/CommissionEditor";
import CVEditor from "./editors/CVEditor";
import AIProjectEditor from "./editors/AIProjectEditor";
import TimelineEditor from "./editors/TimelineEditor";
import WritingsEditor from "./editors/WritingsEditor";
import ContactEditor from "./editors/ContactEditor";
import AnalyticsEditor from "./editors/AnalyticsEditor";
import { getRoleBadgeInfo, ROLES } from "../lib/roles";

const EDITORS = {
  commissions: CommissionEditor,
  analytics: AnalyticsEditor,
  gallery: GalleryEditor,
  profile: ProfileEditor,
  writings: WritingsEditor,
  ai: AIProjectEditor,
  timeline: TimelineEditor,
  cv: CVEditor,
  contact: ContactEditor,
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const isModerator = user?.isModerator;
  const isArtist = user?.isArtist;

  // Başlangıç sekmesi: Moderatör için doğrudan Ön Eleme/Güvenlik; Sanatçı için Siparişler veya Galeri
  const [active, setActive] = useState(() => (isModerator ? "commissions" : "commissions"));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const roleInfo = getRoleBadgeInfo(user?.role);

  // Rol bazlı menü öğeleri
  const navSections = useMemo(() => {
    if (isModerator && !user?.isSuperAdmin) {
      return [
        {
          title: "GÜVENLİK & KOORDİNASYON",
          items: [
            { id: "commissions", label: "Ön Eleme & Güvenlik", icon: ShieldAlert, badge: "Nöbet" },
            { id: "analytics", label: "Güvenlik & Analitik", icon: BarChart3 },
            { id: "contact", label: "Gelen İletişimler", icon: Mail },
          ],
        },
        {
          title: "PORTFOLYO İÇERİKLERİ (KONTROL)",
          items: [
            { id: "gallery", label: "Galeri İnceleme", icon: Image },
            { id: "profile", label: "Anasayfa & Biyografi", icon: Home },
            { id: "writings", label: "Yazılar & Kütüphane", icon: BookOpen },
            { id: "ai", label: "Yapay Zeka Projeleri", icon: Cpu },
            { id: "timeline", label: "Zaman Yolculuğu", icon: Clock },
            { id: "cv", label: "CV Yönetimi", icon: FileText },
          ],
        },
      ];
    }

    // Sanatçı Paneli (Aleyna Altunsu)
    return [
      {
        title: "SANAT ATÖLYESİ",
        items: [
          { id: "commissions", label: "Özel Tuval Siparişleri", icon: Palette, badge: "Masam" },
          { id: "gallery", label: "Galeri & Koleksiyonlar", icon: Image },
          { id: "writings", label: "Yazılarım & Kütüphane", icon: BookOpen },
          { id: "timeline", label: "Zaman Yolculuğu", icon: Clock },
          { id: "ai", label: "Yapay Zeka Projeleri", icon: Cpu },
        ],
      },
      {
        title: "BİYOGRAFİ & İSTATİSTİK",
        items: [
          { id: "profile", label: "Anasayfa & Hakkımda", icon: Home },
          { id: "cv", label: "CV Yönetimi", icon: FileText },
          { id: "contact", label: "İletişim Sayfası", icon: Mail },
          { id: "analytics", label: "Ziyaretçi İstatistikleri", icon: BarChart3 },
        ],
      },
    ];
  }, [isModerator, user?.isSuperAdmin]);

  const allNavItems = useMemo(
    () => navSections.flatMap((s) => s.items),
    [navSections]
  );

  const ActiveEditor = EDITORS[active] || CommissionEditor;

  return (
    <div className="min-h-screen bg-[#0d0d12] flex text-white font-sans">
      {/* ── Overlay (mobile) ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar (Sol Tarafta Sabit & Kaydırmada Asla Hareket Etmez) ── */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-[#111118] border-r border-white/8 z-30 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:fixed md:top-0 md:left-0 md:h-screen md:w-64 md:z-30`}
      >
        {/* Panel Başlığı / Kullanıcı Bilgisi */}
        <div className="p-4 border-b border-white/8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                {isModerator ? (
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
                    <ShieldAlert size={20} />
                  </div>
                ) : (
                  <img
                    src="/logo.png"
                    alt="Aleyna Altunsu"
                    className="w-10 h-10 rounded-full object-cover border border-amber-500/30 shadow-sm"
                  />
                )}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#111118] ${
                    isModerator ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-sm tracking-tight text-white truncate">
                    {roleInfo.title}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${roleInfo.badgeColor}`}
                  >
                    {roleInfo.badge}
                  </span>
                  <p className="text-white/40 text-[11px] truncate max-w-[100px]">
                    {user?.email?.split("@")[0]}
                  </p>
                </div>
              </div>
            </div>

            <button
              className="md:hidden text-white/40 hover:text-white cursor-pointer"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigasyon Listesi */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
          {navSections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              <p className="px-3 text-[10px] font-mono uppercase tracking-wider text-white/30 font-semibold mb-1">
                {sec.title}
              </p>
              {sec.items.map(({ id, label, icon: Icon, badge }) => {
                const isActive = active === id;
                return (
                  <button
                    key={id}
                    onClick={() => {
                      setActive(id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                      isActive
                        ? isModerator
                          ? "bg-emerald-500/15 text-emerald-200 border border-emerald-500/25 shadow-sm"
                          : "bg-amber-500/15 text-amber-200 border border-amber-500/25 shadow-sm"
                        : "text-white/50 hover:text-white/80 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        size={16}
                        className={
                          isActive
                            ? isModerator
                              ? "text-emerald-400"
                              : "text-amber-400"
                            : "text-white/40"
                        }
                      />
                      <span className="truncate">{label}</span>
                    </div>

                    {badge && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                          isActive
                            ? isModerator
                              ? "bg-emerald-500/30 text-emerald-200"
                              : "bg-amber-500/30 text-amber-200"
                            : "bg-white/5 text-white/40"
                        }`}
                      >
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Alt Bilgi & Çıkış */}
        <div className="p-3 border-t border-white/8 space-y-2">
          <div className="px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between text-[11px] text-white/40 font-mono">
            <span className="truncate">{user?.email}</span>
            <span className="text-emerald-400 shrink-0 ml-1">● Aktif</span>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 cursor-pointer"
          >
            <LogOut size={16} />
            Güvenli Çıkış
          </button>
        </div>
      </aside>

      {/* ── Ana İçerik (Sidebar genişliği kadar soldan boşluklu) ── */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        {/* Üst Bar (Mobile) */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/8 bg-[#111118]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-white/60 hover:text-white cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <span className="text-sm font-medium text-white/80">
              {allNavItems.find((n) => n.id === active)?.label}
            </span>
          </div>

          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded border ${roleInfo.badgeColor}`}
          >
            {roleInfo.badge}
          </span>
        </div>

        {/* Editör İçeriği */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12 bg-[#0d0d12]">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
              className="max-w-5xl mx-auto w-full"
            >
              <ActiveEditor />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
