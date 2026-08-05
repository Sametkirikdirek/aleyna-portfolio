import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, Maximize2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import PaintingCanvas from "./PaintingCanvas";
import { useGallery } from "../hooks/useContent";

// Fisher-Yates shuffle
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ─── 3D Tilt Card ──────────────────────────────────────────
function TiltCard({ children, className = "", onClick }) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState("");
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    setTransform(`perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`);
    setGlarePos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTransform("perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)");
    setIsHovering(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  return (
    <div
      ref={cardRef}
      className={className}
      style={{
        transform,
        transition: isHovering ? "transform 0.1s ease-out" : "transform 0.5s ease-out",
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
    >
      {children}
      {/* Glare overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl z-20 transition-opacity duration-300"
        style={{
          opacity: isHovering ? 0.15 : 0,
          background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.6) 0%, transparent 60%)`,
        }}
      />
    </div>
  );
}

// ─── Kategori Filtreleme Sekmeleri ──────────────────────────
function FilterTabs({ categories, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`
            font-mono text-xs tracking-wide px-4 py-2 rounded-full border transition-all duration-300 cursor-pointer
            ${active === cat
              ? "bg-brush-soft/20 text-brush-soft border-brush-soft/50 shadow-[0_0_14px_rgba(217,112,79,0.2)]"
              : "bg-paper/5 text-paper/60 border-paper/12 hover:text-paper hover:border-paper/30 hover:bg-paper/8"
            }
          `}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

// ─── Masonry Layout Hesaplama ───────────────────────────────
// Her esere sabit veya yarı-rastgele yükseklik atayarak masonry hissi veriyoruz
function getMasonrySpan(index) {
  const pattern = [2, 1, 1, 2, 1, 2, 1, 1, 2, 1]; // tall/normal pattern
  return pattern[index % pattern.length] === 2 ? "tall" : "normal";
}

// ─── Ana Galeri Bileşeni ────────────────────────────────────
export default function Gallery() {
  const { data: galleryData } = useGallery();
  const artworks = galleryData?.artworks || [];
  const [activeIdx, setActiveIdx] = useState(null);
  const [items, setItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState("Tümü");
  const [imagesLoaded, setImagesLoaded] = useState({});

  useEffect(() => {
    if (artworks.length > 0 && items.length === 0) {
      setItems(shuffleArray(artworks));
    }
  }, [artworks]);

  // Eşsiz kategoriler
  const categories = useMemo(() => {
    const meds = new Set(artworks.map((a) => a.medium).filter(Boolean));
    return ["Tümü", ...Array.from(meds)];
  }, [artworks]);

  // Filtreleme
  const filteredItems = useMemo(() => {
    if (activeFilter === "Tümü") return items;
    return items.filter((item) => item.medium === activeFilter);
  }, [items, activeFilter]);

  const handleShuffle = () => {
    setItems(shuffleArray(artworks));
  };

  const active = activeIdx !== null ? filteredItems[activeIdx] : null;

  const goNext = () => {
    if (activeIdx !== null && activeIdx < filteredItems.length - 1) {
      setActiveIdx(activeIdx + 1);
    }
  };

  const goPrev = () => {
    if (activeIdx !== null && activeIdx > 0) {
      setActiveIdx(activeIdx - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (activeIdx === null) return;
    const handler = (e) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Escape") setActiveIdx(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeIdx, filteredItems.length]);

  const handleImageLoad = (id) => {
    setImagesLoaded((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <section className="min-h-screen px-4 sm:px-6 md:px-10 pt-28 pb-24 md:pt-32 md:pb-32 bg-ink">
      <div className="max-w-7xl mx-auto">
        {/* ─── Header ─── */}
        <header className="mb-10 md:mb-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="font-mono text-xs tracking-[0.25em] uppercase text-brush-soft mb-4"
              >
                Galeri & Seçkiler
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-display text-3xl md:text-5xl lg:text-6xl text-paper leading-tight text-balance"
              >
                Tuval ve Kodun <br className="hidden sm:block" />
                <span className="text-gradient-animated">Kesişimi</span>
              </motion.h2>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-start md:items-end gap-3"
            >
              <p className="font-sans text-sm text-paper/50 max-w-xs md:text-right">
                Esere dokunarak hikâyesini inceleyin.<br className="hidden sm:block" />
                Ok tuşlarıyla eserler arasında gezinin.
              </p>
              <button
                onClick={handleShuffle}
                className="group inline-flex items-center gap-2 font-mono text-xs text-brush-soft hover:text-paper transition-all py-2 px-4 rounded-full border border-paper/15 bg-paper/5 hover:bg-paper/10 hover:border-brush-soft/50 shadow-sm cursor-pointer"
                title="Sergiyi Karıştır"
              >
                <RefreshCw size={13} className="group-hover:rotate-180 transition-transform duration-500" />
                Sergiyi Karıştır
              </button>
            </motion.div>
          </div>

          {/* ─── Filter Tabs ─── */}
          {categories.length > 2 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <FilterTabs
                categories={categories}
                active={activeFilter}
                onChange={setActiveFilter}
              />
            </motion.div>
          )}
        </header>

        {/* ─── Masonry Grid ─── */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-5 space-y-4 md:space-y-5">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((p, i) => {
              const span = getMasonrySpan(i);
              const aspectClass = span === "tall" ? "aspect-[3/4.5]" : "aspect-[4/3.5]";

              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.45, delay: (i % 6) * 0.05 }}
                  className="break-inside-avoid"
                >
                  <TiltCard
                    className={`group relative ${aspectClass} rounded-xl overflow-hidden text-left bg-ink-soft border border-paper/10 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-brush/10 hover:border-brush-soft/40 transition-shadow duration-500`}
                    onClick={() => setActiveIdx(i)}
                  >
                    {/* Eser Görseli */}
                    {p.image && (
                      <>
                        {/* Skeleton placeholder */}
                        {!imagesLoaded[p.id] && (
                          <div className="absolute inset-0 bg-ink-soft animate-pulse z-0" />
                        )}
                        <img
                          src={p.image}
                          alt={p.title}
                          loading="lazy"
                          onLoad={() => handleImageLoad(p.id)}
                          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.06] ${
                            imagesLoaded[p.id] ? "opacity-100" : "opacity-0"
                          }`}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </>
                    )}

                    {/* Generative Canvas Yedeği */}
                    <PaintingCanvas
                      seed={p.seed}
                      palette={p.palette}
                      className="absolute inset-0 -z-10 w-full h-full"
                    />

                    {/* Üst Rozet (Yıl) */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="font-mono text-[11px] px-2.5 py-1 rounded-full backdrop-blur-md bg-ink/70 text-brush-soft border border-paper/12 shadow-sm">
                        {p.year}
                      </span>
                    </div>

                    {/* İnceleme İkonu */}
                    <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="p-2 rounded-full backdrop-blur-md bg-ink/75 text-paper border border-paper/15 inline-flex items-center justify-center shadow-lg">
                        <Maximize2 size={13} />
                      </span>
                    </div>

                    {/* Animasyonlu Çerçeve Glow */}
                    <div
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
                      style={{
                        boxShadow: "inset 0 0 30px rgba(217,112,79,0.15), inset 0 0 60px rgba(107,163,166,0.08)",
                      }}
                    />

                    {/* Alt Bilgi Alanı */}
                    <div className="absolute inset-x-0 bottom-0 p-3.5 pt-12 bg-gradient-to-t from-ink via-ink/85 to-transparent z-10">
                      <div className="backdrop-blur-md bg-ink/80 border border-paper/10 rounded-lg p-3 transition-all duration-300 group-hover:border-brush-soft/40 group-hover:bg-ink/90 group-hover:shadow-[0_0_20px_rgba(217,112,79,0.08)]">
                        <h3 className="font-display text-base sm:text-lg text-paper font-semibold leading-snug group-hover:text-brush-soft transition-colors duration-300">
                          {p.title}
                        </h3>
                        <p className="font-mono text-[11px] text-paper/55 mt-1 flex items-center justify-between">
                          <span className="truncate mr-2">{p.medium}</span>
                          {p.size && (
                            <span className="text-[10px] text-circuit-soft shrink-0">{p.size}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Boş durum */}
        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <Sparkles size={32} className="text-brush-soft/50 mx-auto mb-4" />
            <p className="font-sans text-paper/50 text-sm">
              Bu kategoride henüz eser bulunmuyor.
            </p>
          </div>
        )}
      </div>

      {/* ─── Immersive Lightbox ─── */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-ink/97 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
            onClick={() => setActiveIdx(null)}
          >
            {/* Navigation Arrows */}
            {activeIdx > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-[70] p-3 rounded-full bg-paper/10 hover:bg-paper/20 text-paper border border-paper/15 backdrop-blur-md transition-all hover:scale-110 cursor-pointer shadow-lg"
                aria-label="Önceki Eser"
              >
                <ChevronLeft size={22} />
              </button>
            )}
            {activeIdx < filteredItems.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-[70] p-3 rounded-full bg-paper/10 hover:bg-paper/20 text-paper border border-paper/15 backdrop-blur-md transition-all hover:scale-110 cursor-pointer shadow-lg"
                aria-label="Sonraki Eser"
              >
                <ChevronRight size={22} />
              </button>
            )}

            {/* Counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[70] font-mono text-xs text-paper/40">
              {activeIdx + 1} / {filteredItems.length}
            </div>

            <motion.div
              key={active.id}
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.35, type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl w-full grid md:grid-cols-[1.2fr_0.8fr] gap-0 bg-ink-soft rounded-2xl overflow-hidden border border-paper/12 shadow-[0_25px_70px_rgba(0,0,0,0.5)]"
            >
              {/* Sol Taraf: Görsel */}
              <div className="relative aspect-square md:aspect-auto md:min-h-[400px] md:max-h-[75vh] overflow-hidden bg-ink">
                {active.image ? (
                  <img
                    src={active.image}
                    alt={active.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <PaintingCanvas seed={active.seed} palette={active.palette} className="w-full h-full" />
                )}
                {/* Subtle glow at bottom edge */}
                <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-ink-soft to-transparent" />
              </div>

              {/* Sağ Taraf: Bilgiler */}
              <div className="p-6 md:p-8 relative flex flex-col justify-between overflow-y-auto max-h-[75vh]">
                <div>
                  <button
                    onClick={() => setActiveIdx(null)}
                    className="absolute top-4 right-4 text-paper/50 hover:text-paper p-2 rounded-full hover:bg-paper/10 transition-all cursor-pointer"
                    aria-label="Kapat"
                  >
                    <X size={20} />
                  </button>

                  <p className="font-mono text-xs tracking-[0.2em] uppercase text-brush-soft mb-3">
                    {active.year} · Seçki
                  </p>
                  <h3 className="font-display text-2xl md:text-3xl text-paper font-bold leading-tight pr-8">
                    {active.title}
                  </h3>

                  {active.note && (
                    <p className="mt-5 font-sans text-sm text-paper/70 leading-relaxed">
                      {active.note}
                    </p>
                  )}
                </div>

                <dl className="mt-8 space-y-3 font-mono text-xs border-t border-paper/10 pt-5 text-paper/60">
                  {active.medium && (
                    <div className="flex justify-between items-center border-b border-paper/8 pb-2.5">
                      <dt className="text-paper/40">Teknik & Stil</dt>
                      <dd className="text-paper/85 font-medium text-right">{active.medium}</dd>
                    </div>
                  )}
                  {active.size && (
                    <div className="flex justify-between items-center">
                      <dt className="text-paper/40">Boyut / Ölçü</dt>
                      <dd className="text-paper/85 font-medium">{active.size}</dd>
                    </div>
                  )}
                </dl>

                {/* Eser arası navigasyon alt kısmı */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-paper/8">
                  <button
                    onClick={goPrev}
                    disabled={activeIdx === 0}
                    className="font-mono text-xs text-paper/50 hover:text-paper disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <ChevronLeft size={14} /> Önceki
                  </button>
                  <span className="font-mono text-[10px] text-paper/30">
                    {activeIdx + 1} / {filteredItems.length}
                  </span>
                  <button
                    onClick={goNext}
                    disabled={activeIdx === filteredItems.length - 1}
                    className="font-mono text-xs text-paper/50 hover:text-paper disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    Sonraki <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
