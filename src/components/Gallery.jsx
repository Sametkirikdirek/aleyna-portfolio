import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, RefreshCw, Maximize2, ChevronLeft, ChevronRight, Sparkles,
  Search, SlidersHorizontal, ChevronDown, ChevronUp, Layers, Grid, History
} from "lucide-react";
import PaintingCanvas from "./PaintingCanvas";
import { useGallery, useTimeline } from "../hooks/useContent";
import InfiniteGallery from "./ui/infinite-gallery";

// Fisher-Yates shuffle
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ─── 3D Tilt Card ───────────────────────────────────────────
function TiltCard({ children, className = "", onClick, style }) {
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
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    setTransform(`perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
    setGlarePos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTransform("");
    setIsHovering(false);
  }, []);

  return (
    <div
      ref={cardRef}
      className={className}
      style={{
        ...style,
        transform: transform || undefined,
        transition: isHovering ? "transform 0.1s ease-out" : "transform 0.45s ease-out",
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovering(true)}
      onClick={onClick}
    >
      {children}
      {/* Glare */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl z-20"
        style={{
          opacity: isHovering ? 0.12 : 0,
          transition: "opacity 0.3s",
          background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.55) 0%, transparent 55%)`,
        }}
      />
    </div>
  );
}

// ─── Ana Galeri ─────────────────────────────────────────────
export default function Gallery() {
  const { data: galleryData } = useGallery();
  const { data: timelineData } = useTimeline();

  const artworks = galleryData?.artworks || [];
  const timelineImagesList = timelineData?.images || [];

  const [activeTab, setActiveTab] = useState("galeri"); // "galeri" | "zaman-yolculugu"
  const [activeIdx, setActiveIdx] = useState(null);
  const [items, setItems] = useState([]);

  // Accordion Filter State
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Tümü");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");

  // Sync items state whenever Firestore/localStorage artworks updates
  useEffect(() => {
    if (artworks && artworks.length > 0) {
      setItems(artworks);
    }
  }, [artworks]);

  const categories = useMemo(() => {
    const meds = new Set(artworks.map((a) => a.medium).filter(Boolean));
    return ["Tümü", ...Array.from(meds)];
  }, [artworks]);

  // Filter & Sort Pipeline
  const processedItems = useMemo(() => {
    let list = [...items];

    if (activeFilter !== "Tümü") {
      list = list.filter((item) => item.medium === activeFilter);
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          (item.title && item.title.toLowerCase().includes(q)) ||
          (item.medium && item.medium.toLowerCase().includes(q)) ||
          (item.year && item.year.toString().includes(q)) ||
          (item.note && item.note.toLowerCase().includes(q))
      );
    }

    if (sortBy === "newest") {
      list.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
    } else if (sortBy === "oldest") {
      list.sort((a, b) => (parseInt(a.year) || 0) - (parseInt(b.year) || 0));
    } else if (sortBy === "random") {
      list = shuffleArray(list);
    }

    return list;
  }, [items, activeFilter, searchQuery, sortBy]);

  const handleShuffle = () => {
    setSortBy("random");
    setItems((prev) => shuffleArray(prev));
  };

  const active = activeIdx !== null ? processedItems[activeIdx] : null;

  const goNext = () => {
    if (activeIdx !== null && activeIdx < processedItems.length - 1) setActiveIdx(activeIdx + 1);
  };
  const goPrev = () => {
    if (activeIdx !== null && activeIdx > 0) setActiveIdx(activeIdx - 1);
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
  }, [activeIdx, processedItems.length]);

  // Format images for Zaman Yolculuğu Infinite Gallery
  const infiniteGalleryImages = useMemo(() => {
    if (timelineImagesList && timelineImagesList.length > 0) {
      return timelineImagesList
        .filter((img) => img.url)
        .map((img, idx) => ({
          src: img.url,
          alt: img.caption || `Zaman Yolculuğu ${idx + 1}`,
        }));
    }
    return [
      { src: "/gallery/zaman_1.png", alt: "Zaman Yolculuğu 1" },
      { src: "/gallery/zaman_2.png", alt: "Zaman Yolculuğu 2" },
      { src: "/gallery/zaman_3.png", alt: "Zaman Yolculuğu 3" },
      { src: "/gallery/zaman_4.png", alt: "Zaman Yolculuğu 4" },
      { src: "/gallery/zaman_5.png", alt: "Zaman Yolculuğu 5" },
      { src: "/gallery/zaman_6.png", alt: "Zaman Yolculuğu 6" },
      { src: "/gallery/zaman_7.png", alt: "Zaman Yolculuğu 7" },
      { src: "/gallery/zaman_8.png", alt: "Zaman Yolculuğu 8" },
      { src: "/gallery/zaman_9.png", alt: "Zaman Yolculuğu 9" },
      { src: "/gallery/zaman_10.png", alt: "Zaman Yolculuğu 10" },
    ];
  }, [timelineImagesList]);

  return (
    <section className="min-h-screen px-4 sm:px-6 md:px-10 pt-28 pb-24 md:pt-32 md:pb-32 bg-ink text-paper">
      <div className="max-w-7xl mx-auto">
        {/* ─── Header & Tab Selector ─── */}
        <header className="mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              {/* Tab Selector Badges */}
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => setActiveTab("galeri")}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-mono text-xs transition-all cursor-pointer ${
                    activeTab === "galeri"
                      ? "bg-rose-600 text-white font-semibold shadow-[0_0_15px_rgba(225,29,72,0.4)]"
                      : "bg-paper/10 text-paper/60 hover:text-paper hover:bg-paper/15 border border-paper/10"
                  }`}
                >
                  <Grid size={13} /> Galeri
                </button>
                <button
                  onClick={() => setActiveTab("zaman-yolculugu")}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-mono text-xs transition-all cursor-pointer ${
                    activeTab === "zaman-yolculugu"
                      ? "bg-rose-600 text-white font-semibold shadow-[0_0_15px_rgba(225,29,72,0.4)]"
                      : "bg-paper/10 text-paper/60 hover:text-paper hover:bg-paper/15 border border-paper/10"
                  }`}
                >
                  <History size={13} /> Zaman Yolculuğu
                </button>
              </div>

              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="font-display text-3xl md:text-5xl lg:text-6xl text-paper leading-tight text-balance"
              >
                {activeTab === "galeri" ? (
                  <>
                    Tuval ve Kodun <br className="hidden sm:block" />
                    <span className="text-gradient-animated">Kesişimi</span>
                  </>
                ) : (
                  <>
                    Zaman Yolculuğu <br className="hidden sm:block" />
                    <span className="text-gradient-animated">Atölye Seçkileri</span>
                  </>
                )}
              </motion.h2>
            </div>

            {activeTab === "galeri" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-start md:items-end gap-3"
              >
                <p className="font-sans text-sm text-paper/50 max-w-xs md:text-right">
                  Esere dokunarak hikâyesini inceleyin.<br className="hidden sm:block" />
                  Ok tuşlarıyla eserler arasında gezinin.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAccordionOpen((prev) => !prev)}
                    className={`group inline-flex items-center gap-2 font-mono text-xs transition-all py-2 px-4 rounded-full border shadow-sm cursor-pointer ${
                      isAccordionOpen || activeFilter !== "Tümü" || searchQuery !== ""
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.25)]"
                        : "bg-paper/5 text-paper/70 border-paper/15 hover:bg-paper/10 hover:border-paper/30"
                    }`}
                  >
                    <SlidersHorizontal size={13} />
                    <span>Filtrele & Ara</span>
                    {activeFilter !== "Tümü" && (
                      <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">1</span>
                    )}
                    {isAccordionOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>

                  <button
                    onClick={handleShuffle}
                    className="group inline-flex items-center gap-2 font-mono text-xs text-brush-soft hover:text-paper transition-all py-2 px-4 rounded-full border border-paper/15 bg-paper/5 hover:bg-paper/10 hover:border-brush-soft/50 shadow-sm cursor-pointer"
                    title="Sergiyi Karıştır"
                  >
                    <RefreshCw size={13} className="group-hover:rotate-180 transition-transform duration-500" />
                    Karıştır
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* ─── Accordion Filter Bar ─── */}
          <AnimatePresence>
            {activeTab === "galeri" && isAccordionOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="overflow-hidden bg-ink-soft/90 border border-paper/12 rounded-2xl p-5 md:p-6 backdrop-blur-md shadow-xl"
              >
                <div className="flex flex-col gap-5">
                  {/* Search & Sort */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="relative flex items-center">
                      <Search size={16} className="absolute left-3.5 text-paper/40 pointer-events-none" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Eser adı, teknik veya yılda ara..."
                        className="w-full bg-paper/5 border border-paper/15 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-paper placeholder:text-paper/40 focus:outline-none focus:border-rose-500/50 transition-colors"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 text-paper/40 hover:text-paper"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-paper/40 shrink-0">Sırala:</span>
                      <div className="flex flex-wrap gap-1.5 flex-1">
                        {[
                          { id: "default", label: "Varsayılan" },
                          { id: "newest", label: "Yeniye Göre" },
                          { id: "oldest", label: "Eskiye Göre" },
                          { id: "random", label: "Rastgele" },
                        ].map((s) => (
                          <button
                            key={s.id}
                            onClick={() => {
                              if (s.id === "random") handleShuffle();
                              else setSortBy(s.id);
                            }}
                            className={`font-mono text-[11px] px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                              sortBy === s.id
                                ? "bg-rose-500/20 text-rose-300 border-rose-500/40 font-semibold"
                                : "bg-paper/5 text-paper/60 border-paper/10 hover:bg-paper/10"
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Technique Categories */}
                  <div>
                    <p className="font-mono text-xs text-paper/40 mb-2.5 flex items-center gap-1.5">
                      <Layers size={13} className="text-brush-soft" /> Teknik & Materyal Filtresi
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setActiveFilter(cat)}
                          className={`
                            font-mono text-xs tracking-wide px-4 py-2 rounded-full border transition-all duration-300 cursor-pointer
                            ${activeFilter === cat
                              ? "bg-rose-600/25 text-rose-300 border-rose-500/50 shadow-[0_0_14px_rgba(244,63,94,0.25)] font-semibold"
                              : "bg-paper/5 text-paper/60 border-paper/12 hover:text-paper hover:border-paper/30 hover:bg-paper/8"
                            }
                          `}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reset Filters */}
                  {(activeFilter !== "Tümü" || searchQuery !== "" || sortBy !== "default") && (
                    <div className="flex justify-end border-t border-paper/10 pt-3">
                      <button
                        onClick={() => {
                          setActiveFilter("Tümü");
                          setSearchQuery("");
                          setSortBy("default");
                        }}
                        className="font-mono text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw size={12} /> Filtreleri Sıfırla
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* ─── TAB 1: Pinterest Masonry Grid (Infinitely Extending Downward) ─── */}
        {activeTab === "galeri" && (
          <div
            className="pinterest-grid"
            style={{
              columns: "1",
              columnGap: "1.25rem",
            }}
          >
            {/* Responsive columns via CSS */}
            <style>{`
              @media (min-width: 640px) {
                .pinterest-grid { columns: 2 !important; column-gap: 1.25rem !important; }
              }
              @media (min-width: 1024px) {
                .pinterest-grid { columns: 3 !important; column-gap: 1.25rem !important; }
              }
              @media (min-width: 1280px) {
                .pinterest-grid { columns: 4 !important; column-gap: 1.25rem !important; }
              }
            `}</style>

            <AnimatePresence mode="popLayout">
              {processedItems.map((p, i) => (
                <motion.div
                  key={p.id || i}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
                  className="break-inside-avoid mb-4 md:mb-5"
                >
                  <TiltCard
                    className="group relative rounded-xl overflow-hidden text-left bg-ink-soft border border-paper/10 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-brush/10 hover:border-brush-soft/40 transition-shadow duration-500"
                    onClick={() => setActiveIdx(i)}
                  >
                    {/* Fotoğraf — Doğal boyutunda (Pinterest intrinsic ratio) */}
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.title}
                        loading="lazy"
                        className="w-full h-auto block transition-transform duration-700 group-hover:scale-[1.04]"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    ) : (
                      <div className="aspect-[4/5] w-full">
                        <PaintingCanvas
                          seed={p.seed}
                          palette={p.palette}
                          className="w-full h-full"
                        />
                      </div>
                    )}

                    {/* Yıl Rozeti */}
                    {p.year && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="font-mono text-[11px] px-2.5 py-1 rounded-full backdrop-blur-md bg-ink/70 text-brush-soft border border-paper/12 shadow-sm">
                          {p.year}
                        </span>
                      </div>
                    )}

                    {/* Büyüt İkonu */}
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

                    {/* Alt Bilgi Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-3 pt-10 bg-gradient-to-t from-ink via-ink/80 to-transparent z-10">
                      <div className="backdrop-blur-md bg-ink/75 border border-paper/10 rounded-lg px-3 py-2.5 transition-all duration-300 group-hover:border-brush-soft/40 group-hover:bg-ink/90">
                        <h3 className="font-display text-sm sm:text-base text-paper font-semibold leading-snug group-hover:text-brush-soft transition-colors duration-300 truncate">
                          {p.title || "İsimsiz Eser"}
                        </h3>
                        {p.medium && (
                          <p className="font-mono text-[10px] text-paper/50 mt-0.5 truncate">
                            {p.medium}
                          </p>
                        )}
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* ─── TAB 2: Zaman Yolculuğu Overlay / 3D Infinite Gallery ─── */}
        {activeTab === "zaman-yolculugu" && (
          <div className="relative w-full h-[70vh] min-h-[500px] rounded-2xl overflow-hidden border border-paper/12 bg-ink-soft/40 shadow-2xl">
            <InfiniteGallery images={infiniteGalleryImages} />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-xs text-paper/50 bg-ink/80 backdrop-blur-md px-4 py-2 rounded-full border border-paper/10 pointer-events-none">
              Mouse tekerleği, yön tuşları veya dokunarak zamanda yolculuk yapın.
            </div>
          </div>
        )}

        {/* Boş durum */}
        {activeTab === "galeri" && processedItems.length === 0 && (
          <div className="text-center py-20 bg-ink-soft/30 rounded-2xl border border-paper/10 mt-6">
            <Sparkles size={32} className="text-brush-soft/50 mx-auto mb-4" />
            <p className="font-sans text-paper/60 text-sm">
              Aradığınız kriterlere uygun eser bulunamadı.
            </p>
            <button
              onClick={() => {
                setActiveFilter("Tümü");
                setSearchQuery("");
                setSortBy("default");
              }}
              className="mt-4 font-mono text-xs text-rose-400 hover:text-rose-300 border border-rose-500/30 px-4 py-2 rounded-lg cursor-pointer inline-flex items-center gap-1.5"
            >
              <RefreshCw size={13} /> Tüm Eserleri Göster
            </button>
          </div>
        )}
      </div>

      {/* ─── Pop-up Lightbox ─── */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-ink/97 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
            onClick={() => setActiveIdx(null)}
          >
            {/* Sol Ok */}
            {activeIdx > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-2 md:left-5 top-1/2 -translate-y-1/2 z-[70] p-3 rounded-full bg-paper/10 hover:bg-paper/20 text-paper border border-paper/15 backdrop-blur-md transition-all hover:scale-110 cursor-pointer shadow-lg"
              >
                <ChevronLeft size={22} />
              </button>
            )}
            {/* Sağ Ok */}
            {activeIdx < processedItems.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-2 md:right-5 top-1/2 -translate-y-1/2 z-[70] p-3 rounded-full bg-paper/10 hover:bg-paper/20 text-paper border border-paper/15 backdrop-blur-md transition-all hover:scale-110 cursor-pointer shadow-lg"
              >
                <ChevronRight size={22} />
              </button>
            )}

            {/* Sayaç */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[70] font-mono text-xs text-paper/40">
              {activeIdx + 1} / {processedItems.length}
            </div>

            {/* Kapat */}
            <button
              onClick={() => setActiveIdx(null)}
              className="absolute top-4 right-4 z-[70] p-2.5 rounded-full bg-paper/10 hover:bg-paper/20 text-paper border border-paper/15 backdrop-blur-md transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* İçerik Kartı */}
            <motion.div
              key={active.id || activeIdx}
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.3, type: "spring", damping: 28, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl bg-ink-soft border border-paper/12 shadow-[0_25px_70px_rgba(0,0,0,0.6)]"
            >
              {/* Görsel — Doğal boyutunda */}
              <div className="relative w-full bg-ink flex items-center justify-center">
                {active.image ? (
                  <img
                    src={active.image}
                    alt={active.title}
                    className="w-full h-auto max-h-[65vh] object-contain"
                  />
                ) : (
                  <div className="aspect-[4/5] w-full">
                    <PaintingCanvas seed={active.seed} palette={active.palette} className="w-full h-full" />
                  </div>
                )}
              </div>

              {/* Detay Bilgileri */}
              <div className="p-5 md:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-brush-soft mb-2">
                      {active.year} · Seçki
                    </p>
                    <h3 className="font-display text-xl md:text-2xl text-paper font-bold leading-tight">
                      {active.title || "İsimsiz Eser"}
                    </h3>
                  </div>
                </div>

                {active.note && (
                  <p className="mt-4 font-sans text-sm text-paper/70 leading-relaxed">
                    {active.note}
                  </p>
                )}

                {/* Meta Bilgiler */}
                <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2 font-mono text-xs text-paper/60 border-t border-paper/10 pt-4">
                  {active.medium && (
                    <div className="flex gap-2">
                      <dt className="text-paper/35">Teknik</dt>
                      <dd className="text-paper/80 font-medium">{active.medium}</dd>
                    </div>
                  )}
                  {active.size && (
                    <div className="flex gap-2">
                      <dt className="text-paper/35">Boyut</dt>
                      <dd className="text-paper/80 font-medium">{active.size}</dd>
                    </div>
                  )}
                </dl>

                {/* Alt Navigasyon */}
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-paper/8">
                  <button
                    onClick={goPrev}
                    disabled={activeIdx === 0}
                    className="font-mono text-xs text-paper/50 hover:text-paper disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <ChevronLeft size={14} /> Önceki
                  </button>
                  <span className="font-mono text-[10px] text-paper/30">
                    {activeIdx + 1} / {processedItems.length}
                  </span>
                  <button
                    onClick={goNext}
                    disabled={activeIdx === processedItems.length - 1}
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
