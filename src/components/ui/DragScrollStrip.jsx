import { useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * DragScrollStrip
 * Clamped rail container (no off-rail sliding outside container) + smooth 1-card arrow navigation.
 */
export default function DragScrollStrip({ children, className = "", showControls = true }) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);

  const isDragging = useRef(false);
  const mousedownX = useRef(0);
  const dragStartPositionX = useRef(0);
  const hasMoved = useRef(false);

  // Calculate single card step width (card width + flex gap)
  const getCardStepWidth = useCallback(() => {
    if (!trackRef.current || !trackRef.current.firstElementChild) return 272;
    const cardEl = trackRef.current.firstElementChild;
    const style = window.getComputedStyle(trackRef.current);
    const gap = parseFloat(style.gap) || 16;
    return cardEl.getBoundingClientRect().width + gap;
  }, []);

  // Smooth scroll 1 card to the left
  const scrollPrev = useCallback(() => {
    if (!containerRef.current) return;
    const step = getCardStepWidth();
    containerRef.current.scrollBy({ left: -step, behavior: "smooth" });
  }, [getCardStepWidth]);

  // Smooth scroll 1 card to the right
  const scrollNext = useCallback(() => {
    if (!containerRef.current) return;
    const step = getCardStepWidth();
    containerRef.current.scrollBy({ left: step, behavior: "smooth" });
  }, [getCardStepWidth]);

  const onMouseDown = useCallback((e) => {
    if (!containerRef.current || e.button !== 0) return;

    isDragging.current = true;
    hasMoved.current = false;

    mousedownX.current = e.pageX;
    dragStartPositionX.current = containerRef.current.scrollLeft;

    containerRef.current.style.cursor = "grabbing";
    containerRef.current.style.userSelect = "none";
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!isDragging.current || !containerRef.current) return;

    const moveX = e.pageX - mousedownX.current;
    if (Math.abs(moveX) > 3) {
      hasMoved.current = true;
    }

    const container = containerRef.current;
    const rightBound = Math.max(0, container.scrollWidth - container.clientWidth);
    const targetScroll = dragStartPositionX.current - moveX * 1.15;

    // Clamp strictly within [0, rightBound] so cards NEVER go off-rail
    container.scrollLeft = Math.max(0, Math.min(rightBound, targetScroll));
  }, []);

  const onMouseUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (containerRef.current) {
      containerRef.current.style.cursor = "grab";
      containerRef.current.style.userSelect = "";
    }
  }, []);

  // Prevent native browser image drag
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const preventDrag = (e) => e.preventDefault();
    el.addEventListener("dragstart", preventDrag);
    return () => el.removeEventListener("dragstart", preventDrag);
  }, []);

  const onClickCapture = useCallback((e) => {
    if (hasMoved.current) {
      e.stopPropagation();
      e.preventDefault();
      hasMoved.current = false;
    }
  }, []);

  return (
    <div className="relative z-10 overflow-hidden group/strip">
      {/* Edge Fade Gradients */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-3 w-8 bg-gradient-to-r from-ink-soft/90 to-transparent z-20 rounded-l-xl" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-3 w-8 bg-gradient-to-l from-ink-soft/90 to-transparent z-20 rounded-r-xl" />

      {/* Left/Right Navigation Arrow Overlay Buttons (Smooth 1-card scroll) */}
      {showControls && (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Önceki eser"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-ink/85 text-paper border border-paper/20 hover:border-rose-500/50 hover:text-rose-300 hover:scale-110 active:scale-95 shadow-2xl transition-all cursor-pointer backdrop-blur-md opacity-80 group-hover/strip:opacity-100"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            type="button"
            onClick={scrollNext}
            aria-label="Sonraki eser"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-ink/85 text-paper border border-paper/20 hover:border-rose-500/50 hover:text-rose-300 hover:scale-110 active:scale-95 shadow-2xl transition-all cursor-pointer backdrop-blur-md opacity-80 group-hover/strip:opacity-100"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Rail Clamped Scroll Container */}
      <div
        ref={containerRef}
        className={`flex gap-4 overflow-x-auto pb-3 scrollbar-none cursor-grab select-none ${className}`}
        style={{ WebkitOverflowScrolling: "touch" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onClickCapture={onClickCapture}
      >
        <div
          ref={trackRef}
          className="flex gap-4 w-full"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
