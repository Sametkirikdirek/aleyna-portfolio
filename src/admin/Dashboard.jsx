import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  Home, Image, FileText, Cpu, Clock, BookOpen, Mail, LogOut, Menu, X,
} from "lucide-react";
import ProfileEditor from "./editors/ProfileEditor";
import GalleryEditor from "./editors/GalleryEditor";
import CVEditor from "./editors/CVEditor";
import AIProjectEditor from "./editors/AIProjectEditor";
import TimelineEditor from "./editors/TimelineEditor";
import WritingsEditor from "./editors/WritingsEditor";
import ContactEditor from "./editors/ContactEditor";

const NAV_ITEMS = [
  { id: "profile", label: "Anasayfa & Hakkımda", icon: Home },
  { id: "gallery", label: "Galeri", icon: Image },
  { id: "contact", label: "İletişim Sayfası", icon: Mail },
  { id: "cv", label: "CV Yönetimi", icon: FileText },
  { id: "ai", label: "Yapay Zeka Projeleri", icon: Cpu },
  { id: "timeline", label: "Zaman Yolculuğu", icon: Clock },
  { id: "writings", label: "Kişisel Yazılar", icon: BookOpen },
];

const EDITORS = {
  profile: ProfileEditor,
  gallery: GalleryEditor,
  contact: ContactEditor,
  cv: CVEditor,
  ai: AIProjectEditor,
  timeline: TimelineEditor,
  writings: WritingsEditor,
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [active, setActive] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const ActiveEditor = EDITORS[active];

  return (
    <div className="min-h-screen bg-[#0d0d12] flex text-white">
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

      {/* ── Sidebar ── */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#111118] border-r border-white/8 z-30 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:flex`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/8">
          <div>
            <p className="font-semibold text-sm tracking-tight">Admin Paneli</p>
            <p className="text-white/40 text-xs mt-0.5 truncate max-w-[160px]">{user?.email}</p>
          </div>
          <button
            className="md:hidden text-white/40 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActive(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                active === id
                  ? "bg-rose-600/20 text-rose-300 border border-rose-500/20"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        {/* Çıkış */}
        <div className="p-3 border-t border-white/8">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
          >
            <LogOut size={16} />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* ── Ana İçerik ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Üst Bar (Mobile) */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-white/8 bg-[#111118]">
          <button onClick={() => setSidebarOpen(true)} className="text-white/60 hover:text-white">
            <Menu size={20} />
          </button>
          <span className="text-sm font-medium text-white/80">
            {NAV_ITEMS.find((n) => n.id === active)?.label}
          </span>
        </div>

        {/* Editör İçeriği */}
        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              <ActiveEditor />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
