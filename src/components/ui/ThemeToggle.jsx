import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * Custom Day / Night Theme Toggle Switch
 * Transitions between glowing Sun (Day/Light) and cratered Moon + Stars (Night/Dark)
 * Remembers user preference in localStorage (defaults to Dark mode)
 */
export default function ThemeToggle({ className = "" }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") return saved;
    }
    return "dark"; // Default is Dark Mode
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center w-14 h-7 md:w-16 md:h-8 rounded-full p-1 cursor-pointer transition-all duration-500 border-2 select-none shrink-0 ${
        isDark
          ? "bg-gradient-to-r from-[#0b0f19] via-[#1e1b4b] to-[#312e81] border-[#6366f1]/60 shadow-[0_0_12px_rgba(99,102,241,0.3)]"
          : "bg-gradient-to-r from-[#ea580c] via-[#f97316] to-[#fde047] border-[#c2410c]/80 shadow-[0_0_12px_rgba(249,115,22,0.4)]"
      } ${className}`}
      title={isDark ? "Aydınlık moduna geç" : "Karanlık moduna geç"}
      aria-label="Gece ve Gündüz modu arasında geçiş yapın"
    >
      {/* Background Elements: Twinkling Stars for Night / Soft Clouds for Day */}
      <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
        {isDark ? (
          /* Night Mode: Twinkling Stars */
          <div className="w-full h-full relative">
            <span className="absolute top-1 left-2.5 w-1 h-1 bg-white rounded-full animate-pulse opacity-80" />
            <span
              className="absolute bottom-1.5 left-5 w-1 h-1 bg-indigo-200 rounded-full animate-ping opacity-60"
              style={{ animationDuration: "2.5s" }}
            />
            <span className="absolute top-2 left-7 w-1 h-1 bg-purple-200 rounded-full animate-pulse opacity-90" />
            <svg
              className="absolute top-1 left-3.5 w-2.5 h-2.5 text-indigo-100/90"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
            </svg>
          </div>
        ) : (
          /* Day Mode: Soft Fluffy Clouds */
          <div className="w-full h-full relative">
            <svg
              className="absolute bottom-0.5 right-1 w-6 h-3 text-white/80"
              viewBox="0 0 24 12"
              fill="currentColor"
            >
              <path d="M19.35 5.04C18.67 2.14 16.07 0 13 0 10.23 0 7.86 1.74 6.9 4.25 4.14 4.55 2 6.92 2 9.75 2 12.65 4.35 15 7.25 15h11.5c2.62 0 4.75-2.13 4.75-4.75 0-2.52-1.96-4.59-4.43-4.72z" />
            </svg>
            <svg
              className="absolute top-0.5 right-5 w-4 h-2.5 text-white/60"
              viewBox="0 0 24 12"
              fill="currentColor"
            >
              <path d="M19.35 5.04C18.67 2.14 16.07 0 13 0 10.23 0 7.86 1.74 6.9 4.25 4.14 4.55 2 9.75 2 12.65 4.35 15 7.25 15h11.5c2.62 0 4.75-2.13 4.75-4.75 0-2.52-1.96-4.59-4.43-4.72z" />
            </svg>
          </div>
        )}
      </div>

      {/* Sliding Orb: Sun for Day (Left) / Cratered Moon for Night (Right) */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`relative z-10 w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center shadow-md ${
          isDark ? "ml-auto" : "mr-auto"
        }`}
      >
        {isDark ? (
          /* Moon Orb */
          <div className="w-full h-full rounded-full bg-gradient-to-br from-[#f8fafc] via-[#cbd5e1] to-[#94a3b8] shadow-[0_0_8px_rgba(203,213,225,0.8)] relative overflow-hidden flex items-center justify-center">
            <span className="absolute top-1 left-1.5 w-1.5 h-1.5 rounded-full bg-slate-400/40" />
            <span className="absolute bottom-1 right-1.5 w-1 h-1 rounded-full bg-slate-400/50" />
            <span className="absolute top-2.5 right-1 w-1.5 h-1.5 rounded-full bg-slate-400/30" />
          </div>
        ) : (
          /* Sun Orb */
          <div className="w-full h-full rounded-full bg-gradient-to-br from-[#fff7ed] via-[#facc15] to-[#eab308] shadow-[0_0_10px_rgba(250,204,21,0.95)] relative flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-white/70 blur-[1px]" />
          </div>
        )}
      </motion.div>
    </button>
  );
}
