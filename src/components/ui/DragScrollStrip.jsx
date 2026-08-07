import { useState, useRef, useCallback, useEffect } from "react";

/**
 * DragScrollStrip
 * Mouse drag + touch scroll horizontal container with spring rubber-band bounce.
 * Supports dragging over images without trigger native browser image drag.
 */
export default function DragScrollStrip({ children, className = "" }) {
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const hasDragged = useRef(false);
  
  const [bounceOffset, setBounceOffset] = useState(0);
  const [isReleasing, setIsReleasing] = useState(false);

  const onMouseDown = useCallback((e) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    hasDragged.current = false;
    setIsReleasing(false);
    startX.current = e.pageX;
    scrollLeft.current = scrollRef.current.scrollLeft;
    scrollRef.current.style.cursor = "grabbing";
    scrollRef.current.style.userSelect = "none";
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!isDragging.current || !scrollRef.current) return;
    
    const deltaX = e.pageX - startX.current;
    if (Math.abs(deltaX) > 4) {
      hasDragged.current = true;
    }

    const container = scrollRef.current;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const targetScroll = scrollLeft.current - deltaX * 1.2;

    if (targetScroll < 0) {
      // Rubber-band elastic over-scroll at left edge
      container.scrollLeft = 0;
      const elastic = Math.pow(Math.abs(targetScroll), 0.72) * 1.6;
      setBounceOffset(elastic);
    } else if (targetScroll > maxScroll && maxScroll > 0) {
      // Rubber-band elastic over-scroll at right edge
      container.scrollLeft = maxScroll;
      const elastic = -Math.pow(targetScroll - maxScroll, 0.72) * 1.6;
      setBounceOffset(elastic);
    } else {
      container.scrollLeft = Math.max(0, targetScroll);
      setBounceOffset(0);
    }
  }, []);

  const onMouseUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (scrollRef.current) {
      scrollRef.current.style.cursor = "grab";
      scrollRef.current.style.userSelect = "";
    }
    setIsReleasing(true);
    setBounceOffset(0);
  }, []);

  // Prevent native image drag (browser default behavior) so images can be dragged smoothly
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleDragStart = (e) => e.preventDefault();
    el.addEventListener("dragstart", handleDragStart);
    return () => el.removeEventListener("dragstart", handleDragStart);
  }, []);

  // Prevent click firing after a drag
  const onClickCapture = useCallback((e) => {
    if (hasDragged.current) {
      e.stopPropagation();
      e.preventDefault();
      hasDragged.current = false;
    }
  }, []);

  return (
    <div className="relative z-10 overflow-hidden">
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-3 w-8 bg-gradient-to-r from-ink-soft/90 to-transparent z-20 rounded-l-xl" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-3 w-8 bg-gradient-to-l from-ink-soft/90 to-transparent z-20 rounded-r-xl" />

      <div
        ref={scrollRef}
        className={`flex gap-4 overflow-x-auto pb-3 scrollbar-none snap-x snap-mandatory cursor-grab select-none ${className}`}
        style={{ WebkitOverflowScrolling: "touch" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onClickCapture={onClickCapture}
      >
        <div
          className="flex gap-4 w-full transition-transform"
          style={{
            transform: `translateX(${bounceOffset}px)`,
            transition: isReleasing
              ? "transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
              : "none",
            willChange: "transform",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
