import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Cpu, Pin, Layers, BookOpen, Terminal, CheckCircle2, Filter, ChevronDown } from "lucide-react";
import SignatureLine from "./SignatureLine";
import { useAiProjects } from "../hooks/useContent";

export default function AIWork() {
  const { data: aiData } = useAiProjects();
  const aiProjects = aiData?.projects || [];
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
  }, [aiProjects]);

  // Filter logic
  const filteredProjects = useMemo(() => {
    if (activeFilter === "Tümü") return aiProjects;
    if (activeFilter === "📌 Öne Çıkarılanlar") return aiProjects.filter((p) => p.pinned);
    return aiProjects.filter((p) => p.category === activeFilter);
  }, [activeFilter, aiProjects]);

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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border dark:border-circuit/30 border-blue-900/25 dark:bg-circuit/10 bg-white/80 backdrop-blur-md mb-4 shadow-xs">
              <Pin size={13} className="text-[#1e3a8a] dark:text-circuit-soft" />
              <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#1e3a8a] dark:text-circuit-soft font-bold">
                LinkedIn Pinned & Production Showcase
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl text-paper leading-tight tracking-tight">
              Yapay Zekâ Mimarileri & Projeler
            </h1>
            <p className="mt-3 max-w-2xl font-sans text-base md:text-lg text-paper/75 leading-relaxed">
              LinkedIn profilinde öne çıkarılan (pinned) production-ready multi-agent sistemler, bilgisayarlı görü boru hatları ve derin öğrenme araştırmaları.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-4 p-4 rounded-xl border dark:border-paper/10 border-amber-900/15 dark:bg-ink-soft/80 bg-[#fdfbf7]/85 backdrop-blur-md self-start md:self-auto shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg dark:bg-circuit/15 bg-blue-900/10 text-[#1e3a8a] dark:text-circuit-soft shadow-xs">
                <Pin size={18} />
              </div>
              <div>
                <p className="font-mono text-xl font-bold text-paper">{pinnedCount} Pinned</p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-paper/60 font-semibold">Öne Çıkarılan Eser</p>
              </div>
            </div>
            <div className="h-8 w-[1px] dark:bg-paper/10 bg-amber-900/15" />
            <div>
              <p className="font-mono text-xl font-bold text-[#1e3a8a] dark:text-circuit-soft">Production</p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-paper/60 font-semibold">Ready Mimariler</p>
            </div>
          </div>
        </div>

        {/* ── Category Filter Bar (Web & Mobile Unified Dropdown Filter) ──────────────────────── */}
        <div className="mt-8 flex items-center justify-between p-4 rounded-xl dark:bg-ink-soft/90 bg-[#fdfbf7]/85 border dark:border-paper/15 border-amber-900/15 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg dark:bg-circuit/15 bg-blue-900/10 text-[#1e3a8a] dark:text-circuit-soft shadow-xs">
              <Filter size={16} />
            </div>
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-[#1e3a8a] dark:text-circuit-soft font-bold block">
                Kategori Filtresi
              </span>
              <span className="font-sans text-xs text-paper/60 hidden sm:inline font-medium">
                Seçilen kategoriye göre eserleri sırala
              </span>
            </div>
          </div>

          <div className="relative flex items-center min-w-[180px] sm:min-w-[240px]">
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="w-full appearance-none dark:bg-ink/80 bg-white/95 border dark:border-paper/20 border-amber-900/20 hover:border-blue-900/50 rounded-lg px-4 py-2.5 font-mono text-xs font-bold tracking-wider text-paper uppercase pr-8 focus:outline-none focus:border-blue-900 transition-all cursor-pointer shadow-xs"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="dark:bg-ink-soft bg-[#fdfbf7] text-paper py-1 font-semibold">
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute right-3 text-[#1e3a8a] dark:text-circuit-soft" />
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
                    ? "dark:bg-gradient-to-b dark:from-ink-soft dark:via-ink-soft dark:to-circuit/[0.04] bg-[#fdfbf7]/90 border dark:border-circuit/30 border-blue-900/20 hover:border-blue-900/40 hover:shadow-xl"
                    : "dark:bg-ink-soft/90 bg-[#fdfbf7]/80 border dark:border-paper/10 border-amber-900/15 hover:border-amber-900/30 hover:shadow-lg"
                }`}
              >
                <div>
                  {/* Top Bar inside Card */}
                  <div className="flex items-start justify-between gap-2 mb-4">
                    {proj.pinned ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-wider dark:bg-circuit/15 bg-blue-900/10 dark:text-circuit-soft text-[#1e3a8a] border dark:border-circuit/30 border-blue-900/25 font-bold transition-colors duration-300 shadow-xs">
                        <Pin size={11} className="rotate-45 text-[#1e3a8a] dark:text-circuit-soft" />
                        {proj.pinnedTag || "Pinned"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider dark:bg-paper/5 bg-black/[0.05] dark:text-paper/60 text-paper/85 border dark:border-paper/10 border-black/10 transition-colors duration-300 font-semibold">
                        <Cpu size={11} />
                        {proj.category}
                      </span>
                    )}

                    {proj.metric && (
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold dark:bg-brush/20 bg-brush text-white dark:text-brush-soft border dark:border-brush/30 border-brush shadow-xs transition-colors duration-300">
                        {proj.metric}
                      </span>
                    )}
                  </div>

                  {/* Title & Company */}
                  <div className="mt-2">
                    <div className="flex items-center gap-2 text-paper/60 font-mono text-[11px] mb-1 font-medium">
                      <span>{proj.company}</span>
                      <span>•</span>
                      <span>{proj.year}</span>
                    </div>
                    <h3 className="font-display text-xl text-paper leading-snug group-hover:text-[#1e3a8a] dark:group-hover:text-circuit-soft transition-colors font-bold">
                      {proj.title}
                    </h3>
                  </div>

                  {/* Summary Description */}
                  <p className="mt-3 font-sans text-sm text-paper/75 leading-relaxed font-normal">
                    {proj.summary}
                  </p>
                </div>

                {/* Footer of Card */}
                <div className="mt-8 pt-4 border-t dark:border-paper/10 border-black/10">
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {proj.stack.map((s) => (
                      <span
                        key={s}
                        className="font-mono text-[10px] px-2.5 py-1 rounded-md dark:bg-paper/[0.06] bg-black/[0.05] dark:text-paper/75 text-paper/85 font-medium group-hover:bg-blue-900/10 group-hover:text-[#1e3a8a] dark:group-hover:text-circuit-soft transition-colors"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between font-mono text-xs text-paper/60">
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-paper/80">
                      <CheckCircle2 size={12} className="text-[#1e3a8a] dark:text-circuit-soft" />
                      {proj.role}
                    </span>
                    <ArrowUpRight
                      size={17}
                      className="text-paper/50 group-hover:text-[#1e3a8a] dark:group-hover:text-circuit-soft group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"
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
