import { useRef, useCallback } from "react";

/**
 * DragScrollStrip
 * Mouse drag + touch scroll horizontal container.
 * Children are laid out in a flex row.
 */
export default function DragScrollStrip({ children, className = "" }) {
  const ref = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const hasDragged = useRef(false);

  const onMouseDown = useCallback((e) => {
    if (!ref.current) return;
    isDragging.current = true;
    hasDragged.current = false;
    startX.current = e.pageX - ref.current.offsetLeft;
    scrollLeft.current = ref.current.scrollLeft;
    ref.current.style.cursor = "grabbing";
    ref.current.style.userSelect = "none";
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!isDragging.current || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX.current) * 1.4;
    if (Math.abs(walk) > 4) hasDragged.current = true;
    ref.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  const onMouseUp = useCallback(() => {
    if (!ref.current) return;
    isDragging.current = false;
    ref.current.style.cursor = "grab";
    ref.current.style.userSelect = "";
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
    <div className="relative z-10">
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-3 w-10 bg-gradient-to-r from-ink-soft/90 to-transparent z-20 rounded-l-xl" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-3 w-10 bg-gradient-to-l from-ink-soft/90 to-transparent z-20 rounded-r-xl" />

      <div
        ref={ref}
        className={`flex gap-4 overflow-x-auto pb-3 scrollbar-none snap-x snap-mandatory cursor-grab select-none ${className}`}
        style={{ WebkitOverflowScrolling: "touch" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onClickCapture={onClickCapture}
      >
        {children}
      </div>
    </div>
  );
}
