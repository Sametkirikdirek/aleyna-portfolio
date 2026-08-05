import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, Crop, Scissors, Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import { uploadToCloudinary } from "../../lib/cloudinary";

/**
 * Serbest Kırpma & Görsel Büyütme Aracı (Free-form Cropper & Image Zoom)
 *
 * Özellikler:
 * 1. Görseli pop-up içerisinde %100 - %300 arası büyütme/küçültme (Zoom slider & scroll)
 * 2. Üzerinde serbest sürüklenebilir ve 8 noktadan boyutlandırılabilir kırpma kutusu
 * 3. ResizeObserver ile modal animasyonundan etkilenmeyen hassas sınır takibi
 * 4. Canvas üzerinden yüksek kaliteli kırpma ve Cloudinary yüklemesi
 */
export default function ImageAdjustModal({
  isOpen,
  onClose,
  imageUrl,
  onSave,
  title = "Görsel Kırpma & Hizalama",
}) {
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  // Base unscaled image dimensions
  const [imgDisplay, setImgDisplay] = useState({ w: 0, h: 0, natW: 0, natH: 0 });

  // Zoom scale factor (1.0x to 3.0x)
  const [zoom, setZoom] = useState(1);

  // Crop rectangle (relative to scaled image bounds, in px)
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 0, h: 0 });

  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(null); // null | "move" | "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w"
  const dragStart = useRef({ mx: 0, my: 0, cx: 0, cy: 0, cw: 0, ch: 0 });

  // Effective scaled display dimensions
  const scaledW = imgDisplay.w * zoom;
  const scaledH = imgDisplay.h * zoom;

  // Measure base image size accurately using clientWidth / clientHeight
  const measureImage = useCallback(() => {
    const img = imgRef.current;
    if (!img || !img.naturalWidth) return;

    const w = img.clientWidth || img.offsetWidth;
    const h = img.clientHeight || img.offsetHeight;
    const natW = img.naturalWidth;
    const natH = img.naturalHeight;

    if (w > 0 && h > 0) {
      setImgDisplay((prev) => {
        if (prev.w !== w || prev.h !== h) {
          if (prev.w === 0) {
            setCrop({ x: 0, y: 0, w: w * zoom, h: h * zoom });
          } else {
            const scaleX = (w * zoom) / (prev.w * zoom);
            const scaleY = (h * zoom) / (prev.h * zoom);
            setCrop((c) => ({
              x: c.x * scaleX,
              y: c.y * scaleY,
              w: c.w * scaleX,
              h: c.h * scaleY,
            }));
          }
        }
        return { w, h, natW, natH };
      });
    }
  }, [zoom]);

  // Use ResizeObserver for accurate initial measurement
  useEffect(() => {
    if (!isOpen) return;
    const img = imgRef.current;
    if (!img) return;

    const observer = new ResizeObserver(() => {
      measureImage();
    });
    observer.observe(img);
    measureImage();

    return () => observer.disconnect();
  }, [isOpen, measureImage, imageUrl]);

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setSaving(false);
      setDragging(null);
      setZoom(1);
      setImgDisplay({ w: 0, h: 0, natW: 0, natH: 0 });
    }
  }, [isOpen, imageUrl]);

  // Handle Zoom change
  const handleZoomChange = (newZoom) => {
    const clampedZoom = Math.max(1, Math.min(3, newZoom));
    const zoomRatio = clampedZoom / zoom;
    setZoom(clampedZoom);

    // Adjust crop proportionally to zoom
    setCrop((c) => {
      const sw = imgDisplay.w * clampedZoom;
      const sh = imgDisplay.h * clampedZoom;
      let newW = c.w * zoomRatio;
      let newH = c.h * zoomRatio;
      let newX = c.x * zoomRatio;
      let newY = c.y * zoomRatio;

      newW = Math.min(newW, sw);
      newH = Math.min(newH, sh);
      newX = Math.max(0, Math.min(newX, sw - newW));
      newY = Math.max(0, Math.min(newY, sh - newH));

      return { x: newX, y: newY, w: newW, h: newH };
    });
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    handleZoomChange(zoom + delta);
  };

  // ─── Drag & Clamp logic ───────────────────────────────
  const MIN_SIZE = 25;

  const clampCrop = useCallback((c) => {
    const sw = scaledW;
    const sh = scaledH;
    if (sw === 0 || sh === 0) return c;
    let { x, y, w, h } = c;

    w = Math.max(MIN_SIZE, w);
    h = Math.max(MIN_SIZE, h);

    x = Math.max(0, Math.min(x, sw - MIN_SIZE));
    y = Math.max(0, Math.min(y, sh - MIN_SIZE));

    w = Math.min(w, sw - x);
    h = Math.min(h, sh - y);

    return { x, y, w, h };
  }, [scaledW, scaledH]);

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

      const currentScaledW = imgDisplay.w * zoom;
      const currentScaledH = imgDisplay.h * zoom;

      const scaleX = img.naturalWidth / currentScaledW;
      const scaleY = img.naturalHeight / currentScaledH;

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
      }, "image/png", 0.95);
    } catch (err) {
      console.error("Crop error:", err);
      onSave(imageUrl);
      setSaving(false);
      onClose();
    }
  };

  const selectFullImage = () => {
    if (scaledW > 0 && scaledH > 0) {
      setCrop({
        x: 0,
        y: 0,
        w: scaledW,
        h: scaledH,
      });
    }
  };

  const resetAll = () => {
    setZoom(1);
    if (imgDisplay.w > 0 && imgDisplay.h > 0) {
      setCrop({
        x: 0,
        y: 0,
        w: imgDisplay.w,
        h: imgDisplay.h,
      });
    }
  };

  // Handle component for crop handles
  const Handle = ({ pos, cursor }) => {
    const style = {};
    if (pos.includes("n")) style.top = -6;
    if (pos.includes("s")) style.bottom = -6;
    if (pos.includes("w")) style.left = -6;
    if (pos.includes("e")) style.right = -6;

    if (pos === "n" || pos === "s") { style.left = "50%"; style.transform = "translateX(-50%)"; }
    if (pos === "w" || pos === "e") { style.top = "50%"; style.transform = "translateY(-50%)"; }

    const isCorner = pos.length === 2;
    const sizeClasses = isCorner
      ? "w-4 h-4 rounded-full"
      : pos === "n" || pos === "s"
      ? "w-7 h-3 rounded-full"
      : "w-3 h-7 rounded-full";

    return (
      <div
        className={`absolute ${sizeClasses} bg-rose-500 border-2 border-white z-30 shadow-lg hover:scale-125 transition-transform cursor-pointer`}
        style={{ ...style, cursor }}
        onPointerDown={(e) => onPointerDown(e, pos)}
      />
    );
  };

  if (!isOpen || !imageUrl) return null;

  // Real native pixel dimensions calculation
  const cropNatW = imgDisplay.natW > 0 ? Math.round(crop.w * (imgDisplay.natW / scaledW)) : 0;
  const cropNatH = imgDisplay.natH > 0 ? Math.round(crop.h * (imgDisplay.natH / scaledH)) : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          className="relative w-full max-w-4xl bg-[#111118] border border-white/12 rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[95vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <Crop size={18} className="text-rose-400" />
              <h3 className="text-base font-semibold tracking-tight">{title}</h3>
            </div>

            {/* Zoom Controls in Header */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-1 rounded-xl">
              <button
                onClick={() => handleZoomChange(zoom - 0.2)}
                disabled={zoom <= 1}
                className="text-white/60 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                title="Büyütmeyi Azalt"
              >
                <ZoomOut size={15} />
              </button>

              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                className="w-20 sm:w-28 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />

              <button
                onClick={() => handleZoomChange(zoom + 0.2)}
                disabled={zoom >= 3}
                className="text-white/60 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                title="Görseli Büyüt"
              >
                <ZoomIn size={15} />
              </button>

              <span className="font-mono text-xs text-rose-300 font-semibold min-w-[42px]">
                %{Math.round(zoom * 100)}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Info bar */}
          <div className="px-5 py-2 text-[11px] text-white/50 border-b border-white/5 shrink-0 flex items-center justify-between">
            <span>Dikdörtgeni <strong className="text-white/80">sürükleyin</strong>, tutamaçlardan <strong className="text-white/80">boyutlandırın</strong>, görseli <strong className="text-white/80">büyütüp yakınlaştırın</strong></span>
            {cropNatW > 0 && (
              <span className="font-mono text-rose-400 font-semibold">{cropNatW} × {cropNatH} px</span>
            )}
          </div>

          {/* Image + Free Crop Area */}
          <div
            className="flex-1 overflow-auto flex items-center justify-center bg-black/70 p-4 md:p-6 min-h-0"
            onWheel={handleWheel}
          >
            <div className="relative inline-block select-none" style={{ touchAction: "none" }}>
              {/* Image with dynamic zoom width/height */}
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Crop preview"
                onLoad={measureImage}
                className="block max-w-full max-h-[62vh] w-auto h-auto rounded-lg shadow-2xl"
                draggable={false}
                style={{
                  userSelect: "none",
                  width: imgDisplay.w > 0 ? `${scaledW}px` : "auto",
                  height: imgDisplay.h > 0 ? `${scaledH}px` : "auto",
                }}
              />

              {/* Dark Overlay Outside Crop Box */}
              {scaledW > 0 && (
                <>
                  {/* Top */}
                  <div
                    className="absolute left-0 top-0 bg-black/65 pointer-events-none"
                    style={{ width: scaledW, height: crop.y }}
                  />
                  {/* Bottom */}
                  <div
                    className="absolute left-0 bg-black/65 pointer-events-none"
                    style={{
                      width: scaledW,
                      top: crop.y + crop.h,
                      height: Math.max(0, scaledH - crop.y - crop.h),
                    }}
                  />
                  {/* Left */}
                  <div
                    className="absolute left-0 bg-black/65 pointer-events-none"
                    style={{
                      top: crop.y,
                      width: crop.x,
                      height: crop.h,
                    }}
                  />
                  {/* Right */}
                  <div
                    className="absolute bg-black/65 pointer-events-none"
                    style={{
                      top: crop.y,
                      left: crop.x + crop.w,
                      width: Math.max(0, scaledW - crop.x - crop.w),
                      height: crop.h,
                    }}
                  />

                  {/* Crop Box Frame */}
                  <div
                    className="absolute border-2 border-rose-500 z-20"
                    style={{
                      left: crop.x,
                      top: crop.y,
                      width: crop.w,
                      height: crop.h,
                      cursor: dragging === "move" ? "grabbing" : "grab",
                      boxShadow: "0 0 0 1px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.15)",
                    }}
                    onPointerDown={(e) => onPointerDown(e, "move")}
                  >
                    {/* Rule of Thirds Grid */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/20" />
                      <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/20" />
                      <div className="absolute top-1/3 left-0 right-0 h-px bg-white/20" />
                      <div className="absolute top-2/3 left-0 right-0 h-px bg-white/20" />
                    </div>

                    {/* Handles */}
                    <Handle pos="nw" cursor="nwse-resize" />
                    <Handle pos="ne" cursor="nesw-resize" />
                    <Handle pos="sw" cursor="nesw-resize" />
                    <Handle pos="se" cursor="nwse-resize" />

                    <Handle pos="n" cursor="ns-resize" />
                    <Handle pos="s" cursor="ns-resize" />
                    <Handle pos="w" cursor="ew-resize" />
                    <Handle pos="e" cursor="ew-resize" />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Hidden Canvas */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Footer Controls */}
          <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={selectFullImage}
                className="px-3.5 py-2 rounded-xl border border-white/15 text-white/70 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Fotoğrafın tamamını seç"
              >
                <Maximize2 size={13} className="text-rose-400" /> Tam Görsel
              </button>

              <button
                onClick={resetAll}
                className="px-3 py-2 rounded-xl border border-white/15 text-white/50 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Sıfırla"
              >
                <RefreshCw size={13} /> Sıfırla
              </button>
            </div>

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
