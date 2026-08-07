import { useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * DragScrollStrip
 * David DeSandro (practical-ui-physics / Flickity) photo-scroller physics engine.
 * Uses 1:1 exact DeSandro bound attraction, friction momentum, and GPU translate3d rendering.
 */
export default function DragScrollStrip({ children, className = "", showControls = true }) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);

  // DeSandro Physics Variables
  const positionX = useRef(0);
  const dragPositionX = useRef(0);
  const velocityX = useRef(0);
  const friction = 0.92;
  const isDragging = useRef(false);

  const dragStartX = useRef(0);
  const particleDragStartX = useRef(0);
  const hasMoved = useRef(false);
  const animFrameId = useRef(null);

  const applyForce = (force) => {
    velocityX.current += force;
  };

  const applyDragForce = () => {
    if (!isDragging.current) return;
    const dragVelocity = dragPositionX.current - positionX.current;
    const dragForce = (dragVelocity - velocityX.current) * 0.35;
    applyForce(dragForce);
  };

  const applyBoundForce = (bound, isForward) => {
    const isInside = isForward ? positionX.current < bound : positionX.current > bound;
    if (isDragging.current || isInside) return;

    const distance = bound - positionX.current;
    const force = distance * 0.12;
    const restX = positionX.current + (velocityX.current + force) * friction / (1 - friction);
    const isRestOutside = isForward ? restX > bound : restX < bound;

    if (isRestOutside) {
      applyForce(force);
      return;
    }
    // Bounce back align
    const bounceForce = distance * 0.12 - velocityX.current;
    applyForce(bounceForce);
  };

  const updatePhysics = useCallback(() => {
    if (!containerRef.current || !trackRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const trackWidth = trackRef.current.scrollWidth;

    const rightBound = 0; // left edge
    const leftBound = Math.min(0, containerWidth - trackWidth); // right edge (negative offset)

    // 1) Apply Drag Force
    applyDragForce();

    // 2) Apply DeSandro Boundary Forces
    applyBoundForce(rightBound, true);
    applyBoundForce(leftBound, false);

    // 3) Integrate Friction & Position
    velocityX.current *= friction;
    positionX.current += velocityX.current;

    // 4) Render via GPU translate3d
    const pos = positionX.current;
    trackRef.current.style.transform = `translate3d(${pos}px, 0, 0)`;

    // Continue loop if moving, dragging or rebounding
    const isOutside = pos > 0.5 || pos < leftBound - 0.5;
    const isMoving = Math.abs(velocityX.current) > 0.03;

    if (isDragging.current || isMoving || isOutside) {
      animFrameId.current = requestAnimationFrame(updatePhysics);
    } else {
      // Snap neatly to exact bound
      if (pos > 0) positionX.current = 0;
      if (pos < leftBound) positionX.current = leftBound;
      velocityX.current = 0;
      trackRef.current.style.transform = `translate3d(${positionX.current}px, 0, 0)`;
      animFrameId.current = null;
    }
  }, [friction]);

  const startLoop = useCallback(() => {
    if (!animFrameId.current) {
      animFrameId.current = requestAnimationFrame(updatePhysics);
    }
  }, [updatePhysics]);

  // Calculate single card step width
  const getCardStepWidth = useCallback(() => {
    if (!trackRef.current || !trackRef.current.firstElementChild) return 272;
    const cardEl = trackRef.current.firstElementChild;
    const style = window.getComputedStyle(trackRef.current);
    const gap = parseFloat(style.gap) || 16;
    return cardEl.getBoundingClientRect().width + gap;
  }, []);

  // Arrow controls: Smooth single card step using DeSandro momentum impulse
  const scrollPrev = useCallback(() => {
    if (!containerRef.current || !trackRef.current) return;
    const step = getCardStepWidth();
    dragPositionX.current = Math.min(0, positionX.current + step);
    velocityX.current = 14;
    startLoop();
  }, [getCardStepWidth, startLoop]);

  const scrollNext = useCallback(() => {
    if (!containerRef.current || !trackRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const trackWidth = trackRef.current.scrollWidth;
    const leftBound = Math.min(0, containerWidth - trackWidth);
    const step = getCardStepWidth();
    dragPositionX.current = Math.max(leftBound, positionX.current - step);
    velocityX.current = -14;
    startLoop();
  }, [getCardStepWidth, startLoop]);

  const onMousedown = useCallback((e) => {
    if (e.button !== 0) return;
    e.preventDefault();

    isDragging.current = true;
    hasMoved.current = false;

    dragStartX.current = e.pageX;
    particleDragStartX.current = positionX.current;
    dragPositionX.current = positionX.current;

    if (containerRef.current) {
      containerRef.current.style.cursor = "grabbing";
      containerRef.current.style.userSelect = "none";
    }

    startLoop();
  }, [startLoop]);

  const onMousemove = useCallback((e) => {
    if (!isDragging.current) return;
    const moveX = e.pageX - dragStartX.current;
    if (Math.abs(moveX) > 4) {
      hasMoved.current = true;
    }
    dragPositionX.current = particleDragStartX.current + moveX;
    startLoop();
  }, [startLoop]);

  const onMouseup = useCallback(() => {
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

      {/* Left/Right Navigation Arrow Overlay Buttons (DeSandro physics 1-card step) */}
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

      {/* DeSandro Physics Container */}
      <div
        ref={containerRef}
        className={`overflow-hidden pb-3 cursor-grab select-none ${className}`}
        onMouseDown={onMousedown}
        onMouseMove={onMousemove}
        onMouseUp={onMouseup}
        onMouseLeave={onMouseup}
        onClickCapture={onClickCapture}
      >
        <div
          ref={trackRef}
          className="flex gap-4 w-max"
          style={{ willChange: "transform" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
