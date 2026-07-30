import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ChevronLeft, ChevronRight, X, Sparkles, Layers } from "lucide-react";

export const memoriesList = [
  {
    id: "m1",
    title: "Atölyede Gece Vardiyası",
    date: "Eylül 2024",
    location: "İstanbul Atölye",
    image: "/gallery/art-2.png",
    caption: "Kod derlenirken kurumasını beklediğim ilk yağlı boya katmanı. Gece saat 03:00.",
    tag: "Atölye Notu",
  },
  {
    id: "m2",
    title: "Sinir Ağları & Tuval Prototipi",
    date: "Haziran 2024",
    location: "Laboratuvar",
    image: "/gallery/art-1.png",
    caption: "Fırça darbelerinin CLIP vektörleri ile eşleştiği ilk üretimsel deneme.",
    tag: "Yapay Zeka Ar-Ge",
  },
  {
    id: "m3",
    title: "Boğaz'da Sabah Işığı",
    date: "Mayıs 2023",
    location: "Ortaköy, İstanbul",
    image: "/gallery/art-3.png",
    caption: "Erken sabah ışığının su üzerindeki algoritmik yansıması ve suluboya etütleri.",
    tag: "Kişisel Not",
  },
  {
    id: "m4",
    title: "Değişken İsimleri Sergisi",
    date: "Kasım 2023",
    location: "Kişisel Sergi",
    image: "/gallery/art-4.png",
    caption: "Yazılım kavramlarını tuval boyutuna taşıdığım sergiden saklanan taslaklar.",
    tag: "Sergi Anısı",
  },
  {
    id: "m5",
    title: "Fibonacci & Akışkan Akrilik",
    date: "Ocak 2024",
    location: "Atölye",
    image: "/gallery/art-5.png",
    caption: "Doğadaki matematiksel spirallerin tuval üzerine akışkan döküm tekniğiyle aktarımı.",
    tag: "Teknik Etüt",
  },
  {
    id: "m6",
    title: "Siberpunk Portre Taslağı",
    date: "Ağustos 2023",
    location: "Dijital Stüdyo",
    image: "/gallery/art-6.png",
    caption: "Klasik portre çizimlerinin dijital devre hatlarıyla birleştiği ilk kareler.",
    tag: "Eser Notu",
  },
  {
    id: "m7",
    title: "Tuval & Kod Sentezi",
    date: "Şubat 2024",
    location: "İstanbul",
    image: "/images/contact-bg.png",
    caption: "Sanatın sezgisi ile mühendisliğin titizliğinin kesiştiği anı kartı.",
    tag: "Hatıra",
  },
];

export default function ThreeDGalleryMemories() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const containerRef = useRef(null);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % memoriesList.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + memoriesList.length) % memoriesList.length);
  };

  return (
    <section className="relative w-full py-20 bg-ink text-paper overflow-hidden border-t border-paper/10">
      {/* Arka plan ışıltı & grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-circuit) 1px, transparent 1px), linear-gradient(90deg, var(--color-circuit) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.12] blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-brush), transparent 70%)" }}
      />

      <div className="relative max-w-6xl mx-auto px-6 md:px-10">
        {/* Başlık Bölümü */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-circuit-soft flex items-center gap-2 mb-3">
              <Camera size={14} className="text-circuit-soft" />
              Hatıra & Atölye Günlüğü
            </span>
            <h2 className="font-display text-3xl md:text-5xl text-paper leading-tight">
              3D Fotoğraf Günlüğü
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              className="p-3 rounded-full border border-paper/15 bg-paper/5 hover:bg-paper/15 hover:border-circuit-soft transition-all text-paper"
              aria-label="Önceki hatıra"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="font-mono text-xs text-paper/60 px-2">
              {activeIndex + 1} / {memoriesList.length}
            </span>
            <button
              onClick={handleNext}
              className="p-3 rounded-full border border-paper/15 bg-paper/5 hover:bg-paper/15 hover:border-circuit-soft transition-all text-paper"
              aria-label="Sonraki hatıra"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* 3D Derinlikli Perspektif Galerisi */}
        <div
          ref={containerRef}
          className="relative min-h-[440px] md:min-h-[500px] flex items-center justify-center perspective-[1200px]"
        >
          <div className="relative w-full max-w-md aspect-[4/5] flex items-center justify-center">
            {memoriesList.map((mem, index) => {
              // Aktif karta olan uzaklık offseti
              const offset = index - activeIndex;
              const isCenter = offset === 0;

              // 3D uzamsal pozisyon hesaplaması
              const rotateY = offset * -18;
              const translateX = offset * 110;
              const translateZ = -Math.abs(offset) * 140;
              const opacity = Math.max(0, 1 - Math.abs(offset) * 0.35);
              const zIndex = 20 - Math.abs(offset);

              if (Math.abs(offset) > 3) return null;

              return (
                <motion.div
                  key={mem.id}
                  onClick={() => {
                    if (isCenter) {
                      setSelectedMemory(mem);
                    } else {
                      setActiveIndex(index);
                    }
                  }}
                  animate={{
                    rotateY,
                    x: translateX,
                    z: translateZ,
                    opacity,
                    scale: isCenter ? 1 : 0.88,
                  }}
                  transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                  style={{
                    zIndex,
                    transformStyle: "preserve-3d",
                  }}
                  className={`absolute inset-0 rounded-2xl cursor-pointer p-4 bg-ink-soft border transition-all duration-300 shadow-2xl ${
                    isCenter
                      ? "border-circuit-soft/60 shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
                      : "border-paper/10 hover:border-paper/30 opacity-70"
                  }`}
                >
                  <div className="relative w-full h-[76%] rounded-xl overflow-hidden bg-ink">
                    <img
                      src={mem.image}
                      alt={mem.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-md bg-ink/75 text-circuit-soft border border-paper/15">
                      {mem.tag}
                    </span>
                  </div>

                  <div className="pt-3.5 px-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-lg text-paper font-semibold leading-tight">
                        {mem.title}
                      </h3>
                      <p className="font-mono text-xs text-paper/50 mt-1 flex items-center justify-between">
                        <span>{mem.location}</span>
                        <span>{mem.date}</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Anı Detay Pop-up (Lightbox) */}
      <AnimatePresence>
        {selectedMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-ink/95 backdrop-blur-md flex items-center justify-center p-5 md:p-10"
            onClick={() => setSelectedMemory(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-2xl w-full bg-ink-soft rounded-2xl overflow-hidden border border-paper/20 shadow-2xl p-6 md:p-8 relative"
            >
              <button
                onClick={() => setSelectedMemory(null)}
                className="absolute top-5 right-5 text-paper/60 hover:text-paper p-1.5 rounded-full hover:bg-paper/10 transition-colors"
                aria-label="Kapat"
              >
                <X size={20} />
              </button>

              <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-ink mb-6">
                <img
                  src={selectedMemory.image}
                  alt={selectedMemory.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 font-mono text-xs text-circuit-soft mb-2">
                  <span>{selectedMemory.tag}</span>
                  <span>·</span>
                  <span>{selectedMemory.date}</span>
                </div>
                <h3 className="font-display text-2xl text-paper font-bold leading-tight">
                  {selectedMemory.title}
                </h3>
                <p className="mt-3 font-sans text-sm text-paper/80 leading-relaxed italic border-l-2 border-circuit-soft pl-4 py-1">
                  "{selectedMemory.caption}"
                </p>
                <p className="mt-4 font-mono text-xs text-paper/50">
                  Konum: {selectedMemory.location}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
