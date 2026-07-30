import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw } from "lucide-react";
import { paintings, galleryImagesPool } from "../data/content";
import PaintingCanvas from "./PaintingCanvas";

// Fisher-Yates shuffle algoritması
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Gallery() {
  const [active, setActive] = useState(null);
  const [items, setItems] = useState(paintings);

  // Sayfa her yüklendiğinde / yenilendiğinde görselleri karıştırıyoruz
  useEffect(() => {
    const shuffledImages = shuffleArray(galleryImagesPool);
    const randomized = paintings.map((p, index) => ({
      ...p,
      image: shuffledImages[index % shuffledImages.length],
    }));
    setItems(randomized);
  }, []);

  const handleShuffle = () => {
    const shuffledImages = shuffleArray(galleryImagesPool);
    const randomized = items.map((p, index) => ({
      ...p,
      image: shuffledImages[index % shuffledImages.length],
    }));
    setItems(randomized);
  };

  return (
    <section className="min-h-screen px-6 md:px-10 pt-28 pb-24 md:pt-32 md:pb-32 bg-ink">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 md:mb-16 flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="font-mono text-xs tracking-[0.25em] uppercase text-brush-soft mb-4">
              Galeri
            </p>
            <h2 className="font-display text-3xl md:text-5xl text-paper leading-tight text-balance">
              Tuval üzerine seçkiler
            </h2>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
            <p className="font-sans text-sm text-paper/50 max-w-xs md:text-right">
              Görsele dokun, eserin hikâyesini ve teknik detaylarını gör.
            </p>
            <button
              onClick={handleShuffle}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-brush-soft hover:text-paper transition-colors py-1 px-3 rounded-full border border-paper/10 bg-paper/5"
              title="Sergiyi Karıştır"
            >
              <RefreshCw size={13} />
              Yenile & Karıştır
            </button>
          </div>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {items.map((p, i) => (
            <motion.button
              key={p.id}
              onClick={() => setActive(p)}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              className="group relative aspect-[4/5] rounded-lg overflow-hidden text-left bg-ink-soft"
            >
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : null}
              <PaintingCanvas
                seed={p.seed}
                palette={p.palette}
                className="absolute inset-0 -z-10 w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/0 to-ink/0 opacity-80 group-hover:opacity-95 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="font-display text-lg text-paper leading-snug">{p.title}</p>
                <p className="font-mono text-xs text-paper/60 mt-1">
                  {p.year} · {p.medium}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-ink/95 backdrop-blur-sm flex items-center justify-center p-5 md:p-10"
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-3xl w-full grid md:grid-cols-[1.1fr_0.9fr] gap-0 bg-ink-soft rounded-xl overflow-hidden border border-paper/10"
            >
              <div className="relative aspect-square md:aspect-auto md:h-full overflow-hidden bg-ink min-h-[300px]">
                {active.image ? (
                  <img
                    src={active.image}
                    alt={active.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <PaintingCanvas seed={active.seed} palette={active.palette} className="w-full h-full" />
                )}
              </div>
              <div className="p-7 md:p-9 relative">
                <button
                  onClick={() => setActive(null)}
                  className="absolute top-5 right-5 text-paper/60 hover:text-paper"
                  aria-label="Kapat"
                >
                  <X size={20} />
                </button>
                <p className="font-mono text-xs tracking-[0.2em] uppercase text-brush-soft mb-3">
                  {active.year}
                </p>
                <h3 className="font-display text-2xl text-paper leading-snug">{active.title}</h3>
                <p className="mt-4 font-sans text-sm text-paper/70 leading-relaxed">{active.note}</p>
                <dl className="mt-6 space-y-2 font-mono text-xs text-paper/50">
                  <div className="flex justify-between border-b border-paper/10 pb-2">
                    <dt>Teknik</dt>
                    <dd className="text-paper/75">{active.medium}</dd>
                  </div>
                  <div className="flex justify-between border-b border-paper/10 pb-2">
                    <dt>Ölçü</dt>
                    <dd className="text-paper/75">{active.size}</dd>
                  </div>
                </dl>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
