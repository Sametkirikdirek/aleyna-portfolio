import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Cpu, Pin, Layers, BookOpen, Terminal, CheckCircle2, Filter, ChevronDown } from "lucide-react";
import { aiProjects } from "../data/content";
import SignatureLine from "./SignatureLine";

export default function AIWork() {
  const [activeFilter, setActiveFilter] = useState("Tümü");

  // Dynamic category list from projects
  const categories = useMemo(() => {
    const set = new Set();
    set.add("Tümü");
    set.add("📌 Öne Çıkarılanlar");
    aiProjects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, []);

  // Filter logic
  const filteredProjects = useMemo(() => {
    if (activeFilter === "Tümü") return aiProjects;
    if (activeFilter === "📌 Öne Çıkarılanlar") return aiProjects.filter((p) => p.pinned);
    return aiProjects.filter((p) => p.category === activeFilter);
  }, [activeFilter]);

  // Statistics
  const pinnedCount = aiProjects.filter((p) => p.pinned).length;

  return (
    <section className="relative min-h-screen px-6 md:px-10 pt-28 pb-24 md:pt-32 md:pb-32 bg-ink overflow-hidden">
      {/* ── Background Circuit Pattern ──────────────── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-circuit) 1px, transparent 1px), linear-gradient(90deg, var(--color-circuit) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />

      {/* ── Glow Orbs ────────────────────────────────── */}
      <div className="pointer-events-none absolute top-20 right-10 w-96 h-96 bg-circuit/10 rounded-full blur-3xl -z-0" />
      <div className="pointer-events-none absolute bottom-40 left-10 w-96 h-96 bg-brush/10 rounded-full blur-3xl -z-0" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-paper/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-circuit/30 bg-circuit/10 backdrop-blur-md mb-4">
              <Pin size={13} className="text-circuit-soft" />
              <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-circuit-soft font-semibold">
                LinkedIn Pinned & Production Showcase
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl text-paper leading-tight tracking-tight">
              Yapay Zekâ Mimarileri & Projeler
            </h1>
            <p className="mt-3 max-w-2xl font-sans text-base md:text-lg text-paper/65 leading-relaxed">
              LinkedIn profilinde öne çıkarılan (pinned) production-ready multi-agent sistemler, bilgisayarlı görü boru hatları ve derin öğrenme araştırmaları.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-4 p-4 rounded-xl border border-paper/10 bg-ink-soft/80 backdrop-blur-md self-start md:self-auto">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-circuit/15 text-circuit-soft">
                <Pin size={18} />
              </div>
              <div>
                <p className="font-mono text-xl font-bold text-paper">{pinnedCount} Pinned</p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-paper/40">Öne Çıkarılan Eser</p>
              </div>
            </div>
            <div className="h-8 w-[1px] bg-paper/10" />
            <div>
              <p className="font-mono text-xl font-bold text-circuit-soft">Production</p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-paper/40">Ready Mimariler</p>
            </div>
          </div>
        </div>

        {/* ── Category Filter Bar (Web & Mobile Unified Dropdown Filter) ──────────────────────── */}
        <div className="mt-8 flex items-center justify-between p-4 rounded-xl bg-ink-soft/90 border border-paper/15 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-circuit/15 text-circuit-soft">
              <Filter size={16} />
            </div>
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-circuit-soft font-semibold block">
                Kategori Filtresi
              </span>
              <span className="font-sans text-xs text-paper/50 hidden sm:inline">
                Seçilen kategoriye göre eserleri sırala
              </span>
            </div>
          </div>

          <div className="relative flex items-center min-w-[180px] sm:min-w-[240px]">
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="w-full appearance-none bg-ink/80 border border-paper/20 hover:border-circuit-soft/50 rounded-lg px-4 py-2.5 font-mono text-xs font-semibold tracking-wider text-paper uppercase pr-8 focus:outline-none focus:border-circuit-soft transition-all cursor-pointer shadow-inner"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-ink-soft text-paper py-1">
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute right-3 text-circuit-soft" />
          </div>
        </div>

        {/* ── Project Cards Grid ──────────────────────── */}
        <motion.div layout className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((proj, i) => (
              <motion.a
                key={proj.id}
                href={proj.link}
                target="_blank"
                rel="noopener noreferrer"
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className={`group relative flex flex-col justify-between p-6 md:p-7 rounded-2xl border backdrop-blur-md transition-all duration-500 ${
                  proj.pinned
                    ? "bg-gradient-to-b from-ink-soft via-ink-soft to-circuit/[0.04] border-circuit/30 hover:border-circuit-soft hover:shadow-[0_0_25px_rgba(107,163,166,0.15)]"
                    : "bg-ink-soft/90 border-paper/10 hover:border-paper/30"
                }`}
              >
                <div>
                  {/* Top Bar inside Card */}
                  <div className="flex items-start justify-between gap-2 mb-4">
                    {proj.pinned ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider bg-circuit/15 text-circuit-soft border border-circuit/30 font-medium">
                        <Pin size={11} className="rotate-45" />
                        {proj.pinnedTag || "Pinned"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider bg-paper/5 text-paper/50 border border-paper/10">
                        <Cpu size={11} />
                        {proj.category}
                      </span>
                    )}

                    {proj.metric && (
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {proj.metric}
                      </span>
                    )}
                  </div>

                  {/* Title & Company */}
                  <div className="mt-2">
                    <div className="flex items-center gap-2 text-paper/40 font-mono text-[11px] mb-1">
                      <span>{proj.company}</span>
                      <span>•</span>
                      <span>{proj.year}</span>
                    </div>
                    <h3 className="font-display text-xl text-paper leading-snug group-hover:text-circuit-soft transition-colors font-semibold">
                      {proj.title}
                    </h3>
                  </div>

                  {/* Summary Description */}
                  <p className="mt-3 font-sans text-sm text-paper/65 leading-relaxed">
                    {proj.summary}
                  </p>
                </div>

                {/* Footer of Card */}
                <div className="mt-8 pt-4 border-t border-paper/10">
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {proj.stack.map((s) => (
                      <span
                        key={s}
                        className="font-mono text-[10px] px-2.5 py-1 rounded-md bg-paper/[0.06] text-paper/75 group-hover:bg-circuit/10 group-hover:text-circuit-soft transition-colors"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between font-mono text-xs text-paper/50">
                    <span className="flex items-center gap-1 text-[11px]">
                      <CheckCircle2 size={12} className="text-circuit-soft" />
                      {proj.role}
                    </span>
                    <ArrowUpRight
                      size={17}
                      className="text-paper/40 group-hover:text-circuit-soft group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"
                    />
                  </div>
                </div>
              </motion.a>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <SignatureLine
        variant="light"
        className="relative mt-24 w-full max-w-5xl mx-auto h-10 md:h-14 opacity-40 [transform:scaleX(-1)]"
      />
    </section>
  );
}
