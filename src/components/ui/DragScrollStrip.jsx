import { useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * DragScrollStrip
 * 100% fluid, continuous horizontal scroll container with particle spring physics & arrow navigation.
 * Removed CSS snap-x snap-mandatory so scrolling is completely smooth free-flow without step-by-step locking.
 */
export default function DragScrollStrip({ children, className = "", showControls = true }) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);

  // Physics simulation variables
  const positionX = useRef(0);
  const velocityX = useRef(0);
  const dragPositionX = useRef(0);
  const isDragging = useRef(false);
  const mousedownX = useRef(0);
  const dragStartPositionX = useRef(0);
  const hasMoved = useRef(false);
  const animFrameId = useRef(null);

  const friction = 0.94;

  const animate = useCallback(() => {
    if (!containerRef.current || !trackRef.current) return;

    const container = containerRef.current;
    const track = trackRef.current;
    const rightBound = Math.max(0, container.scrollWidth - container.clientWidth);

    let pos = positionX.current;
    let vel = velocityX.current;
    const dragging = isDragging.current;

    // 1) Apply drag force
    if (dragging) {
      const dragVelocity = dragPositionX.current - pos;
      const dragForce = (dragVelocity - vel) * 0.4;
      vel += dragForce;
    } 
    // 2) Apply left bound force (0)
    else if (pos < 0) {
      const distance = 0 - pos;
      const force = distance * 0.12;
      const restX = pos + (vel + force) / (1 - friction);
      if (restX < 0) {
        vel += force;
      } else {
        const alignForce = distance * 0.12 - vel;
        vel += alignForce;
      }
    } 
    // 3) Apply right bound force (rightBound)
    else if (pos > rightBound && rightBound > 0) {
      const distance = rightBound - pos;
      const force = distance * 0.12;
      const restX = pos + (vel + force) / (1 - friction);
      if (restX > rightBound) {
        vel += force;
      } else {
        const alignForce = distance * 0.12 - vel;
        vel += alignForce;
      }
    }

    // 4) Apply friction and position update
    vel *= friction;
    pos += vel;

    positionX.current = pos;
    velocityX.current = vel;

    // 5) Render to DOM with GPU acceleration
    if (pos >= 0 && pos <= rightBound) {
      container.scrollLeft = pos;
      track.style.transform = "translate3d(0, 0, 0)";
    } else if (pos < 0) {
      container.scrollLeft = 0;
      track.style.transform = `translate3d(${-pos}px, 0, 0)`;
    } else {
      container.scrollLeft = rightBound;
      track.style.transform = `translate3d(${rightBound - pos}px, 0, 0)`;
    }

    // Continue animation loop
    const isOutOfBounds = pos < -0.1 || pos > rightBound + 0.1;
    const isMoving = Math.abs(vel) > 0.02;

    if (dragging || isMoving || isOutOfBounds) {
      animFrameId.current = requestAnimationFrame(animate);
    } else {
      // Snap neatly at resting position
      if (pos < 0) positionX.current = 0;
      if (pos > rightBound) positionX.current = rightBound;
      velocityX.current = 0;
      track.style.transform = "translate3d(0, 0, 0)";
      animFrameId.current = null;
    }
  }, [friction]);

  const startLoop = useCallback(() => {
    if (!animFrameId.current) {
      animFrameId.current = requestAnimationFrame(animate);
    }
  }, [animate]);

  const scrollPrev = useCallback(() => {
    if (!containerRef.current) return;
    const amount = Math.max(220, containerRef.current.clientWidth * 0.65);
    positionX.current = Math.max(0, positionX.current - amount);
    dragPositionX.current = positionX.current;
    velocityX.current = -14;
    startLoop();
  }, [startLoop]);

  const scrollNext = useCallback(() => {
    if (!containerRef.current) return;
    const rightBound = Math.max(0, containerRef.current.scrollWidth - containerRef.current.clientWidth);
    const amount = Math.max(220, containerRef.current.clientWidth * 0.65);
    positionX.current = Math.min(rightBound, positionX.current + amount);
    dragPositionX.current = positionX.current;
    velocityX.current = 14;
    startLoop();
  }, [startLoop]);

  const onMouseDown = useCallback((e) => {
    if (!containerRef.current || e.button !== 0) return;

    isDragging.current = true;
    hasMoved.current = false;

    // Sync pos with current scrollLeft
    const currentScroll = containerRef.current.scrollLeft;
    positionX.current = currentScroll;
    dragStartPositionX.current = currentScroll;
    dragPositionX.current = currentScroll;
    velocityX.current = 0;

    mousedownX.current = e.pageX;

    containerRef.current.style.cursor = "grabbing";
    containerRef.current.style.userSelect = "none";

    startLoop();
  }, [startLoop]);

  const onMouseMove = useCallback((e) => {
    if (!isDragging.current) return;

    const moveX = e.pageX - mousedownX.current;
    if (Math.abs(moveX) > 3) {
      hasMoved.current = true;
    }

    // Move in scroll direction
    dragPositionX.current = dragStartPositionX.current - moveX * 1.15;

    startLoop();
  }, [startLoop]);

  const onMouseUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (containerRef.current) {
      containerRef.current.style.cursor = "grab";
      containerRef.current.style.userSelect = "";
    }

    startLoop();
  }, [startLoop]);

  // Prevent native browser image drag
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const preventDrag = (e) => e.preventDefault();
    el.addEventListener("dragstart", preventDrag);
    return () => {
      el.removeEventListener("dragstart", preventDrag);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
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

      {/* Left/Right Navigation Arrow Overlay Buttons */}
      {showControls && (
        <>
          <button
            onClick={scrollPrev}
            aria-label="Önceki eserler"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-ink/85 text-paper border border-paper/20 hover:border-rose-500/50 hover:text-rose-300 hover:scale-110 active:scale-95 shadow-xl transition-all cursor-pointer backdrop-blur-md opacity-80 group-hover/strip:opacity-100"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={scrollNext}
            aria-label="Sonraki eserler"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-ink/85 text-paper border border-paper/20 hover:border-rose-500/50 hover:text-rose-300 hover:scale-110 active:scale-95 shadow-xl transition-all cursor-pointer backdrop-blur-md opacity-80 group-hover/strip:opacity-100"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Free-flow Scroll Container (No snap-x mandatory) */}
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
          style={{ willChange: "transform" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
