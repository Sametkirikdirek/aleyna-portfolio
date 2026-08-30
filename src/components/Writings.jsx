import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight, Feather, BookOpen, X, ArrowRight, BookMarked, ExternalLink, Library, User,
} from "lucide-react";
import { mediumWritingsFallback } from "../data/content";
import { useWritings, useProfile } from "../hooks/useContent";

const FEED_SOURCES = ["/medium-posts.json", "/api/medium"];

const TABS = [
  { id: "medium", label: "Medium", icon: BookOpen },
  { id: "personal", label: "Yazılarım", icon: Feather },
  { id: "library", label: "Kütüphane", icon: Library },
];

function formatRssItem(item, idx) {
  // Clean HTML tags for excerpt
  const textContent = item.description?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || "";
  const excerpt = textContent.slice(0, 180) + (textContent.length > 180 ? "..." : "");

  // Extract cover image
  const imgMatch = item.description?.match(/<img[^>]+src="([^">]+)"/);
  const image = item.thumbnail || (imgMatch ? imgMatch[1] : "");

  // Format date: "2026-04-12 14:00" -> "Nis 2026"
  let formattedDate = "";
  try {
    const d = new Date(item.pubDate);
    const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
    formattedDate = `${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    formattedDate = item.pubDate || "";
  }

  // Calculate estimated read time
  const wordCount = textContent.split(/\s+/).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return {
    id: `m-live-${idx}`,
    title: item.title,
    excerpt: excerpt,
    content: item.content || item.description || "",
    date: formattedDate,
    readTime: `${readTimeMinutes} dk`,
    tag: item.categories && item.categories.length > 0 ? item.categories[0].toUpperCase() : "MEDIUM",
    url: item.link,
    image: image,
  };
}

async function loadMediumArticles(mediumUrl = "https://medium.com/@aleynaaltunsu") {
  // Extract handle: "@aleynaaltunsu"
  const handleMatch = mediumUrl.match(/@([\w.-]+)/);
  const handle = handleMatch ? `@${handleMatch[1]}` : "@aleynaaltunsu";

  // 1. Live RSS to JSON
  try {
    const rssUrl = encodeURIComponent(`https://medium.com/feed/${handle}`);
    const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`);
    if (res.ok) {
      const data = await res.json();
      if (data.status === "ok" && Array.isArray(data.items) && data.items.length > 0) {
        return data.items.map(formatRssItem);
      }
    }
  } catch (err) {
    console.warn("Medium RSS live fetch error, falling back to local sources:", err);
  }

  // 2. Local fallback sources
  for (const source of FEED_SOURCES) {
    try {
      return await fetchWithTimeout(source);
    } catch {
      // try next source
    }
  }
  return mediumWritingsFallback;
}

/** Pop-up Detay Modalı (Açılış & Kapanış Animasyonlu + Blur Fade + Tam Okuma Yönlendirmesi) */
function WritingModal({ article, onClose }) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!article) return null;

  const fullText = article.content || article.excerpt || "";
  const isLongText = fullText.length > 250;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
      {/* Arka Plan Karartması */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Pop-Up Penceresi */}
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 14 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className="relative w-full max-w-2xl md:max-w-3xl max-h-[82vh] overflow-hidden bg-[#fdfbf7] dark:bg-ink-soft text-paper rounded-3xl p-6 md:p-10 shadow-2xl border dark:border-paper/15 border-amber-900/20 z-10 my-auto flex flex-col"
      >
        {/* Üst Bilgiler & Kapat Butonu */}
        <div className="flex items-center justify-between gap-4 mb-5 shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            {article.tag && (
              <span className="font-mono text-xs uppercase tracking-widest px-3 py-1 rounded-full dark:bg-paper/10 bg-amber-900/10 dark:text-umber text-amber-900 font-bold">
                {article.tag}
              </span>
            )}
            {article.date && (
              <span className="font-mono text-xs text-paper/60 font-medium">
                {article.date}
              </span>
            )}
            {article.readTime && (
              <span className="font-mono text-xs text-paper/60 font-medium">
                • {article.readTime} okuma
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full dark:bg-paper/10 bg-black/5 hover:bg-black/10 dark:hover:bg-paper/20 flex items-center justify-center text-paper/70 hover:text-paper transition-colors cursor-pointer shrink-0"
            aria-label="Kapat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Yazı Başlığı */}
        <h2 className="font-display text-2xl md:text-3xl text-paper font-bold leading-snug tracking-tight mb-4 shrink-0">
          {article.title}
        </h2>

        {/* Önizleme Metni & Bulanıklık Katmanı */}
        <div className="relative flex-1 overflow-hidden border-t dark:border-paper/10 border-amber-900/10 pt-4">
          <div className="text-paper/85 font-sans text-sm md:text-base leading-relaxed whitespace-pre-line space-y-4 pb-20">
            {fullText}
          </div>

          {/* Blur Fade Effect & "Yazıyı Okumaya Devam Et" Button */}
          {isLongText && (
            <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t dark:from-ink-soft from-[#fdfbf7] via-[#fdfbf7]/95 dark:via-ink-soft/95 to-transparent flex items-end justify-center pb-3 pt-12">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  onClose();
                  navigate(`/writings/${article.id}`);
                }}
                className="group flex items-center gap-2 px-6 py-3 rounded-full bg-brush text-white font-sans text-sm font-semibold shadow-xl hover:shadow-2xl hover:bg-brush-soft transition-all duration-300 cursor-pointer border border-white/20"
              >
                Yazıyı Okumaya Devam Et
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function ArticleList({ articles, external = true, onSelectArticle }) {
  if (articles.length === 0) {
    return (
      <p className="py-12 text-center font-sans text-sm text-paper/50 font-medium">
        Henüz yazı eklenmemiş.
      </p>
    );
  }

  return (
    <div className="flex flex-col divide-y dark:divide-paper/10 divide-amber-900/10 border-t border-b dark:border-paper/10 border-amber-900/10">
      {articles.map((w, i) => {
        const className =
          "group py-7 md:py-8 grid md:grid-cols-[auto_1fr_auto] gap-2 md:gap-8 items-baseline md:items-start hover:bg-amber-900/[0.03] dark:hover:bg-paper/[0.03] -mx-2 px-3 rounded-xl transition-colors cursor-pointer";

        const content = (
          <>
            <span className="font-mono text-xs text-amber-900 dark:text-umber font-bold order-1 md:order-none whitespace-nowrap">
              {w.date}
            </span>

            <div className="order-2 md:order-none space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-sans font-semibold text-lg md:text-xl text-paper group-hover:text-brush transition-colors">
                  {w.title}
                </h3>
                {w.tag && (
                  <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full dark:bg-paper/10 bg-amber-900/10 dark:text-paper/80 text-amber-900 font-bold">
                    {w.tag}
                  </span>
                )}
              </div>
              <p className="font-sans text-sm text-paper/75 leading-relaxed line-clamp-2">
                {w.excerpt}
              </p>
            </div>

            <div className="order-3 md:order-none flex items-center gap-3 shrink-0 self-center md:self-start">
              {w.readTime && (
                <span className="font-mono text-xs text-paper/50 font-medium">
                  {w.readTime}
                </span>
              )}
              {external ? (
                <ArrowUpRight
                  size={18}
                  className="text-ink/40 group-hover:text-ink group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                />
              ) : (
                <span className="font-sans text-xs text-brush dark:text-brush-soft font-medium group-hover:underline flex items-center gap-1">
                  Oku <BookMarked size={14} />
                </span>
              )}
            </div>
          </>
        );

        if (w.url) {
          return (
            <motion.a
              key={w.id || i}
              href={w.url}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {content}
            </motion.a>
          );
        }

        return (
          <motion.article
            key={w.id || i}
            onClick={() => onSelectArticle && onSelectArticle(w)}
            className={className}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            {content}
          </motion.article>
        );
      })}
    </div>
  );
}

export default function Writings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: writingsData } = useWritings();
  const { data: profile } = useProfile();
  const personalWritings = writingsData?.personalWritings || [];
  const mediumUrl = profile?.social?.medium || "https://medium.com/@aleynaaltunsu";

  const initialTab = searchParams.get("tab") || "medium";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [mediumArticles, setMediumArticles] = useState(mediumWritingsFallback);
  const [mediumReady, setMediumReady] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    const requestedTab = searchParams.get("tab");
    if (requestedTab) {
      setActiveTab(requestedTab);
    }
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    loadMediumArticles(mediumUrl).then((posts) => {
      if (!cancelled) {
        setMediumArticles(posts);
        setMediumReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [mediumUrl]);

  return (
    <section className="min-h-screen px-6 md:px-10 pt-28 pb-24 md:pt-32 md:pb-32 bg-ink text-paper">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 md:mb-12">
          <p className="font-mono text-xs tracking-[0.25em] uppercase text-amber-900 dark:text-umber font-bold mb-4">
            {writingsData?.tag || "Yazılar"}
          </p>
          <h2 className="font-display text-3xl md:text-5xl leading-tight text-balance text-paper font-bold">
            {writingsData?.title || "Kelimelerle şekillenen düşünceler"}
          </h2>
          <p className="mt-4 font-sans text-sm text-paper/70 max-w-xl font-medium">
            {writingsData?.subtitle ||
              "Medium'daki teknik yazılar ve atölyeden kişisel notlar — iki ayrı çizgi, aynı elden."}
          </p>
        </header>

        {/* Sekmeler */}
        <div
          className="mb-8 flex flex-wrap gap-2 border-b dark:border-paper/10 border-amber-900/15 pb-4"
          role="tablist"
          aria-label="Yazı kategorileri"
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => setActiveTab(id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-sans text-sm transition-colors cursor-pointer ${
                activeTab === id
                  ? "bg-brush text-white font-semibold shadow-md"
                  : "text-paper/75 dark:bg-paper/5 bg-[#fdfbf7]/80 dark:border-paper/10 border-amber-900/15 border hover:bg-white hover:text-paper"
              }`}
            >
              <Icon size={16} />
              {label}
              <span
                className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === id ? "bg-white/20 text-white" : "bg-black/5 dark:bg-paper/10 text-paper/60"
                }`}
              >
                {id === "medium" ? mediumArticles.length : personalWritings.length}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "medium" && (
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
                  <h3 className="font-display text-xl md:text-2xl text-paper font-bold">
                    Medium yazıları
                  </h3>
                  <p className="mt-1 font-sans text-sm text-paper/65 font-medium">
                    {!mediumReady
                      ? "Medium'dan yükleniyor…"
                      : `${mediumArticles.length} yazı — tıklayınca Medium'da açılır`}
                  </p>
                </div>
                <a
                  href={mediumUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-sans text-sm text-paper/75 hover:text-brush transition-colors font-semibold"
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
                  href={mediumUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 border dark:border-paper/15 border-amber-900/20 rounded-full font-sans text-sm text-paper/80 hover:text-brush hover:border-brush/40 bg-[#fdfbf7]/80 dark:bg-paper/5 transition-all shadow-xs"
                >
                  Medium profilinde tüm yazıları gör
                  <ArrowUpRight size={16} />
                </a>
              </div>
            </motion.div>
          )}

          {activeTab === "personal" && (
            <motion.div
              key="personal"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              role="tabpanel"
            >
              <div className="mb-6">
                <h3 className="font-display text-xl md:text-2xl text-paper font-bold">
                  Yazılarım
                </h3>
                <p className="mt-1 font-sans text-sm text-paper/65 font-medium">
                  Atölyeden, defterden — Medium dışında kalan kişisel notlar ve düşünceler. Yazılara tıklayarak detayını okuyabilirsiniz.
                </p>
              </div>

              <ArticleList
                articles={personalWritings}
                external={false}
                onSelectArticle={(article) => setSelectedArticle(article)}
              />
            </motion.div>
          )}

          {activeTab === "library" && (
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              role="tabpanel"
            >
              <div className="mb-6">
                <h3 className="font-display text-xl md:text-2xl text-paper font-bold">
                  Kütüphane
                </h3>
                <p className="mt-1 font-sans text-sm text-paper/65 font-medium">
                  Kapak fotoğrafları, yazar künyesi ve konu özetleri ile tüm kişisel yazılar kütüphanesi.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {personalWritings.map((w, i) => (
                  <motion.article
                    key={w.id || i}
                    onClick={() => navigate(`/writings/${w.id}`)}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group dark:bg-ink-soft/80 bg-[#fdfbf7]/90 border dark:border-paper/10 border-amber-900/15 rounded-2xl p-5 flex flex-col justify-between hover:border-brush/40 hover:shadow-xl transition-all duration-300 cursor-pointer shadow-md"
                  >
                    <div>
                      {/* Kapak Görseli */}
                      <div className="w-full h-44 rounded-xl overflow-hidden mb-4 bg-ink/5 border border-amber-900/10 relative">
                        {w.image ? (
                          <img
                            src={w.image}
                            alt={w.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-paper/40 bg-amber-900/[0.04]">
                            <BookMarked size={28} />
                            <span className="font-mono text-xs mt-1">Aleyna Altunsu</span>
                          </div>
                        )}
                        {w.tag && (
                          <span className="absolute top-2.5 left-2.5 font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-bold">
                            {w.tag}
                          </span>
                        )}
                      </div>

                      <h4 className="font-sans font-bold text-base md:text-lg text-paper group-hover:text-brush transition-colors leading-snug mb-2">
                        {w.title}
                      </h4>

                      <p className="font-sans text-xs text-paper/75 line-clamp-3 leading-relaxed mb-4 font-normal">
                        {w.excerpt}
                      </p>
                    </div>

                    {/* Alt Künye */}
                    <div className="pt-3 border-t dark:border-paper/8 border-amber-900/10 flex items-center justify-between font-mono text-[11px] text-paper/60 font-medium">
                      <span className="flex items-center gap-1">
                        <User size={12} /> {profile?.name || "Aleyna Altunsu"}
                      </span>
                      <span>{w.readTime || "4 dk"}</span>
                    </div>
                  </motion.article>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pop-Up Yazı Detayı Modalı */}
      <AnimatePresence>
        {selectedArticle && (
          <WritingModal
            article={selectedArticle}
            onClose={() => setSelectedArticle(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
