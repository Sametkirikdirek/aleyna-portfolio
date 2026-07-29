import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { writings, profile } from "../data/content";

export default function Writings() {
  return (
    <section className="min-h-screen px-6 md:px-10 pt-28 pb-24 md:pt-32 md:pb-32 bg-paper text-ink">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 md:mb-16 flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="font-mono text-xs tracking-[0.25em] uppercase text-umber mb-4">
              Yazılar
            </p>
            <h2 className="font-display text-3xl md:text-5xl leading-tight text-balance">
              Medium'da yazdıklarım
            </h2>
          </div>
          <a
            href={profile.social.medium}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-sans text-sm text-ink/70 hover:text-brush transition-colors"
          >
            Tüm yazılar <ArrowUpRight size={16} />
          </a>
        </header>

        <div className="flex flex-col divide-y divide-ink/10 border-t border-b border-ink/10">
          {writings.map((w, i) => (
            <motion.a
              key={w.id}
              href={w.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="group py-7 md:py-8 grid md:grid-cols-[auto_1fr_auto] gap-2 md:gap-8 items-baseline md:items-start"
            >
              <span className="font-mono text-xs text-umber order-1 md:order-none">
                {w.date}
              </span>

              <div className="order-3 md:order-none">
                <h3 className="font-display text-xl md:text-2xl leading-snug group-hover:text-brush transition-colors">
                  {w.title}
                </h3>
                <p className="mt-2 font-sans text-sm text-ink/60 leading-relaxed max-w-xl">
                  {w.excerpt}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="font-mono text-[11px] px-2 py-1 rounded-full border border-ink/15 text-ink/60">
                    {w.tag}
                  </span>
                  <span className="font-mono text-[11px] text-ink/40">{w.readTime} okuma</span>
                </div>
              </div>

              <ArrowUpRight
                size={20}
                className="order-2 md:order-none justify-self-end text-ink/30 group-hover:text-brush group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
              />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
