import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { writings as fallbackWritings, profile } from "../data/content";

const FEED_SOURCES = ["/medium-posts.json", "/api/medium"];

async function fetchWithTimeout(url, ms = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data.posts) || data.posts.length === 0) {
      throw new Error("Empty feed");
    }
    return data.posts;
  } finally {
    clearTimeout(timeout);
  }
}

async function loadMediumArticles() {
  for (const source of FEED_SOURCES) {
    try {
      return await fetchWithTimeout(source);
    } catch {
      // try next source
    }
  }
  return fallbackWritings;
}

export default function Writings() {
  const [articles, setArticles] = useState(fallbackWritings);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadMediumArticles().then((posts) => {
      if (!cancelled) {
        setArticles(posts);
        setReady(true);
      }
    });

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
              @aleynaaltunsu profilindeki tüm yazılar. Bir başlığa tıklayınca
              Medium'daki asıl yazıya gidersin.
            </p>
          </div>
          <a
            href={profile.social.medium}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-sans text-sm text-ink/70 hover:text-brush transition-colors"
          >
            Medium profili <ExternalLink size={15} />
          </a>
        </header>

        {!ready ? (
          <p className="font-mono text-xs text-ink/40 mb-6">Yazılar yükleniyor…</p>
        ) : (
          <p className="font-mono text-xs text-ink/40 mb-6">
            {articles.length} yazı listeleniyor
          </p>
        )}

        <div className="flex flex-col divide-y divide-ink/10 border-t border-b border-ink/10">
          {articles.map((w, i) => (
            <motion.a
              key={w.id}
              href={w.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: ready ? 1 : 0.6, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.4) }}
              className="group py-7 md:py-8 grid md:grid-cols-[auto_1fr_auto] gap-2 md:gap-8 items-baseline md:items-start hover:bg-ink/[0.02] -mx-2 px-2 rounded-lg transition-colors"
            >
              <span className="font-mono text-xs text-umber order-1 md:order-none whitespace-nowrap">
                {w.date}
              </span>

              <div className="order-3 md:order-none">
                <h3 className="font-display text-xl md:text-2xl leading-snug group-hover:text-brush transition-colors">
                  {w.title}
                </h3>
                {w.excerpt && (
                  <p className="mt-2 font-sans text-sm text-ink/60 leading-relaxed max-w-xl">
                    {w.excerpt}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-[11px] px-2 py-1 rounded-full border border-ink/15 text-ink/60">
                    {w.tag}
                  </span>
                  {w.readTime && (
                    <span className="font-mono text-[11px] text-ink/40">
                      {w.readTime} okuma
                    </span>
                  )}
                </div>
              </div>

              <ArrowUpRight
                size={20}
                className="order-2 md:order-none justify-self-end text-ink/30 group-hover:text-brush group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
              />
            </motion.a>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href={profile.social.medium}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 border border-ink/15 rounded-full font-sans text-sm text-ink/70 hover:text-brush hover:border-brush/40 transition-colors"
          >
            Medium'da tüm yazıları gör
            <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
