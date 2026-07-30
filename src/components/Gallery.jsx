import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, Maximize2 } from "lucide-react";
import { paintings } from "../data/content";
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

  // Sayfa her yüklendiğinde / yenilendiğinde eserlerin dizilimini karıştırıyoruz (isim + resim eşleşmesi %100 korunur)
  useEffect(() => {
    setItems(shuffleArray(paintings));
  }, []);

  const handleShuffle = () => {
    setItems(shuffleArray(paintings));
  };

  return (
    <section className="min-h-screen px-6 md:px-10 pt-28 pb-24 md:pt-32 md:pb-32 bg-ink">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 md:mb-16 flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="font-mono text-xs tracking-[0.25em] uppercase text-brush-soft mb-4">
              Galeri & Seçkiler
            </p>
            <h2 className="font-display text-3xl md:text-5xl text-paper leading-tight text-balance">
              Tuval ve Kodun Kesişimi
            </h2>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
            <p className="font-sans text-sm text-paper/50 max-w-xs md:text-right">
              Eser ismine veya görsele dokunarak hikâyesini ve detaylarını inceleyebilirsiniz.
            </p>
            <button
              onClick={handleShuffle}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-brush-soft hover:text-paper transition-all py-1.5 px-3.5 rounded-full border border-paper/15 bg-paper/5 hover:bg-paper/10 hover:border-brush-soft/50 shadow-sm"
              title="Sergiyi Karıştır"
            >
              <RefreshCw size={13} />
              Sergiyi Karıştır
            </button>
          </div>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
          {items.map((p, i) => (
            <motion.button
              key={p.id}
              onClick={() => setActive(p)}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              className="group relative aspect-[4/5] rounded-xl overflow-hidden text-left bg-ink-soft border border-paper/10 shadow-lg hover:border-brush-soft/40 transition-all duration-500"
            >
              {/* Eser Görseli */}
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.07]"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : null}

              {/* Generative Canvas Yedeği */}
              <PaintingCanvas
                seed={p.seed}
                palette={p.palette}
                className="absolute inset-0 -z-10 w-full h-full"
              />

              {/* Üst Rozet (Yıl & Rozet) */}
              <div className="absolute top-3.5 right-3.5 z-10">
                <span className="font-mono text-[11px] px-2.5 py-1 rounded-full backdrop-blur-md bg-ink/75 text-brush-soft border border-paper/15 shadow-sm">
                  {p.year}
                </span>
              </div>

              {/* İnceleme İkonu (Hover'da beliren) */}
              <div className="absolute top-3.5 left-3.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="p-2 rounded-full backdrop-blur-md bg-ink/80 text-paper border border-paper/20 inline-flex items-center justify-center">
                  <Maximize2 size={13} />
                </span>
              </div>

              {/* Alt Metin / İsim Alanı (Estetik Glassmorphism Kartı) */}
              <div className="absolute inset-x-0 bottom-0 p-4 pt-10 bg-gradient-to-t from-ink via-ink/90 to-transparent">
                <div className="backdrop-blur-md bg-ink/85 border border-paper/10 rounded-lg p-3.5 transition-colors group-hover:border-brush-soft/50 group-hover:bg-ink/95">
                  <h3 className="font-display text-lg text-paper font-semibold leading-snug group-hover:text-brush-soft transition-colors">
                    {p.title}
                  </h3>
                  <p className="font-mono text-xs text-paper/60 mt-1 flex items-center justify-between">
                    <span>{p.medium}</span>
                    <span className="text-[10px] text-circuit-soft">{p.size}</span>
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Lightbox / Detay Modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-ink/95 backdrop-blur-md flex items-center justify-center p-5 md:p-10"
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-3xl w-full grid md:grid-cols-[1.1fr_0.9fr] gap-0 bg-ink-soft rounded-2xl overflow-hidden border border-paper/15 shadow-2xl"
            >
              {/* Sol Taraf: Görsel */}
              <div className="relative aspect-square md:aspect-auto md:h-full overflow-hidden bg-ink min-h-[320px]">
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

              {/* Sağ Taraf: Metin & Detaylar */}
              <div className="p-7 md:p-9 relative flex flex-col justify-between">
                <div>
                  <button
                    onClick={() => setActive(null)}
                    className="absolute top-5 right-5 text-paper/60 hover:text-paper p-1 rounded-full hover:bg-paper/10 transition-colors"
                    aria-label="Kapat"
                  >
                    <X size={20} />
                  </button>
                  <p className="font-mono text-xs tracking-[0.2em] uppercase text-brush-soft mb-3">
                    {active.year} · Seçki
                  </p>
                  <h3 className="font-display text-2xl md:text-3xl text-paper font-bold leading-tight">
                    {active.title}
                  </h3>
                  <p className="mt-4 font-sans text-sm text-paper/75 leading-relaxed">
                    {active.note}
                  </p>
                </div>

                <dl className="mt-8 space-y-3 font-mono text-xs border-t border-paper/10 pt-4 text-paper/60">
                  <div className="flex justify-between border-b border-paper/10 pb-2">
                    <dt className="text-paper/40">Teknik & Stil</dt>
                    <dd className="text-paper/90 font-medium">{active.medium}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-paper/40">Boyut / Ölçü</dt>
                    <dd className="text-paper/90 font-medium">{active.size}</dd>
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
