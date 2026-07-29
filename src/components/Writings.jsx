import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { writings as fallbackWritings, profile } from "../data/content";

export default function Writings() {
  const [articles, setArticles] = useState(fallbackWritings);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadMediumPosts() {
      try {
        const response = await fetch("/api/medium");
        if (!response.ok) throw new Error("Feed unavailable");

        const data = await response.json();
        if (!cancelled && Array.isArray(data.posts) && data.posts.length > 0) {
          setArticles(data.posts);
          setLive(true);
        }
      } catch {
        if (!cancelled) {
          setArticles(fallbackWritings);
          setLive(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMediumPosts();
    return () => {
      cancelled = true;
    };
  }, []);

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
            <p className="mt-4 font-sans text-sm text-ink/55 max-w-xl">
              Aleyna Altunsu'nun Medium profilinden güncel yazılar.
              {live && (
                <span className="ml-2 font-mono text-[11px] text-brush">
                  Canlı besleme aktif
                </span>
              )}
            </p>
          </div>
          <a
            href={profile.social.medium}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-sans text-sm text-ink/70 hover:text-brush transition-colors"
          >
            @aleynaaltunsu <ExternalLink size={15} />
          </a>
        </header>

        {loading ? (
          <div className="flex flex-col divide-y divide-ink/10 border-t border-b border-ink/10">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="py-7 md:py-8 animate-pulse">
                <div className="h-3 w-16 bg-ink/10 rounded mb-4" />
                <div className="h-6 w-2/3 bg-ink/10 rounded mb-3" />
                <div className="h-4 w-full max-w-xl bg-ink/10 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-ink/10 border-t border-b border-ink/10">
            {articles.map((w, i) => (
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
                <span className="font-mono text-xs text-umber order-1 md:order-none whitespace-nowrap">
                  {w.date}
                </span>

                <div className="order-3 md:order-none">
                  <h3 className="font-display text-xl md:text-2xl leading-snug group-hover:text-brush transition-colors">
                    {w.title}
                  </h3>
                  <p className="mt-2 font-sans text-sm text-ink/60 leading-relaxed max-w-xl">
                    {w.excerpt}
                  </p>
                  <div className="mt-3 flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-[11px] px-2 py-1 rounded-full border border-ink/15 text-ink/60">
                      {w.tag}
                    </span>
                    <span className="font-mono text-[11px] text-ink/40">
                      {w.readTime} okuma
                    </span>
                  </div>
                </div>

                <ArrowUpRight
                  size={20}
                  className="order-2 md:order-none justify-self-end text-ink/30 group-hover:text-brush group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                />
              </motion.a>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <a
            href={profile.social.medium}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 border border-ink/15 rounded-full font-sans text-sm text-ink/70 hover:text-brush hover:border-brush/40 transition-colors"
          >
            Medium profilinde tüm yazıları gör
            <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
