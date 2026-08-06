import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Maximize2, ChevronLeft, ChevronRight, Palette,
  Search, SlidersHorizontal, ChevronDown, ChevronUp, Layers, Calendar, Heart
} from "lucide-react";
import PaintingCanvas from "./PaintingCanvas";
import { useGallery, useTimeline } from "../hooks/useContent";
import { setContent } from "../lib/firestore";
import InfiniteGallery from "./ui/infinite-gallery";

// ─── Custom Animated Portal Icon for Zaman Yolculuğu ───────────
function PortalIcon({ className = "w-5 h-5", ...props }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="portalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#7e22ce" />
        </linearGradient>
      </defs>

      <path
        d="M50 15 C 72 15, 86 30, 86 50 C 86 72, 72 86, 50 86 C 28 86, 14 72, 14 50 C 14 34, 26 20, 42 17 C 58 14, 73 26, 73 44 C 73 60, 59 73, 43 73 C 28 73, 21 59, 26 44 C 30 30, 45 26, 57 33 C 65 37, 64 49, 54 55 C 44 61, 36 51, 44 43"
        stroke="url(#portalGrad)"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M50 23 C 66 23, 77 34, 77 50 C 77 66, 66 77, 50 77 C 34 77, 23 66, 23 50 C 23 39, 31 29, 43 26"
        stroke="#f3e8ff"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />

      <path d="M 22 14 Q 22 20 16 20 Q 22 20 22 26 Q 22 20 28 20 Q 22 20 22 14 Z" fill="#ffd166" />
      <path d="M 82 22 Q 82 28 76 28 Q 82 28 82 34 Q 82 28 88 28 Q 82 28 82 22 Z" fill="#ffd166" />
      <path d="M 75 77 Q 75 83 69 83 Q 75 83 75 89 Q 75 83 81 83 Q 75 83 75 77 Z" fill="#ffd166" />
      <path d="M 18 73 Q 18 79 12 79 Q 18 79 18 85 Q 18 79 24 79 Q 18 79 18 73 Z" fill="#ffd166" />
    </svg>
  );
}

