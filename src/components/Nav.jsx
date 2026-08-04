import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { profile } from "../data/content";
import LottieAnimation from "./ui/LottieAnimation";

const links = [
  { to: "/about", label: "Hakkımda" },
  { to: "/gallery", label: "Galeri" },
  { to: "/writings", label: "Yazılar" },
  { to: "/ai-work", label: "Yapay Zeka" },
  { to: "/contact", label: "İletişim" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isColorActive, setIsColorActive] = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleToggle = () => setIsColorActive((prev) => !prev);
    window.addEventListener("toggleColorMode", handleToggle);
    return () => window.removeEventListener("toggleColorMode", handleToggle);
  }, []);

  const handleLottieClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent("toggleColorMode"));
  };

  const solidHeader = scrolled || !isHome;

  const linkClass = ({ isActive }) =>
    `transition-colors outline-none focus:outline-none focus-visible:outline-none ${
      isActive ? "text-brush-soft font-medium" : "text-paper/70 hover:text-brush-soft"
    }`;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        solidHeader ? "bg-ink/90 backdrop-blur-md border-b border-paper/10" : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 md:px-10 h-16 md:h-20">
        <Link to="/" className="font-display text-lg tracking-tight text-paper outline-none focus:outline-none focus-visible:outline-none">
          {profile.name}
        </Link>

        <ul className="hidden md:flex items-center gap-8 font-sans text-sm">
          {links.map((l) => (
            <li key={l.to} className="flex items-center gap-2">
              {l.label === "Hakkımda" && (
                <button
                  type="button"
                  onClick={handleLottieClick}
                  className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center cursor-pointer transition-all duration-500 hover:scale-125 focus:outline-none outline-none shrink-0"
                  title="Kalp animasyonunu ve renk paletini tetikleyin"
                  aria-label="Kalp animasyonu butonu"
                >
                  <LottieAnimation isColorActive={isColorActive} className="w-full h-full" />
                </button>
              )}
              <NavLink to={l.to} className={linkClass}>
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={handleLottieClick}
            className="w-7 h-7 flex items-center justify-center cursor-pointer transition-all duration-500 hover:scale-125 active:scale-95 focus:outline-none outline-none shrink-0"
            title="Kalp animasyonunu ve renk paletini tetikleyin"
            aria-label="Kalp animasyonu butonu"
          >
            <LottieAnimation isColorActive={isColorActive} className="w-full h-full" />
          </button>

          <button
            onClick={() => setOpen((v) => !v)}
            className="text-paper p-2 -mr-2"
            aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={open}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-ink border-b border-paper/10 px-6 pb-6"
          >
            <ul className="flex flex-col gap-1 pt-2">
              {links.map((l) => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    className={({ isActive }) =>
                      `block py-3 font-sans text-base border-b border-paper/5 last:border-0 transition-colors ${
                        isActive ? "text-brush-soft" : "text-paper/85"
                      }`
                    }
                  >
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
