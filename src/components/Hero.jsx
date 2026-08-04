import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { profile } from "../data/content";
import { ArrowRight, BookOpen } from "lucide-react";
import ParticleCanvas from "./ui/particle-canvas";
import { useColorMode } from "../context/ColorModeContext";

/* Inline SVG social icons (lucide dropped brand icons in v1.x) */
const GithubIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
);
const LinkedinIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);
const InstagramIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const socialLinks = [
  { icon: GithubIcon, href: profile.social.github, label: "GitHub" },
  { icon: LinkedinIcon, href: profile.social.linkedin, label: "LinkedIn" },
  { icon: BookOpen, href: profile.social.medium, label: "Medium" },
  { icon: InstagramIcon, href: profile.social.instagram, label: "Instagram" },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.75, delay, ease: [0.25, 1, 0.5, 1] },
});

const roleColorStyles = [
  {
    activeBorder: "border-[#e11d48]/50",
    activeText: "text-[#fb7185]",
    activeBg: "bg-[#e11d48]/15",
    activeShadow: "shadow-[0_0_15px_rgba(225,29,72,0.35)]",
  },
  {
    activeBorder: "border-[#3b82f6]/50",
    activeText: "text-[#60a5fa]",
    activeBg: "bg-[#1d4ed8]/15",
    activeShadow: "shadow-[0_0_15px_rgba(59,130,246,0.35)]",
  },
  {
    activeBorder: "border-[#f43f5e]/50",
    activeText: "text-[#fda4af]",
    activeBg: "bg-[#f43f5e]/15",
    activeShadow: "shadow-[0_0_15px_rgba(244,63,94,0.35)]",
  },
];

export default function Hero() {
  const { isColorActive } = useColorMode();

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-ink">
      {/* ── Particle background ──────────────────────── */}
      <ParticleCanvas
        particleCount={800}
        speed={isColorActive ? 1.25 : 1}
        accentColor={isColorActive ? "#e11d48" : "#c0956c"}
      />

      {/* ── Subtle grain overlay ─────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Content ──────────────────────────────────── */}
      <div className="relative z-10 max-w-5xl w-full mx-auto px-6 md:px-10 py-24">
        <div className="flex flex-col items-start gap-8">
          {/* Roles pill row */}
          <motion.div {...fadeUp(0)} className="flex flex-wrap gap-2">
            {profile.roles.map((role, idx) => {
              const activeStyle = roleColorStyles[idx % roleColorStyles.length];
              return (
                <span
                  key={role}
                  className={`px-3.5 py-1.5 rounded-full border font-mono text-[11px] tracking-[0.15em] uppercase transition-all duration-1000 ease-in-out backdrop-blur-sm ${
                    isColorActive
                      ? `${activeStyle.activeBorder} ${activeStyle.activeText} ${activeStyle.activeBg} ${activeStyle.activeShadow}`
                      : "border-paper/15 bg-paper/[0.04] text-paper/70"
                  }`}
                >
                  {role}
                </span>
              );
            })}
          </motion.div>

          {/* Name */}
          <motion.h1
            {...fadeUp(0.12)}
            className={`font-display text-[clamp(2.8rem,11vw,7rem)] leading-[0.92] tracking-tight transition-all duration-1000 ease-in-out ${
              isColorActive
                ? "text-gradient-animated drop-shadow-[0_0_30px_rgba(230,197,148,0.25)]"
                : "text-paper"
            }`}
          >
            {profile.name}
          </motion.h1>

          {/* Tagline */}
          <motion.p
            {...fadeUp(0.24)}
            className={`max-w-lg font-sans text-lg md:text-xl leading-relaxed transition-all duration-500 ease-in-out ${
              isColorActive
                ? "text-[#fb7185] drop-shadow-[0_0_12px_rgba(251,113,133,0.3)] font-medium"
                : "text-paper/70"
            }`}
          >
            {profile.tagline}
          </motion.p>

          {/* CTA buttons */}
          <motion.div {...fadeUp(0.36)} className="flex flex-wrap gap-4 mt-2">
            <Link
              to="/gallery"
              className="group inline-flex items-center gap-2 px-7 py-3.5 bg-brush text-paper font-sans text-sm font-medium rounded-full hover:bg-brush-soft transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Eserlere göz at
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/ai-work"
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-paper/20 text-paper/85 font-sans text-sm font-medium rounded-full hover:border-circuit-soft hover:text-circuit-soft transition-all duration-300 backdrop-blur-sm"
            >
              Yapay zeka çalışmaları
            </Link>
          </motion.div>

          {/* Social icons */}
          <motion.div {...fadeUp(0.48)} className="flex items-center gap-5 mt-4">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-paper/40 hover:text-paper/90 transition-colors duration-300"
                aria-label={label}
              >
                <Icon size={18} strokeWidth={1.5} />
              </a>
            ))}
            <span className="ml-2 font-mono text-[10px] tracking-widest uppercase text-paper/30">
              {profile.location}
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


