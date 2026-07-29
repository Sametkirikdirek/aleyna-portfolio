import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ExternalLink, Feather, BookOpen } from "lucide-react";
import {
  mediumWritingsFallback,
  personalWritings,
  profile,
} from "../data/content";

const FEED_SOURCES = ["/medium-posts.json", "/api/medium"];

const TABS = [
  { id: "medium", label: "Medium", icon: BookOpen },
  { id: "personal", label: "Kendi Yazılarım", icon: Feather },
];

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
  return mediumWritingsFallback;
}

function ArticleList({ articles, ready, external = true }) {
  if (articles.length === 0) {
    return (
      <p className="py-12 text-center font-sans text-sm text-ink/50">
        Henüz yazı eklenmemiş.
      </p>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-ink/10 border-t border-b border-ink/10">
      {articles.map((w, i) => {
        const className =
          "group py-7 md:py-8 grid md:grid-cols-[auto_1fr_auto] gap-2 md:gap-8 items-baseline md:items-start hover:bg-ink/[0.02] -mx-2 px-2 rounded-lg transition-colors";

        const content = (
          <>
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

            {external && w.url && (
              <ArrowUpRight
                size={20}
                className="order-2 md:order-none justify-self-end text-ink/30 group-hover:text-brush group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
              />
            )}
          </>
        );

        if (external && w.url) {
          return (
            <motion.a
              key={w.id}
              href={w.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: ready ? 1 : 0.6, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.4) }}
              className={className}
            >
              {content}
            </motion.a>
          );
        }

        return (
          <motion.article
            key={w.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.4) }}
            className={className}
          >
            {content}
          </motion.article>
        );
      })}
    </div>
  );
}

export default function Writings() {
  const [activeTab, setActiveTab] = useState("medium");
  const [mediumArticles, setMediumArticles] = useState(mediumWritingsFallback);
  const [mediumReady, setMediumReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadMediumArticles().then((posts) => {
      if (!cancelled) {
        setMediumArticles(posts);
        setMediumReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="min-h-screen px-6 md:px-10 pt-28 pb-24 md:pt-32 md:pb-32 bg-paper text-ink">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 md:mb-12">
          <p className="font-mono text-xs tracking-[0.25em] uppercase text-umber mb-4">
            Yazılar
          </p>
          <h2 className="font-display text-3xl md:text-5xl leading-tight text-balance">
            Kelimelerle şekillenen düşünceler
          </h2>
          <p className="mt-4 font-sans text-sm text-ink/55 max-w-xl">
            Medium'daki teknik yazılar ve atölyeden kişisel notlar — iki ayrı
            çizgi, aynı elden.
          </p>
        </header>

        {/* Sekmeler */}
        <div
          className="mb-8 flex flex-wrap gap-2 border-b border-ink/10 pb-4"
          role="tablist"
          aria-label="Yazı kategorileri"
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => setActiveTab(id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-sans text-sm transition-colors ${
                activeTab === id
                  ? "bg-brush text-paper"
                  : "text-ink/60 hover:text-ink hover:bg-ink/5"
              }`}
            >
              <Icon size={16} />
              {label}
              <span
                className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === id ? "bg-paper/20 text-paper" : "bg-ink/8 text-ink/50"
                }`}
              >
                {id === "medium" ? mediumArticles.length : personalWritings.length}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "medium" ? (
            <motion.div
              key="medium"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              role="tabpanel"
            >
              <div className="mb-6 flex items-end justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-display text-xl md:text-2xl text-ink">
                    Medium yazıları
                  </h3>
                  <p className="mt-1 font-sans text-sm text-ink/55">
                    {!mediumReady
                      ? "Medium'dan yükleniyor…"
                      : `${mediumArticles.length} yazı — tıklayınca Medium'da açılır`}
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
              </div>

              <ArticleList
                articles={mediumArticles}
                ready={mediumReady}
                external
              />

              <div className="mt-8 text-center">
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
            </motion.div>
          ) : (
            <motion.div
              key="personal"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              role="tabpanel"
            >
              <div className="mb-6">
                <h3 className="font-display text-xl md:text-2xl text-ink">
                  Kendi yazılarım
                </h3>
                <p className="mt-1 font-sans text-sm text-ink/55">
                  Atölyeden, defterden — Medium dışında kalan kişisel notlar ve
                  düşünceler.
                </p>
              </div>

              <ArticleList
                articles={personalWritings}
                ready
                external={false}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
