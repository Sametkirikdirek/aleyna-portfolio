import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { paintings } from "@/data/content";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Grid, X, ZoomIn, History } from "lucide-react";
import { KeyboardEvent, useMemo, useState } from "react";
import InfiniteGallery from "./infinite-gallery";

const unsplashImages = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
  "https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=800",
  "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800",
  "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800",
  "https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=800",
  "https://images.unsplash.com/photo-1579783902610-a3fb79679b11?w=800",
];

function categoryFromMedium(medium: string) {
  if (medium.includes("akrilik")) return "Akrilik";
  if (medium.includes("yağlı")) return "Yağlı Boya";
  if (medium.includes("suluboya")) return "Suluboya";
  return "Karışık Teknik";
}

const defaultGalleryImages = paintings.map((painting, index) => ({
  id: index + 1,
  url: painting.image || unsplashImages[index] || unsplashImages[0],
  title: painting.title,
  category: categoryFromMedium(painting.medium),
  year: painting.year,
  medium: painting.medium,
  note: painting.note,
}));

export type GalleryImage = (typeof defaultGalleryImages)[number];

type GalleryGridBlockProps = {
  images?: GalleryImage[];
};

export function GalleryGridBlock({ images = defaultGalleryImages }: GalleryGridBlockProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("Tümü");
  const [activeTab, setActiveTab] = useState<"galeri" | "zaman-yolculugu">("galeri");

  const categories = useMemo(
    () => ["Tümü", ...new Set(images.map((img) => img.category))],
    [images]
  );

  const filteredImages =
    filter === "Tümü" ? images : images.filter((img) => img.category === filter);

  const handleNext = () => {
    if (selectedImage === null) return;
    const currentIndex = filteredImages.findIndex((img) => img.id === selectedImage);
    const nextIndex = (currentIndex + 1) % filteredImages.length;
    setSelectedImage(filteredImages[nextIndex].id);
  };

  const handlePrev = () => {
    if (selectedImage === null) return;
    const currentIndex = filteredImages.findIndex((img) => img.id === selectedImage);
    const prevIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    setSelectedImage(filteredImages[prevIndex].id);
  };

  const selectedImageData = images.find((img) => img.id === selectedImage);

  const handleCardKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    imageId: number
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedImage(imageId);
    }
  };

  const infiniteGalleryImages = useMemo(() => {
    return images.map((img) => ({ src: img.url, alt: img.title }));
  }, [images]);

  return (
    <section
      className="w-full bg-background px-4 py-16 pt-28 md:pt-32"
      aria-labelledby="gallery-heading"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center flex flex-col items-center"
          role="region"
          aria-labelledby="gallery-heading"
        >
          <div className="flex gap-4 mb-4">
            <Badge 
              variant={activeTab === "galeri" ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => setActiveTab("galeri")}
            >
              <Grid className="mr-1 h-3 w-3" />
              Galeri
            </Badge>
            <Badge 
              variant={activeTab === "zaman-yolculugu" ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => setActiveTab("zaman-yolculugu")}
            >
              <History className="mr-1 h-3 w-3" />
              Zaman Yolculuğu
            </Badge>
          </div>
          <h2
            id="gallery-heading"
            className="font-display mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl"
          >
            Tuval üzerine seçkiler
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            {activeTab === "galeri" 
              ? "Görsele dokun, eserin hikâyesini ve teknik detaylarını gör."
              : "Mouse tekerleği, yön tuşları veya dokunarak zamanda yolculuk yapın."}
          </p>
        </motion.div>

        {activeTab === "galeri" ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8 flex flex-wrap justify-center gap-2"
              role="group"
              aria-label="Galeri kategorileri"
            >
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={filter === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(category)}
                  aria-pressed={filter === category}
                >
                  {category}
                </Button>
              ))}
            </motion.div>

            <motion.div
              layout
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              role="list"
              aria-label="Galeri öğeleri"
            >
              <AnimatePresence mode="popLayout">
                {filteredImages.map((image, index) => (
                  <motion.div
                    key={image.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    role="listitem"
                  >
                    <Card
                      className="group relative cursor-pointer overflow-hidden border-border py-0 transition-all hover:border-ring hover:shadow-xl"
                      onClick={() => setSelectedImage(image.id)}
                      onKeyDown={(event) => handleCardKeyDown(event, image.id)}
                      role="button"
                      tabIndex={0}
                      aria-label={`${image.title} eserini görüntüle`}
                    >
                      <div className="relative aspect-[4/5] overflow-hidden">
                        <motion.img
                          src={image.url}
                          alt={image.title}
                          className="h-full w-full object-cover"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                        />

                        <motion.div
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
                          aria-hidden="true"
                        >
                          <ZoomIn className="mb-2 h-8 w-8 text-muted-foreground" />
                          <h3 className="mb-1 text-center font-display text-lg font-semibold text-muted-foreground">
                            {image.title}
                          </h3>
                          <Badge variant="secondary">{image.category}</Badge>
                        </motion.div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            <AnimatePresence>
              {selectedImage !== null && selectedImageData && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
                  onClick={() => setSelectedImage(null)}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="gallery-dialog-title"
                  aria-describedby="gallery-dialog-description"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative max-h-[90vh] max-w-5xl"
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute -right-2 top-0 text-muted-foreground hover:bg-white/10 md:-right-12"
                      onClick={() => setSelectedImage(null)}
                      aria-label="Galeriyi kapat"
                    >
                      <X className="h-6 w-6" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:bg-white/10 md:left-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrev();
                      }}
                      aria-label="Önceki eser"
                    >
                      <ChevronLeft className="h-8 w-8" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:bg-white/10 md:right-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                      }}
                      aria-label="Sonraki eser"
                    >
                      <ChevronRight className="h-8 w-8" />
                    </Button>

                    <motion.img
                      key={selectedImage}
                      src={selectedImageData.url}
                      alt={selectedImageData.title}
                      className="max-h-[70vh] w-auto rounded-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="mt-4 text-center text-muted-foreground"
                      id="gallery-dialog-description"
                    >
                      <p className="mb-1 font-mono text-xs uppercase tracking-widest text-primary">
                        {selectedImageData.year}
                      </p>
                      <h3
                        className="mb-2 font-display text-xl font-semibold text-foreground"
                        id="gallery-dialog-title"
                      >
                        {selectedImageData.title}
                      </h3>
                      <p className="mb-3 text-sm">{selectedImageData.note}</p>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <Badge variant="secondary">{selectedImageData.category}</Badge>
                        <Badge variant="outline">{selectedImageData.medium}</Badge>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full h-[70vh] rounded-xl overflow-hidden border border-border"
          >
            <InfiniteGallery images={infiniteGalleryImages} />
          </motion.div>
        )}
      </div>
    </section>
  );
}
