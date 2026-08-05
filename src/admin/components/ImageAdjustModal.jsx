import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, Move, Check, RefreshCw, Scissors, Sparkles } from "lucide-react";
import { uploadToCloudinary } from "../../lib/cloudinary";

export default function ImageAdjustModal({
  isOpen,
  onClose,
  imageUrl,
  onSave,
  aspectRatio = "capsule", // "capsule" | "card" | "square"
  title = "Görsel Hizalama ve Kırpma"
}) {
  const [zoom, setZoom] = useState(1);
  const [posX, setPosX] = useState(50); // 0% - 100%
  const [posY, setPosY] = useState(30); // 0% - 100%
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef(null);

  // Reset controls when new image opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPosX(50);
      setPosY(30);
    }
  }, [isOpen, imageUrl]);

  if (!isOpen || !imageUrl) return null;

  // Frame container dimensions preview
  const frameClasses =
    aspectRatio === "capsule"
      ? "w-36 h-56 rounded-full"
      : aspectRatio === "card"
      ? "w-44 h-60 rounded-2xl"
      : "w-48 h-48 rounded-2xl";

  const handleSaveCropped = async () => {
    setSaving(true);
    try {
      // Create cropped image using HTML5 Canvas
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = canvasRef.current || document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Set target crop resolution
      const targetW = aspectRatio === "capsule" ? 600 : aspectRatio === "card" ? 600 : 600;
      const targetH = aspectRatio === "capsule" ? 960 : aspectRatio === "card" ? 850 : 600;

      canvas.width = targetW;
      canvas.height = targetH;

      ctx.clearRect(0, 0, targetW, targetH);

      // Source scaling math based on zoom and offsets
      const imgAspect = img.width / img.height;
      const targetAspect = targetW / targetH;

      let drawW, drawH;
      if (imgAspect > targetAspect) {
        drawH = targetH * zoom;
        drawW = drawH * imgAspect;
      } else {
        drawW = targetW * zoom;
        drawH = drawW / imgAspect;
      }

      // Position math based on percentages
      const maxOffsetX = drawW - targetW;
      const maxOffsetY = drawH - targetH;

      const offsetX = -(maxOffsetX * (posX / 100));
      const offsetY = -(maxOffsetY * (posY / 100));

      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

      // Convert canvas to blob and upload to Cloudinary
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setSaving(false);
          return;
        }
        const file = new File([blob], "cropped_image.png", { type: "image/png" });
        const newUrl = await uploadToCloudinary(file, "cropped");
        onSave(newUrl);
        setSaving(false);
        onClose();
      }, "image/png", 0.95);
    } catch (err) {
      console.error("Cropping error:", err);
      // Fallback: save CSS object position
      onSave(imageUrl);
      setSaving(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className="relative w-full max-w-lg bg-[#12121a] border border-white/15 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Scissors size={20} className="text-rose-400" />
              <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Subtitle */}
          <p className="text-xs text-white/50 mt-3 mb-6">
            Kaydırıcıları kullanarak fotoğrafı çerçevenin ortasına tam istediğiniz açıyla hizalayın.
          </p>

          {/* Preview Canvas Area */}
          <div className="flex justify-center items-center py-6 bg-black/40 rounded-2xl border border-white/5 relative overflow-hidden">
            <div
              className={`relative overflow-hidden border-2 border-rose-500/80 shadow-[0_0_30px_rgba(244,63,94,0.3)] bg-ink ${frameClasses}`}
            >
              <img
                src={imageUrl}
                alt="Adjust preview"
                className="w-full h-full object-cover transition-all duration-75 select-none pointer-events-none"
                style={{
                  transform: `scale(${zoom})`,
                  objectPosition: `${posX}% ${posY}%`,
                }}
              />
              <div className="absolute inset-0 border border-white/20 pointer-events-none rounded-[inherit]" />
            </div>

            {/* Hidden canvas for exporting */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Sliders Controls */}
          <div className="space-y-4 mt-6">
            {/* Zoom Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-white/70">
                <span className="flex items-center gap-1.5">
                  <ZoomIn size={14} className="text-rose-400" /> Yakınlaştırma (Zoom)
                </span>
                <span className="text-rose-300 font-semibold">%{Math.round(zoom * 100)}</span>
              </div>
              <input
                type="range"
                min="1"
                max="2.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            {/* Vertical Position Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-white/70">
                <span className="flex items-center gap-1.5">
                  <Move size={14} className="text-amber-400" /> Dikey Odak (Y-Ekseni)
                </span>
                <span className="text-amber-300 font-semibold">{posY === 0 ? "Üst" : posY === 100 ? "Alt" : `%${posY}`}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={posY}
                onChange={(e) => setPosY(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Horizontal Position Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-white/70">
                <span className="flex items-center gap-1.5">
                  <Move size={14} className="text-cyan-400" /> Yatay Odak (X-Ekseni)
                </span>
                <span className="text-cyan-300 font-semibold">{posX === 0 ? "Sol" : posX === 100 ? "Sağ" : `%${posX}`}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={posX}
                onChange={(e) => setPosX(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 mt-8 pt-4 border-t border-white/10">
            <button
              onClick={() => {
                setZoom(1);
                setPosX(50);
                setPosY(30);
              }}
              className="px-4 py-2.5 rounded-xl border border-white/15 text-white/60 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={13} /> Sıfırla
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-white/15 text-white/70 hover:text-white text-xs font-medium transition-colors cursor-pointer"
              >
                İptal
              </button>

              <button
                onClick={handleSaveCropped}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-sans text-xs font-semibold shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Kırpılıyor & Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Check size={15} /> Kırp ve Kaydet
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
