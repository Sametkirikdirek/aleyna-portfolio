import { motion } from "framer-motion";
import { ArrowUpRight, Cpu } from "lucide-react";
import { aiProjects } from "../data/content";
import SignatureLine from "./SignatureLine";

export default function AIWork() {
  return (
    <section className="relative min-h-screen px-6 md:px-10 pt-28 pb-24 md:pt-32 md:pb-32 bg-ink overflow-hidden">
      {/* zemin: hafif devre/ızgara deseni */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-circuit) 1px, transparent 1px), linear-gradient(90deg, var(--color-circuit) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />

      <div className="relative max-w-5xl mx-auto">
        <p className="font-mono text-xs tracking-[0.25em] uppercase text-circuit-soft mb-4">
          Yapay Zeka Mühendisliği
        </p>
        <h2 className="font-display text-3xl md:text-5xl text-paper leading-tight text-balance max-w-2xl">
          Sistemler kuruyorum; bazıları öğreniyor.
        </h2>

        <div className="mt-14 grid md:grid-cols-3 gap-5 md:gap-6">
          {aiProjects.map((proj, i) => (
            <motion.a
              key={proj.id}
              href={proj.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group flex flex-col justify-between p-6 rounded-lg border border-paper/10 hover:border-circuit-soft/50 bg-ink-soft transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <Cpu size={18} className="text-circuit-soft" />
                  <span className="font-mono text-xs text-paper/40">{proj.year}</span>
                </div>
                <h3 className="font-display text-lg text-paper leading-snug group-hover:text-circuit-soft transition-colors">
                  {proj.title}
                </h3>
                <p className="mt-3 font-sans text-sm text-paper/60 leading-relaxed">
                  {proj.summary}
                </p>
              </div>

              <div className="mt-6">
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {proj.stack.map((s) => (
                    <span
                      key={s}
                      className="font-mono text-[10px] px-2 py-1 rounded-full bg-paper/5 text-paper/60"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between font-mono text-xs text-paper/40">
                  <span>{proj.role}</span>
                  <ArrowUpRight
                    size={16}
                    className="text-paper/40 group-hover:text-circuit-soft group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                  />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>

      <SignatureLine
        variant="light"
        className="relative mt-20 w-full max-w-5xl mx-auto h-10 md:h-14 opacity-40 [transform:scaleX(-1)]"
      />
    </section>
  );
}
