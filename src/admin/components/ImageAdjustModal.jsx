import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, RefreshCw, Crop, Scissors } from "lucide-react";
import { uploadToCloudinary } from "../../lib/cloudinary";

/**
 * Serbest Kırpma Aracı (Free-form Cropper)
 *
 * Fotoğraf pop-up'ta tam görünür.
 * Üzerinde turuncu bir kırpma dikdörtgeni vardır.
 * Kullanıcı dikdörtgeni:
 *   - Ortasından sürükleyerek taşır
 *   - Köşelerinden ve kenarlarından sürükleyerek boyutlandırır
 *   - Kare, dikdörtgen, yatay, dikey istediği boyuta çeker
 * "Kırp ve Kaydet" → Canvas ile kırpıp Cloudinary'ye yükler.
 */
export default function ImageAdjustModal({
  isOpen,
  onClose,
  imageUrl,
  onSave,
  title = "Görsel Kırpma",
}) {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  // Displayed image dimensions (fitted to container)
  const [imgDisplay, setImgDisplay] = useState({ w: 0, h: 0, natW: 0, natH: 0 });

  // Crop rectangle (relative to displayed image, in px)
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 0, h: 0 });

  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(null); // null | "move" | "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w"
  const dragStart = useRef({ mx: 0, my: 0, cx: 0, cy: 0, cw: 0, ch: 0 });

  // Measure displayed image size after load
  const measureImage = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const rect = img.getBoundingClientRect();
    const natW = img.naturalWidth;
    const natH = img.naturalHeight;
    setImgDisplay({ w: rect.width, h: rect.height, natW, natH });

    // Default crop: 70% centered
    const cw = rect.width * 0.7;
    const ch = rect.height * 0.7;
    setCrop({
      x: (rect.width - cw) / 2,
      y: (rect.height - ch) / 2,
      w: cw,
      h: ch,
    });
  }, []);

  // Re-measure on window resize
  useEffect(() => {
    if (!isOpen) return;
    const handler = () => setTimeout(measureImage, 50);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [isOpen, measureImage]);

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setSaving(false);
      setDragging(null);
    }
  }, [isOpen, imageUrl]);

  // ─── Drag logic ───────────────────────────────────────
  const MIN_SIZE = 30;

  const clampCrop = useCallback((c) => {
    const { w: iw, h: ih } = imgDisplay;
    let { x, y, w, h } = c;
    w = Math.max(MIN_SIZE, Math.min(w, iw));
    h = Math.max(MIN_SIZE, Math.min(h, ih));
    x = Math.max(0, Math.min(x, iw - w));
    y = Math.max(0, Math.min(y, ih - h));
    return { x, y, w, h };
  }, [imgDisplay]);

  const onPointerDown = useCallback((e, handle) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(handle);
    dragStart.current = {
      mx: e.clientX,
      my: e.clientY,
      cx: crop.x,
      cy: crop.y,
      cw: crop.w,
      ch: crop.h,
    };
  }, [crop]);

  const onPointerMove = useCallback((e) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.mx;
    const dy = e.clientY - dragStart.current.my;
    const { cx, cy, cw, ch } = dragStart.current;

    let next;
    switch (dragging) {
      case "move":
        next = { x: cx + dx, y: cy + dy, w: cw, h: ch };
        break;
      case "se":
        next = { x: cx, y: cy, w: cw + dx, h: ch + dy };
        break;
      case "sw":
        next = { x: cx + dx, y: cy, w: cw - dx, h: ch + dy };
        break;
      case "ne":
        next = { x: cx, y: cy + dy, w: cw + dx, h: ch - dy };
        break;
      case "nw":
        next = { x: cx + dx, y: cy + dy, w: cw - dx, h: ch - dy };
        break;
      case "n":
        next = { x: cx, y: cy + dy, w: cw, h: ch - dy };
        break;
      case "s":
        next = { x: cx, y: cy, w: cw, h: ch + dy };
        break;
      case "e":
        next = { x: cx, y: cy, w: cw + dx, h: ch };
        break;
      case "w":
        next = { x: cx + dx, y: cy, w: cw - dx, h: ch };
        break;
      default:
        return;
    }
    setCrop(clampCrop(next));
  }, [dragging, clampCrop]);

  const onPointerUp = useCallback(() => {
    setDragging(null);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [dragging, onPointerMove, onPointerUp]);

  // ─── Crop & Save ─────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });

      const scaleX = img.naturalWidth / imgDisplay.w;
      const scaleY = img.naturalHeight / imgDisplay.h;

      const sx = crop.x * scaleX;
      const sy = crop.y * scaleY;
      const sw = crop.w * scaleX;
      const sh = crop.h * scaleY;

      const canvas = canvasRef.current || document.createElement("canvas");
      canvas.width = Math.round(sw);
      canvas.height = Math.round(sh);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob) { setSaving(false); return; }
        const file = new File([blob], "cropped.png", { type: "image/png" });
        const url = await uploadToCloudinary(file, "cropped");
        onSave(url);
        setSaving(false);
        onClose();
      }, "image/png", 0.92);
    } catch (err) {
      console.error("Crop error:", err);
      onSave(imageUrl);
      setSaving(false);
      onClose();
    }
  };

  const resetCrop = () => {
    const cw = imgDisplay.w * 0.7;
    const ch = imgDisplay.h * 0.7;
    setCrop({
      x: (imgDisplay.w - cw) / 2,
      y: (imgDisplay.h - ch) / 2,
      w: cw,
      h: ch,
    });
  };

  // Corner handle component
  const Handle = ({ pos, cursor }) => {
    const style = {};
    if (pos.includes("n")) style.top = -5;
    if (pos.includes("s")) style.bottom = -5;
    if (pos.includes("w")) style.left = -5;
    if (pos.includes("e")) style.right = -5;

    // Center handles for edges
    if (pos === "n" || pos === "s") { style.left = "50%"; style.transform = "translateX(-50%)"; }
    if (pos === "w" || pos === "e") { style.top = "50%"; style.transform = "translateY(-50%)"; }

    const isCorner = pos.length === 2;
    const size = isCorner ? "w-3.5 h-3.5" : pos === "n" || pos === "s" ? "w-6 h-2.5" : "w-2.5 h-6";

    return (
      <div
        className={`absolute ${size} bg-rose-500 border border-rose-300 rounded-sm z-30 shadow-md hover:bg-rose-400 transition-colors`}
        style={{ ...style, cursor }}
        onPointerDown={(e) => onPointerDown(e, pos)}
      />
    );
  };

  if (!isOpen || !imageUrl) return null;

  // Crop dimensions info
  const cropNatW = imgDisplay.natW > 0 ? Math.round(crop.w * (imgDisplay.natW / imgDisplay.w)) : 0;
  const cropNatH = imgDisplay.natH > 0 ? Math.round(crop.h * (imgDisplay.natH / imgDisplay.h)) : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 12 }}
          className="relative w-full max-w-3xl bg-[#111118] border border-white/12 rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[95vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <Crop size={18} className="text-rose-400" />
              <h3 className="text-base font-semibold tracking-tight">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Info */}
          <div className="px-5 py-2 text-[11px] text-white/45 border-b border-white/5 shrink-0 flex items-center justify-between">
            <span>Dikdörtgeni <strong className="text-white/70">sürükleyin</strong>, köşelerinden <strong className="text-white/70">boyutlandırın</strong></span>
            {cropNatW > 0 && (
              <span className="font-mono text-rose-300/70">{cropNatW} × {cropNatH} px</span>
            )}
          </div>

          {/* Image + Crop Area */}
          <div
            ref={containerRef}
            className="flex-1 overflow-auto flex items-center justify-center bg-black/60 p-4 md:p-6 min-h-0"
          >
            <div className="relative inline-block select-none" style={{ touchAction: "none" }}>
              {/* The image itself */}
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Crop preview"
                onLoad={measureImage}
                className="block max-w-full max-h-[60vh] w-auto h-auto rounded-lg"
                draggable={false}
                style={{ userSelect: "none" }}
              />

              {/* Dark overlay outside crop area (4 dark rectangles) */}
              {imgDisplay.w > 0 && (
                <>
                  {/* Top */}
                  <div
                    className="absolute left-0 top-0 bg-black/60 pointer-events-none"
                    style={{ width: imgDisplay.w, height: crop.y }}
                  />
                  {/* Bottom */}
                  <div
                    className="absolute left-0 bg-black/60 pointer-events-none"
                    style={{
                      width: imgDisplay.w,
                      top: crop.y + crop.h,
                      height: imgDisplay.h - crop.y - crop.h,
                    }}
                  />
                  {/* Left */}
                  <div
                    className="absolute left-0 bg-black/60 pointer-events-none"
                    style={{
                      top: crop.y,
                      width: crop.x,
                      height: crop.h,
                    }}
                  />
                  {/* Right */}
                  <div
                    className="absolute bg-black/60 pointer-events-none"
                    style={{
                      top: crop.y,
                      left: crop.x + crop.w,
                      width: imgDisplay.w - crop.x - crop.w,
                      height: crop.h,
                    }}
                  />

                  {/* Crop Rectangle Border */}
                  <div
                    className="absolute border-2 border-rose-500 z-20"
                    style={{
                      left: crop.x,
                      top: crop.y,
                      width: crop.w,
                      height: crop.h,
                      cursor: dragging === "move" ? "grabbing" : "grab",
                      boxShadow: "0 0 0 1px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.08)",
                    }}
                    onPointerDown={(e) => onPointerDown(e, "move")}
                  >
                    {/* Rule of thirds grid lines */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/15" />
                      <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/15" />
                      <div className="absolute top-1/3 left-0 right-0 h-px bg-white/15" />
                      <div className="absolute top-2/3 left-0 right-0 h-px bg-white/15" />
                    </div>

                    {/* Corner handles */}
                    <Handle pos="nw" cursor="nw-resize" />
                    <Handle pos="ne" cursor="ne-resize" />
                    <Handle pos="sw" cursor="sw-resize" />
                    <Handle pos="se" cursor="se-resize" />

                    {/* Edge handles */}
                    <Handle pos="n" cursor="n-resize" />
                    <Handle pos="s" cursor="s-resize" />
                    <Handle pos="w" cursor="w-resize" />
                    <Handle pos="e" cursor="e-resize" />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Hidden canvas */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-white/10 shrink-0">
            <button
              onClick={resetCrop}
              className="px-3.5 py-2 rounded-xl border border-white/15 text-white/60 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={13} /> Sıfırla
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-white/15 text-white/60 hover:text-white text-xs font-medium transition-colors cursor-pointer"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-semibold shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Kırpılıyor...
                  </>
                ) : (
                  <>
                    <Scissors size={14} /> Kırp ve Kaydet
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
