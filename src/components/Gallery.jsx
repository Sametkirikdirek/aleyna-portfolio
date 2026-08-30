import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Maximize2, ChevronLeft, ChevronRight, Palette,
  Search, SlidersHorizontal, ChevronDown, ChevronUp, Layers, Calendar, Heart, Trophy
} from "lucide-react";
import PaintingCanvas from "./PaintingCanvas";
import { useGallery, useTimeline } from "../hooks/useContent";
import { paintings as defaultPaintings } from "../data/content";
import { setContent } from "../lib/firestore";
import InfiniteGallery from "./ui/infinite-gallery";
import DragScrollStrip from "./ui/DragScrollStrip";

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

// ─── 3D Spotlight Showcase Carousel (Atölyenin Enleri) ─────────
function SpotlightCarousel({ artworks = [], onSelect }) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!artworks || artworks.length === 0) return null;

  const current = artworks[activeIdx] || artworks[0];

  return (
    <div className="relative rounded-3xl overflow-hidden border border-amber-900/15 dark:border-paper/15 dark:bg-gradient-to-br dark:from-ink-soft/95 dark:via-ink-soft/75 dark:to-ink-soft/95 bg-[#fdfbf7]/80 p-6 md:p-8 backdrop-blur-xl shadow-2xl mb-12">
      {/* Ambient Orbs */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl" />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full dark:bg-brush/20 bg-brush text-white dark:text-brush-soft dark:border-brush/40 border-brush font-bold font-mono text-[11px] tracking-wider uppercase mb-2 shadow-sm transition-colors duration-300">
            <Trophy size={12} /> ATÖLYENİN ENLERİ · SEÇKİN TABLOLAR
          </div>
          <h3 className="font-display text-2xl md:text-3xl text-paper font-bold flex items-center gap-2">
            Öne Çıkan En İyiler
          </h3>
          <p className="font-sans text-xs sm:text-sm dark:text-paper/60 text-paper/85 mt-1 max-w-xl transition-colors duration-300">
            Sanatseverlerin ve ziyaretçilerin kalbine dokunan ikonik atölye serileri.
          </p>
        </div>

        {/* Carousel Prev/Next Controls */}
        <div className="shrink-0 flex items-center gap-2">
          <button
            onClick={() => setActiveIdx((prev) => (prev - 1 + artworks.length) % artworks.length)}
            className="p-2.5 rounded-full dark:bg-paper/10 bg-[#fdfbf7]/90 hover:bg-white dark:hover:bg-paper/20 border border-amber-900/15 dark:border-paper/15 text-paper transition-all cursor-pointer shadow-md"
            aria-label="Önceki Eser"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="font-mono text-xs text-paper/70 px-2 font-semibold">
            {activeIdx + 1} / {artworks.length}
          </span>
          <button
            onClick={() => setActiveIdx((prev) => (prev + 1) % artworks.length)}
            className="p-2.5 rounded-full dark:bg-paper/10 bg-[#fdfbf7]/90 hover:bg-white dark:hover:bg-paper/20 border border-amber-900/15 dark:border-paper/15 text-paper transition-all cursor-pointer shadow-md"
            aria-label="Sonraki Eser"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* 3D Spotlight Cards Row */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Active Hero Spotlight Image */}
        <motion.div
          key={current.id || activeIdx}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          onClick={() => onSelect(current)}
          className="md:col-span-7 group relative rounded-2xl overflow-hidden bg-ink border border-amber-900/15 dark:border-paper/15 cursor-pointer shadow-2xl aspect-[4/3] sm:aspect-[16/10]"
        >
          {current.image ? (
            <img
              src={current.image}
              alt={current.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <PaintingCanvas seed={current.seed} palette={current.palette} className="w-full h-full" />
          )}

          {/* Badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className="font-mono text-[10px] uppercase font-bold px-3 py-1 rounded-full backdrop-blur-md bg-brush text-white shadow-lg flex items-center gap-1.5">
              <Trophy size={12} /> En Çok Beğenilen Eser
            </span>
          </div>

          {/* Overlay info */}
          <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
            <h4 className="font-display text-xl sm:text-2xl text-white font-bold group-hover:text-brush-soft transition-colors">
              {current.title}
            </h4>
            <p className="font-mono text-xs text-white/75 mt-1">
              {current.medium} · {current.year}
            </p>
          </div>
        </motion.div>

        {/* Thumbnail Selector Cards */}
        <div className="md:col-span-5 flex md:flex-col gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {artworks.map((item, idx) => (
            <button
              key={item.id || idx}
              onClick={() => setActiveIdx(idx)}
              className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer shrink-0 w-44 md:w-full ${
                activeIdx === idx
                  ? "dark:bg-brush/20 bg-brush text-white border-brush shadow-[0_0_15px_rgba(181,72,46,0.3)] scale-[1.02]"
                  : "dark:bg-paper/5 bg-[#fdfbf7]/90 dark:border-paper/10 border-amber-900/15 hover:bg-white hover:border-amber-900/30 opacity-90 hover:opacity-100 shadow-xs"
              }`}
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-ink">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <PaintingCanvas seed={item.seed} palette={item.palette} className="w-full h-full" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h5 className={`font-display text-xs font-bold truncate ${activeIdx === idx ? "text-white" : "text-paper"}`}>
                  {item.title}
                </h5>
                <p className={`font-mono text-[10px] font-medium truncate mt-0.5 ${activeIdx === idx ? "text-white/85" : "text-paper/70"}`}>
                  {item.medium}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
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
        transformStyle: isHovering ? "preserve-3d" : undefined,
        willChange: isHovering ? "transform" : "auto",
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
  // Admin-configurable settings for Zaman Yolculuğu InfiniteGallery
  const timelineIdleDelay = typeof timelineData?.idleDelay === "number" ? timelineData.idleDelay : 3000;
  const timelineAutoPlaySpeed = typeof timelineData?.autoPlaySpeed === "number" ? timelineData.autoPlaySpeed : 0.3;

  const [activeTab, setActiveTab] = useState("galeri"); // "galeri" | "zaman-yolculugu"
  const [activeIdx, setActiveIdx] = useState(null);
  const [lightboxCustomItem, setLightboxCustomItem] = useState(null);
  const [items, setItems] = useState([]);

  // Use artworks directly to preserve Admin panel's exact custom ordering, filtering out hidden items for visitors
  const mergedArtworks = useMemo(() => {
    const list = !artworks || artworks.length === 0 ? defaultPaintings : artworks;
    return list.filter((item) => item.hidden !== true && item.published !== false);
  }, [artworks]);

  // Local Storage Visitor Likes Tracker
  const [userLikes, setUserLikes] = useState(() => {
    try {
      const saved = localStorage.getItem("user_liked_artworks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Accordion Filter States (Nested: Outer Filter Box & Inner Categories)
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Tümü");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");

  // Dynamic columns for Left-to-Right Row-First Masonry Layout
  const [columnCount, setColumnCount] = useState(4);

  useEffect(() => {
    const updateCols = () => {
      const w = window.innerWidth;
      setColumnCount(w < 640 ? 1 : w < 1024 ? 2 : w < 1280 ? 3 : 4);
    };
    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, []);

  // Sync items state whenever mergedArtworks updates
  useEffect(() => {
    if (mergedArtworks && mergedArtworks.length > 0) {
      setItems(mergedArtworks);
    }
  }, [mergedArtworks]);

  // Visitor Like Action (Stores like state persistently)
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
          const payload = {
            title: galleryData?.title || "",
            subtitle: galleryData?.subtitle || "",
            artworks: updated,
          };
          localStorage.setItem("portfolio_cache_gallery", JSON.stringify(payload));
          setContent("gallery", payload).catch(() => {});
        } catch {}

        return updated;
      });

      return nextLikes;
    });
  }, []);

  const categories = useMemo(() => {
    const meds = new Set(mergedArtworks.map((a) => a.medium).filter(Boolean));
    return ["Tümü", ...Array.from(meds)];
  }, [mergedArtworks]);

  // Compute "Enler" Top Artworks for Spotlight Carousel
  // Priority: 1) Admin-selected featuredInSpotlight (if any selected), 2) Top liked (fallback)
  const topEnlerArtworks = useMemo(() => {
    if (!items || items.length === 0) return [];
    const spotlighted = items.filter((a) => a.featuredInSpotlight);
    if (spotlighted.length > 0) {
      return spotlighted.slice(0, 5);
    }
    return [...items].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 5);
  }, [items]);

  // Compute Monthly Showcase Artworks dynamically from Admin featured or Top Liked
  const monthlyArtworks = useMemo(() => {
    if (!items || items.length === 0) return [];
    
    const featured = items.filter((item) => item.featuredInMonthly);
    if (featured.length > 0) {
      return featured;
    }
    
    return [...items].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 6);
  }, [items]);

  // Filter & Sort Pipeline for Main Pinterest Grid (Contains ALL artworks including generated harvest paintings)
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

  // Smart Synchronous Balanced Masonry:
  // Dynamically places each item into the currently shortest column (0ms, zero re-renders)
  // Ensures trailing tall items like 'The Eye Contact' naturally fill empty right columns!
  const masonryColumns = useMemo(() => {
    const count = Math.max(1, columnCount);
    const cols = Array.from({ length: count }, () => []);
    const colHeights = Array(count).fill(0);

    processedItems.forEach((item, index) => {
      // Find the column index with the minimum accumulated height
      let minColIdx = 0;
      let minHeight = colHeights[0];
      for (let c = 1; c < count; c++) {
        if (colHeights[c] < minHeight) {
          minHeight = colHeights[c];
          minColIdx = c;
        }
      }

      cols[minColIdx].push({ item, index });

      // Synchronous height weight (taller items like The Eye Contact / Spirituel have higher weight)
      let weight = 1.25;
      const t = (item.title || "").toLowerCase();
      if (t.includes("eye contact") || t.includes("spirituel") || t.includes("habersiz")) {
        weight = 1.75;
      } else if (item.size?.includes("120") || item.size?.includes("100")) {
        weight = 1.45;
      } else if (t.includes("kare") || item.size?.includes("90x90")) {
        weight = 1.0;
      }

      colHeights[minColIdx] += weight;
    });

    return cols;
  }, [processedItems, columnCount]);

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
    <section className="min-h-screen px-3 sm:px-6 md:px-10 pt-24 sm:pt-28 pb-20 md:pt-32 md:pb-32 bg-ink text-paper">
      <div className="max-w-7xl mx-auto">
        {/* ─── Header & Controls ─── */}
        <header className="mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="font-mono text-xs tracking-[0.25em] uppercase text-brush-soft mb-3 flex items-center gap-2 font-bold"
              >
                <Palette size={14} /> Galeri & Seçkiler
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="font-display text-3xl md:text-5xl lg:text-6xl text-paper leading-tight text-balance font-bold"
              >
                {activeTab === "galeri" ? (
                  galleryData?.title ? (
                    galleryData.title
                  ) : (
                    <>
                      Tuval ve Kodun <br className="hidden sm:block" />
                      <span className="text-gradient-animated">Kesişimi</span>
                    </>
                  )
                ) : (
                  <>
                    Zaman Yolculuğu <br className="hidden sm:block" />
                    <span className="text-gradient-animated">Atölye Seçkileri</span>
                  </>
                )}
              </motion.h2>
            </div>

            {/* Right Controls: Emblems */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-start md:items-end gap-3"
            >
              <p className="font-sans text-sm text-paper/70 max-w-xs md:text-right font-medium">
                {galleryData?.subtitle || (
                  <>
                    Esere dokunarak hikâyesini inceleyin.<br className="hidden sm:block" />
                    Kalp ikonuna dokunarak beğeninizi iletin.
                  </>
                )}
              </p>

              <div className="flex items-center gap-3">
                {/* Galeri Emblem */}
                <div className="relative group">
                  <button
                    onClick={() => setActiveTab("galeri")}
                    aria-label="Galeri (Tuval Seçkileri)"
                    className={`p-2.5 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                      activeTab === "galeri"
                        ? "dark:bg-brush/20 bg-brush text-white dark:text-brush-soft dark:border-brush/50 border-brush shadow-md scale-105"
                        : "dark:bg-paper/5 bg-[#fdfbf7]/80 dark:text-paper/60 text-paper/70 dark:border-paper/15 border-amber-900/15 hover:text-paper hover:bg-white hover:border-amber-900/30"
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
                        ? "dark:bg-purple-500/20 bg-purple-600 text-white dark:text-purple-300 dark:border-purple-500/50 border-purple-600 shadow-md scale-105"
                        : "dark:bg-paper/5 bg-[#fdfbf7]/80 dark:text-paper/60 text-paper/70 dark:border-paper/15 border-amber-900/15 hover:text-paper hover:bg-white hover:border-amber-900/30"
                    }`}
                  >
                    <PortalIcon className="w-5 h-5 animate-[spin_10s_linear_infinite] group-hover:animate-[spin_2.5s_linear_infinite] transition-transform" />
                  </button>
                  <div className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap bg-ink-soft/95 text-paper text-[11px] font-mono px-2.5 py-1 rounded-md border border-paper/15 shadow-lg z-30">
                    Zaman Yolculuğu
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </header>

        {/* ─── OPTION 1: "ENLER & ÖNE ÇIKAN ESERLER" SPOTLIGHT CAROUSEL ─── */}
        {activeTab === "galeri" && topEnlerArtworks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <SpotlightCarousel
              artworks={topEnlerArtworks}
              onSelect={(item) => setLightboxCustomItem(item)}
            />
          </motion.div>
        )}

        {/* ─── AYIN TUVALLERİ – Yatay Kaydırılabilir Şerit ─── */}
        {activeTab === "galeri" && monthlyArtworks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mb-12 relative rounded-3xl overflow-hidden border border-amber-900/15 dark:border-paper/15 dark:bg-gradient-to-br dark:from-ink-soft/95 dark:via-ink-soft/75 dark:to-ink-soft/95 bg-[#fdfbf7]/80 px-5 pt-6 pb-7 md:px-8 md:pt-7 md:pb-8 backdrop-blur-xl shadow-2xl"
          >
            {/* Ambient Glow Orbs */}
            <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

            {/* Header Info */}
            <div className="flex items-center justify-between gap-3 mb-5 relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full dark:bg-brush/20 bg-brush text-white dark:text-brush-soft dark:border-brush/40 border-brush font-bold font-mono text-[10px] tracking-wider uppercase mb-1.5 shadow-sm transition-colors duration-300">
                  <Calendar size={11} /> AYIN TUVALLERİ
                </div>
                <h3 className="font-display text-xl sm:text-2xl md:text-3xl text-paper font-bold">
                  Ayın Tuval Günlüğü
                </h3>
                <p className="font-sans text-[11px] sm:text-xs dark:text-paper/55 text-paper/85 mt-0.5 transition-colors duration-300">
                  Kaydırarak tüm seçkileri görün
                </p>
              </div>
              <span className="shrink-0 font-mono text-[10px] dark:text-brush-soft text-amber-900 dark:bg-brush/15 bg-amber-500/15 px-2.5 py-1 rounded-xl border dark:border-brush/30 border-amber-900/20 font-bold flex items-center gap-1.5 transition-colors duration-300">
                🔥 {monthlyArtworks.length} Seçki
              </span>
            </div>

            {/* ─── Drag-Scroll Şeridi (mouse + touch) ─── */}
            <DragScrollStrip>
              {monthlyArtworks.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setLightboxCustomItem(item)}
                  className="group relative flex-shrink-0 w-48 sm:w-56 md:w-64 rounded-2xl overflow-hidden bg-ink/80 border border-paper/12 hover:border-rose-500/50 cursor-pointer shadow-lg hover:shadow-[0_0_25px_rgba(244,63,94,0.2)] transition-all duration-300"
                >
                  {/* Image */}
                  <div className="aspect-[3/4] w-full overflow-hidden relative">
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

                    {/* Zoom Icon */}
                    <div className="absolute top-2.5 left-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="p-1.5 rounded-full backdrop-blur-md bg-ink/80 text-paper border border-paper/20 inline-flex items-center justify-center shadow-lg">
                        <Maximize2 size={12} />
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                    <h4 className="font-display text-sm text-white font-semibold group-hover:text-brush-soft transition-colors truncate">
                      {item.title || "İsimsiz Eser"}
                    </h4>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="font-mono text-[10px] text-white/70 truncate">
                        {item.medium || "Tuval Çalışması"}
                      </p>
                      <span className="font-mono text-[10px] text-amber-400 font-bold shrink-0">
                        {item.year}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </DragScrollStrip>
          </motion.div>
        )}

        {/* ─── FİLTRELEME & ARAMA ALANI (Nested Çift Accordion Modeli) ─── */}
        {activeTab === "galeri" && (
          <div className="mb-8 space-y-3">
            {/* Üst Çubuk: Eser Sayısı & Filtre Aç/Kapat Butonu */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2.5 font-mono text-xs text-paper/75 font-semibold">
                <span className="dark:text-paper/60 text-paper/80 font-bold">{processedItems.length} Eser</span>
                {(activeFilter !== "Tümü" || searchQuery.trim() !== "" || sortBy !== "default") && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full dark:bg-brush/20 bg-brush text-white dark:text-brush-soft text-[11px] font-bold shadow-xs">
                    {activeFilter !== "Tümü"
                      ? `🎨 ${activeFilter}`
                      : searchQuery
                      ? `🔍 "${searchQuery}"`
                      : "Filtrelendi"}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveFilter("Tümü");
                        setSearchQuery("");
                        setSortBy("default");
                      }}
                      className="hover:opacity-80 cursor-pointer ml-0.5"
                      title="Filtreyi Temizle"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
              </div>

              {/* 1. DÜZEY ACCORDION TETİKLEYİCİ: Ana Filtre Aç/Kapat Butonu */}
              <button
                type="button"
                onClick={() => setIsFilterOpen((prev) => !prev)}
                className={`inline-flex items-center gap-2 font-mono text-xs px-4 py-2 rounded-full border transition-all shadow-sm cursor-pointer ${
                  isFilterOpen || activeFilter !== "Tümü" || searchQuery.trim() !== ""
                    ? "dark:bg-brush/20 bg-brush text-white dark:text-brush-soft dark:border-brush/40 border-brush shadow-md font-semibold"
                    : "dark:bg-paper/5 bg-[#fdfbf7]/90 dark:border-paper/15 border-amber-900/20 text-paper/80 hover:text-paper hover:border-amber-900/40"
                }`}
              >
                <SlidersHorizontal size={13} />
                <span>{isFilterOpen ? "Filtreyi Kapat" : "Filtrele & Sırala"}</span>
                {isFilterOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>

            {/* 1. DÜZEY ACCORDION PANELİ: Ana Filtre Kutusu */}
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="overflow-hidden dark:bg-ink-soft/90 bg-[#fdfbf7]/90 dark:border-paper/12 border-amber-900/15 border rounded-2xl p-5 md:p-6 backdrop-blur-md shadow-xl"
                >
                  <div className="flex flex-col gap-4">
                    {/* Arama ve Sıralama Satırı */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="relative flex items-center">
                        <Search size={16} className="absolute left-3.5 text-paper/50 pointer-events-none" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Eser adı, teknik veya yılda ara..."
                          className="w-full dark:bg-paper/10 bg-white border dark:border-paper/25 border-amber-900/25 rounded-xl pl-10 pr-10 py-2.5 text-sm font-sans font-medium text-paper placeholder:text-paper/45 focus:outline-none focus:border-brush focus:ring-2 focus:ring-brush/20 transition-all shadow-sm"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 text-paper/50 hover:text-paper cursor-pointer p-1"
                          >
                            <X size={15} />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-paper/60 shrink-0 font-medium">Sırala:</span>
                        <div className="flex flex-wrap gap-1.5 flex-1">
                          {[
                            { id: "default", label: "Varsayılan Sıra" },
                            { id: "likes", label: "❤️ Beğeniye Göre" },
                            { id: "newest", label: "Yeniye Göre" },
                            { id: "oldest", label: "Eskiye Göre" },
                          ].map((s) => (
                            <button
                              key={s.id}
                              onClick={() => setSortBy(s.id)}
                              className={`font-mono text-[11px] px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                                sortBy === s.id
                                  ? "dark:bg-brush/25 dark:text-brush-soft dark:border-brush/40 bg-brush text-white border-brush font-semibold shadow-xs"
                                  : "dark:bg-paper/5 bg-[#fdfbf7]/85 dark:text-paper/60 text-paper/75 dark:border-paper/10 border-amber-900/15 hover:bg-white hover:text-paper"
                              }`}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 2. DÜZEY ACCORDION: Teknik & Materyal Filtresi (Kategoriler) */}
                    <div className="border-t dark:border-paper/10 border-amber-900/10 pt-3">
                      <button
                        type="button"
                        onClick={() => setIsCategoryOpen((prev) => !prev)}
                        className="w-full flex items-center justify-between font-mono text-xs text-paper/80 hover:text-paper cursor-pointer py-1.5 group"
                      >
                        <span className="flex items-center gap-2 font-semibold">
                          <Layers size={14} className="text-brush group-hover:rotate-12 transition-transform" />
                          Teknik & Materyal Filtresi
                          <span className="text-[10px] font-normal text-paper/50 font-mono">
                            ({categories.length} kategori {activeFilter !== "Tümü" ? `· Seçili: ${activeFilter}` : ""})
                          </span>
                        </span>
                        <div className="flex items-center gap-1.5 text-paper/60 group-hover:text-paper text-[11px] font-medium">
                          <span>{isCategoryOpen ? "Kategorileri Gizle" : "Kategorileri Göster"}</span>
                          {isCategoryOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </div>
                      </button>

                      <AnimatePresence>
                        {isCategoryOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden pt-3"
                          >
                            <div className="flex flex-wrap gap-2">
                              {categories.map((cat) => (
                                <button
                                  key={cat}
                                  onClick={() => setActiveFilter(cat)}
                                  className={`
                                    font-mono text-xs tracking-wide px-3.5 py-1.5 rounded-full border transition-all duration-200 cursor-pointer
                                    ${activeFilter === cat
                                      ? "dark:bg-brush/25 dark:text-brush-soft dark:border-brush/50 bg-brush text-white border-brush shadow-md font-semibold"
                                      : "dark:bg-paper/5 bg-[#fdfbf7]/85 dark:text-paper/60 text-paper/75 dark:border-paper/12 border-amber-900/15 hover:bg-white hover:text-paper hover:border-amber-900/30"
                                    }
                                  `}
                                >
                                  {cat}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Reset Filters */}
                    {(activeFilter !== "Tümü" || searchQuery !== "" || sortBy !== "default") && (
                      <div className="flex justify-end border-t dark:border-paper/10 border-amber-900/10 pt-3">
                        <button
                          onClick={() => {
                            setActiveFilter("Tümü");
                            setSearchQuery("");
                            setSortBy("default");
                          }}
                          className="font-mono text-xs text-brush hover:underline cursor-pointer"
                        >
                          Filtreleri Sıfırla
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ─── PINTEREST MASONRY GRID (Fast & Smooth 60fps) ─── */}
        <div className="flex gap-4 sm:gap-5 items-start">
          {masonryColumns.map((col, colIdx) => (
            <div key={colIdx} className="flex-1 flex flex-col gap-4 sm:gap-5 min-w-0">
              {col.map(({ item: p, index: i }) => {
                const isLiked = userLikes.includes(p.id);
                return (
                  <motion.div
                    key={p.id || i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: Math.min((i % 6) * 0.03, 0.2) }}
                    className="w-full"
                  >
                    <TiltCard
                      className="group relative rounded-xl overflow-hidden text-left bg-ink-soft border border-paper/10 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-brush/10 hover:border-brush-soft/40 transition-shadow duration-300"
                      onClick={() => setActiveIdx(i)}
                    >
                      {/* Fotoğraf — Doğal boyutunda (Pinterest intrinsic ratio) */}
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.03]"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
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

                        {/* Heart / Like Button (Icon only, no like count number shown to visitors) */}
                        <button
                          onClick={(e) => toggleLike(p.id, e)}
                          className={`absolute top-3 right-3 z-20 p-2.5 rounded-full backdrop-blur-md border transition-all cursor-pointer shadow-md flex items-center justify-center ${
                            isLiked
                              ? "bg-rose-600 text-white border-rose-400 shadow-[0_0_14px_rgba(244,63,94,0.6)] scale-110"
                              : "bg-ink/75 text-paper/70 border-paper/20 hover:text-rose-400 hover:border-rose-500/40 hover:scale-105"
                          }`}
                          title={isLiked ? "Beğeniyi Kaldır" : "Eseri Beğen"}
                        >
                          <Heart
                            size={14}
                            className={
                              isLiked ? "fill-white text-white" : "text-rose-400"
                            }
                          />
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
                            boxShadow:
                              "inset 0 0 30px rgba(217,112,79,0.15), inset 0 0 60px rgba(107,163,166,0.08)",
                          }}
                        />

                        {/* Alt Bilgi Overlay */}
                        <div className="absolute inset-x-0 bottom-0 p-3 pt-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10">
                          <div className="backdrop-blur-md dark:bg-ink/85 bg-[#fdfbf7]/95 border dark:border-paper/10 border-amber-900/15 rounded-lg px-3 py-2.5 transition-all duration-300 group-hover:border-brush/40 flex items-center justify-between shadow-md">
                            <div className="min-w-0 flex-1 pr-2">
                              <h3 className="font-display text-sm sm:text-base text-paper font-bold leading-snug group-hover:text-brush transition-colors duration-300 truncate">
                                {p.title || "İsimsiz Eser"}
                              </h3>
                              {p.medium && (
                                <p className="font-mono text-[10px] dark:text-paper/60 text-paper/75 font-medium mt-0.5 truncate">
                                  {p.medium}
                                </p>
                              )}
                            </div>
                            {p.year && (
                              <span className="font-mono text-[10px] shrink-0 font-bold dark:text-brush-soft text-amber-900 dark:bg-brush/15 bg-amber-500/15 px-2 py-0.5 rounded-md border dark:border-brush/30 border-amber-900/20">
                                {p.year}
                              </span>
                            )}
                          </div>
                        </div>
                      </TiltCard>
                    </motion.div>
                  );
                })}
            </div>
          ))}
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
              autoPlaySpeed={timelineAutoPlaySpeed}
              idleDelay={timelineIdleDelay}
              visibleCount={Math.min(18, Math.max(10, infiniteGalleryImages.length))}
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

                  {/* Lightbox Heart Like Button (Icon only, no number shown) */}
                  <button
                    onClick={(e) => toggleLike(active.id, e)}
                    className={`p-2.5 rounded-full border transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                      userLikes.includes(active.id)
                        ? "bg-rose-600 text-white border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)] scale-110"
                        : "bg-paper/10 text-paper/80 border-paper/15 hover:text-rose-400 hover:border-rose-500/40"
                    }`}
                    title={userLikes.includes(active.id) ? "Beğeniyi Kaldır" : "Eseri Beğen"}
                  >
                    <Heart size={16} className={userLikes.includes(active.id) ? "fill-white text-white" : "text-rose-400"} />
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