// ─── Custom Canvas Easel Icon for Galeri ───────────────────────
function CanvasIcon({ className = "w-5 h-5", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path d="M12 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 21l3-7M17 21l-3-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 14h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="4" y="4" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="rgba(244,63,94,0.18)" />
      <path d="M7 8c2-2 4 1 6-1s4 1 4 1" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="15" cy="7" r="1" fill="#fb7185" />
    </svg>
  );
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
  const [lightboxCustomItem, setLightboxCustomItem] = useState(null);
  const [items, setItems] = useState([]);

  // Local Storage Visitor Likes Tracker
  const [userLikes, setUserLikes] = useState(() => {
    try {
      const saved = localStorage.getItem("user_liked_artworks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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

  // Visitor Like Action
  const toggleLike = useCallback((artId, e) => {
    if (e) e.stopPropagation();

    setUserLikes((prev) => {
      const isLiked = prev.includes(artId);
      const nextLikes = isLiked ? prev.filter((id) => id !== artId) : [...prev, artId];
      try {
        localStorage.setItem("user_liked_artworks", JSON.stringify(nextLikes));
      } catch (err) {
        console.warn("Likes cache save error:", err);
      }

      setItems((prevItems) => {
        const updated = prevItems.map((item) => {
          if (item.id === artId) {
            const currentCount = item.likes || 0;
            return {
              ...item,
              likes: isLiked ? Math.max(0, currentCount - 1) : currentCount + 1,
            };
          }
          return item;
        });

        // Sync back to cache & Firestore
        try {
          localStorage.setItem("portfolio_cache_gallery", JSON.stringify({ artworks: updated }));
          setContent("gallery", { artworks: updated }).catch(() => {});
        } catch {}

        return updated;
      });

      return nextLikes;
    });
  }, []);

  const categories = useMemo(() => {
    const meds = new Set(artworks.map((a) => a.medium).filter(Boolean));
    return ["Tümü", ...Array.from(meds)];
  }, [artworks]);

  // Compute Monthly Showcase Artworks dynamically from Admin featured or Top Liked
  const monthlyArtworks = useMemo(() => {
    if (!items || items.length === 0) return [];
    
    // Explicitly featured by Admin
    const featured = items.filter((item) => item.featuredInMonthly);
    if (featured.length >= 4) {
      return featured.slice(0, 4);
    }
    
    // Fill remaining slots with top most-liked artworks
    const remaining = [...items]
      .filter((item) => !featured.some((f) => f.id === item.id))
      .sort((a, b) => (b.likes || 0) - (a.likes || 0));

    return [...featured, ...remaining].slice(0, 4);
  }, [items]);

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
    } else if (sortBy === "likes") {
      list.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }

    return list;
  }, [items, activeFilter, searchQuery, sortBy]);

  const active = lightboxCustomItem
    ? lightboxCustomItem
    : activeIdx !== null
    ? processedItems[activeIdx]
    : null;

  const closeLightbox = () => {
    setActiveIdx(null);
    setLightboxCustomItem(null);
  };

  const goNext = () => {
    if (lightboxCustomItem) return;
    if (activeIdx !== null && activeIdx < processedItems.length - 1) setActiveIdx(activeIdx + 1);
  };
  const goPrev = () => {
    if (lightboxCustomItem) return;
    if (activeIdx !== null && activeIdx > 0) setActiveIdx(activeIdx - 1);
  };

  // Keyboard navigation
  useEffect(() => {
    if (activeIdx === null && !lightboxCustomItem) return;
    const handler = (e) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeIdx, lightboxCustomItem, processedItems.length]);

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
        {/* ─── Header & Controls ─── */}
        <header className="mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="font-mono text-xs tracking-[0.25em] uppercase text-brush-soft mb-3 flex items-center gap-2"
              >
                <Palette size={14} /> Galeri & Seçkiler
              </motion.p>
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

            {/* Right Controls: Emblems + Filtrele & Ara */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-start md:items-end gap-3"
            >
              <p className="font-sans text-sm text-paper/50 max-w-xs md:text-right">
                Esere dokunarak hikâyesini inceleyin.<br className="hidden sm:block" />
                Kalp ikonuna dokunarak favorilerinize ekleyin.
              </p>

              <div className="flex items-center gap-3">
                {/* Galeri Emblem */}
                <div className="relative group">
                  <button
                    onClick={() => setActiveTab("galeri")}
                    aria-label="Galeri (Tuval Seçkileri)"
                    className={`p-2.5 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                      activeTab === "galeri"
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_16px_rgba(244,63,94,0.35)] scale-105"
                        : "bg-paper/5 text-paper/60 border-paper/15 hover:text-paper hover:bg-paper/10 hover:border-paper/30"
                    }`}
                  >
                    <CanvasIcon className="w-5 h-5 group-hover:rotate-6 transition-transform duration-300" />
                  </button>
                  <div className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap bg-ink-soft/95 text-paper text-[11px] font-mono px-2.5 py-1 rounded-md border border-paper/15 shadow-lg z-30">
                    Galeri (Tuval Seçkileri)
                  </div>
                </div>

                {/* Zaman Yolculuğu Emblem (Portal) */}
                <div className="relative group">
                  <button
                    onClick={() => setActiveTab("zaman-yolculugu")}
                    aria-label="Zaman Yolculuğu"
                    className={`p-2.5 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                      activeTab === "zaman-yolculugu"
                        ? "bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-[0_0_16px_rgba(168,85,247,0.35)] scale-105"
                        : "bg-paper/5 text-paper/60 border-paper/15 hover:text-paper hover:bg-paper/10 hover:border-paper/30"
                    }`}
                  >
                    <PortalIcon className="w-5 h-5 animate-[spin_10s_linear_infinite] group-hover:animate-[spin_2.5s_linear_infinite] transition-transform" />
                  </button>
                  <div className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap bg-ink-soft/95 text-paper text-[11px] font-mono px-2.5 py-1 rounded-md border border-paper/15 shadow-lg z-30">
                    Zaman Yolculuğu
                  </div>
                </div>

                {/* Subtle Divider */}
                <div className="w-px h-6 bg-paper/15 mx-0.5" />

                {/* Filtrele & Ara Accordion Button */}
                <button
                  onClick={() => setIsAccordionOpen((prev) => !prev)}
                  className={`group inline-flex items-center gap-2 font-mono text-xs transition-all py-2.5 px-4 rounded-full border shadow-sm cursor-pointer ${
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
              </div>
            </motion.div>
          </div>

          {/* ─── Accordion Filter Bar ─── */}
          <AnimatePresence>
            {isAccordionOpen && (
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
                          { id: "likes", label: "❤️ En Çok Beğenilen" },
                          { id: "newest", label: "Yeniye Göre" },
                          { id: "oldest", label: "Eskiye Göre" },
                        ].map((s) => (
                          <button
                            key={s.id}
                            onClick={() => setSortBy(s.id)}
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
                        Filtreleri Sıfırla
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* ─── AYIN TUVALLERİ / ATÖLYE HASADI & ZİYARETÇİ FAVORİLERİ ─── */}
        {activeTab === "galeri" && monthlyArtworks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mb-12 relative rounded-3xl overflow-hidden border border-paper/15 bg-gradient-to-br from-ink-soft/95 via-ink-soft/75 to-ink-soft/95 p-6 md:p-8 backdrop-blur-xl shadow-2xl"
          >
            {/* Ambient Glow Orbs */}
            <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

            {/* Header Info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 font-mono text-[11px] tracking-wider uppercase mb-2">
                  <Calendar size={12} /> AYIN TUVALLERİ · ZİYARETÇİ FAVORİLERİ
                </div>
                <h3 className="font-display text-2xl md:text-3xl text-paper font-bold flex items-center gap-2">
                  Ayın Tuval Günlüğü <span className="text-brush-soft text-sm md:text-base font-mono font-normal">({monthlyArtworks.length} Seçkisi)</span>
                </h3>
                <p className="font-sans text-xs sm:text-sm text-paper/60 mt-1 max-w-xl">
                  En çok beğeni toplayan ziyaretçi favorileri ve atölyede bu ay öne çıkarılan tuvaller.
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span className="font-mono text-xs text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20 flex items-center gap-1.5">
                  <Heart size={13} className="fill-rose-400 text-rose-400" /> Beğenilere Göre Güncellenir
                </span>
              </div>
            </div>

            {/* 4 Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 relative z-10">
              {monthlyArtworks.map((item) => {
                const isLiked = userLikes.includes(item.id);
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setLightboxCustomItem(item)}
                    className="group relative rounded-2xl overflow-hidden bg-ink/80 border border-paper/12 hover:border-rose-500/50 cursor-pointer shadow-lg hover:shadow-[0_0_30px_rgba(244,63,94,0.2)] transition-all duration-500"
                  >
                    {/* Image */}
                    <div className="aspect-[4/5] w-full overflow-hidden relative">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      ) : (
                        <PaintingCanvas seed={item.seed} palette={item.palette} className="w-full h-full" />
                      )}

                      {/* Heart / Like Button */}
                      <button
                        onClick={(e) => toggleLike(item.id, e)}
                        className={`absolute top-3 right-3 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full backdrop-blur-md border transition-all cursor-pointer shadow-md ${
                          isLiked
                            ? "bg-rose-600 text-white border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.5)] scale-105"
                            : "bg-ink/75 text-paper/70 border-paper/20 hover:text-rose-400 hover:border-rose-500/40"
                        }`}
                        title={isLiked ? "Beğeniyi Kaldır" : "Eseri Beğen"}
                      >
                        <Heart size={12} className={isLiked ? "fill-white text-white" : "text-rose-400"} />
                        <span className="font-mono text-[10px] font-bold">{item.likes || 0}</span>
                      </button>

                      {/* Zoom Icon */}
                      <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="p-2 rounded-full backdrop-blur-md bg-ink/80 text-paper border border-paper/20 inline-flex items-center justify-center shadow-lg">
                          <Maximize2 size={13} />
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-3.5 bg-gradient-to-t from-ink via-ink/90 to-transparent">
                      <h4 className="font-display text-base text-paper font-semibold group-hover:text-rose-300 transition-colors truncate">
                        {item.title || "İsimsiz Eser"}
                      </h4>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="font-mono text-[11px] text-paper/50 truncate">
                          {item.medium || "Tuval Çalışması"}
                        </p>
                        <span className="font-mono text-[10px] text-rose-400/80 shrink-0">
                          {item.year}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ─── Pinterest Masonry Grid ─── */}
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
            {processedItems.map((p, i) => {
              const isLiked = userLikes.includes(p.id);
              return (
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

                    {/* Heart / Like Button */}
                    <button
                      onClick={(e) => toggleLike(p.id, e)}
                      className={`absolute top-3 right-3 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full backdrop-blur-md border transition-all cursor-pointer shadow-md ${
                        isLiked
                          ? "bg-rose-600 text-white border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.5)] scale-105"
                          : "bg-ink/75 text-paper/70 border-paper/20 hover:text-rose-400 hover:border-rose-500/40"
                      }`}
                      title={isLiked ? "Beğeniyi Kaldır" : "Eseri Beğen"}
                    >
                      <Heart size={12} className={isLiked ? "fill-white text-white" : "text-rose-400"} />
                      <span className="font-mono text-[10px] font-bold">{p.likes || 0}</span>
                    </button>

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
                      <div className="backdrop-blur-md bg-ink/75 border border-paper/10 rounded-lg px-3 py-2.5 transition-all duration-300 group-hover:border-brush-soft/40 group-hover:bg-ink/90 flex items-center justify-between">
                        <div className="min-w-0 flex-1 pr-2">
                          <h3 className="font-display text-sm sm:text-base text-paper font-semibold leading-snug group-hover:text-brush-soft transition-colors duration-300 truncate">
                            {p.title || "İsimsiz Eser"}
                          </h3>
                          {p.medium && (
                            <p className="font-mono text-[10px] text-paper/50 mt-0.5 truncate">
                              {p.medium}
                            </p>
                          )}
                        </div>
                        {p.year && (
                          <span className="font-mono text-[10px] text-paper/40 shrink-0">
                            {p.year}
                          </span>
                        )}
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Boş durum */}
        {processedItems.length === 0 && (
          <div className="text-center py-20 bg-ink-soft/30 rounded-2xl border border-paper/10 mt-6">
            <Palette size={32} className="text-brush-soft/50 mx-auto mb-4" />
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
              Tüm Eserleri Göster
            </button>
          </div>
        )}
      </div>

      {/* ─── Full-Screen Cinematic Zaman Yolculuğu Overlay ─── */}
      <AnimatePresence>
        {activeTab === "zaman-yolculugu" && (
          <motion.div
            key="zaman-yolculugu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "#000",
              width: "100vw",
              height: "100vh",
              overflow: "hidden",
            }}
          >
            <InfiniteGallery
              images={infiniteGalleryImages}
              speed={1.2}
              visibleCount={12}
              className="h-full w-full"
              style={{ width: "100vw", height: "100vh" }}
            />

            {/* Centre Typography */}
            <div
              style={{
                position: "fixed",
                inset: 0,
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                mixBlendMode: "exclusion",
                color: "#fff",
                zIndex: 90,
              }}
            >
              <h1
                style={{
                  fontFamily: "Fraunces, Georgia, serif",
                  fontSize: "clamp(3rem, 10vw, 9rem)",
                  letterSpacing: "-0.04em",
                  fontStyle: "italic",
                  userSelect: "none",
                }}
              >
                ALEYNA
              </h1>
            </div>

            {/* Bottom Hint */}
            <div
              style={{
                position: "fixed",
                bottom: 40,
                left: 0,
                right: 0,
                textAlign: "center",
                fontFamily: "monospace",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: 600,
                color: "rgba(255,255,255,0.7)",
                pointerEvents: "none",
                zIndex: 90,
              }}
            >
              <p>Mouse tekerleği, yön tuşları veya dokunarak zamanda yolculuk yapın</p>
              <p style={{ opacity: 0.6 }}>3 sn. hareketsizlikten sonra otomatik oynatma devam eder</p>
            </div>

            {/* Close / Geri Dön Button */}
            <button
              onClick={() => setActiveTab("galeri")}
              style={{
                position: "fixed",
                top: 28,
                right: 28,
                zIndex: 100,
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "#fff",
                fontFamily: "monospace",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "0 0 20px rgba(0,0,0,0.5)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
              aria-label="Galeri'ye geri dön"
            >
              <X size={16} /> GALERİ'YE DÖN
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Pop-up Lightbox ─── */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-ink/97 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
            onClick={closeLightbox}
          >
            {/* Sol Ok */}
            {!lightboxCustomItem && activeIdx > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-2 md:left-5 top-1/2 -translate-y-1/2 z-[70] p-3 rounded-full bg-paper/10 hover:bg-paper/20 text-paper border border-paper/15 backdrop-blur-md transition-all hover:scale-110 cursor-pointer shadow-lg"
              >
                <ChevronLeft size={22} />
              </button>
            )}
            {/* Sağ Ok */}
            {!lightboxCustomItem && activeIdx < processedItems.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-2 md:right-5 top-1/2 -translate-y-1/2 z-[70] p-3 rounded-full bg-paper/10 hover:bg-paper/20 text-paper border border-paper/15 backdrop-blur-md transition-all hover:scale-110 cursor-pointer shadow-lg"
              >
                <ChevronRight size={22} />
              </button>
            )}

            {/* Sayaç */}
            {!lightboxCustomItem && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[70] font-mono text-xs text-paper/40">
                {activeIdx + 1} / {processedItems.length}
              </div>
            )}

            {/* Kapat */}
            <button
              onClick={closeLightbox}
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
                    <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-brush-soft mb-2 flex items-center gap-2">
                      <span>{active.year}</span> · <span>Seçki</span>
                    </p>
                    <h3 className="font-display text-xl md:text-2xl text-paper font-bold leading-tight">
                      {active.title || "İsimsiz Eser"}
                    </h3>
                  </div>

                  {/* Lightbox Heart Like Button */}
                  <button
                    onClick={(e) => toggleLike(active.id, e)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer shrink-0 ${
                      userLikes.includes(active.id)
                        ? "bg-rose-600 text-white border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)]"
                        : "bg-paper/10 text-paper/80 border-paper/15 hover:text-rose-400 hover:border-rose-500/40"
                    }`}
                  >
                    <Heart size={14} className={userLikes.includes(active.id) ? "fill-white text-white" : "text-rose-400"} />
                    <span className="font-mono text-xs font-bold">{active.likes || 0} Beğeni</span>
                  </button>
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
                {!lightboxCustomItem && (
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
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
