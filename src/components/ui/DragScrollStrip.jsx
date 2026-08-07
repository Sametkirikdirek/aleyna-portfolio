import { useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * DragScrollStrip
 * David DeSandro photo-scroller physics engine.
 * - Mouse/touch drag: full DeSandro friction + rubber-band boundary forces
 * - Arrow buttons: direct smooth lerp to target (NO boundary spring, NO lock)
 */
export default function DragScrollStrip({ children, className = "", showControls = true }) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);

  // Physics state
  const positionX = useRef(0);
  const velocityX = useRef(0);
  const isDragging = useRef(false);

  // Drag tracking
  const dragStartX = useRef(0);
  const particleDragStartX = useRef(0);
  const dragPositionX = useRef(0);
  const hasMoved = useRef(false);

  // Arrow animation state (separate from drag)
  const targetX = useRef(null); // null = no active arrow animation
  const animFrameId = useRef(null);

  const FRICTION = 0.91;

  // ─── helpers ────────────────────────────────────────────────────────────────

  const getLeftBound = () => {
    if (!containerRef.current || !trackRef.current) return -9999;
    return Math.min(0, containerRef.current.clientWidth - trackRef.current.scrollWidth);
  };

  const getCardStep = () => {
    if (!trackRef.current?.firstElementChild) return 280;
    const gap = parseFloat(window.getComputedStyle(trackRef.current).gap) || 16;
    return trackRef.current.firstElementChild.getBoundingClientRect().width + gap;
  };

  // ─── physics loop ────────────────────────────────────────────────────────────

  const updatePhysics = useCallback(() => {
    const leftBound = getLeftBound();

    if (targetX.current !== null) {
      // ── Arrow mode: smooth lerp to target, NO boundary spring ──
      const diff = targetX.current - positionX.current;
      const lerpForce = (diff - velocityX.current) * 0.25;
      velocityX.current += lerpForce;
      velocityX.current *= FRICTION;
      positionX.current += velocityX.current;

      const remaining = Math.abs(targetX.current - positionX.current);
      if (remaining < 0.4 && Math.abs(velocityX.current) < 0.2) {
        // Arrived — snap to exact target and stop
        positionX.current = targetX.current;
        velocityX.current = 0;
        targetX.current = null;
        trackRef.current.style.transform = `translate3d(${positionX.current}px, 0, 0)`;
        animFrameId.current = null;
        return;
      }

    } else if (isDragging.current) {
      // ── Drag mode: DeSandro drag force + boundary rubber-band ──
      const dragVel = dragPositionX.current - positionX.current;
      const dragForce = (dragVel - velocityX.current) * 0.38;
      velocityX.current += dragForce;

      // Rubber-band boundary forces (only during drag)
      const applyBound = (bound, isRight) => {
        const outside = isRight ? positionX.current > bound : positionX.current < bound;
        if (!outside) return;
        const dist = bound - positionX.current;
        const force = dist * 0.14;
        const restX = positionX.current + (velocityX.current + force) * FRICTION / (1 - FRICTION);
        const willOvershoot = isRight ? restX > bound : restX < bound;
        velocityX.current += willOvershoot ? force : (dist * 0.14 - velocityX.current);
      };
      applyBound(0, true);         // right boundary (start)
      applyBound(leftBound, false); // left boundary (end)

      velocityX.current *= FRICTION;
      positionX.current += velocityX.current;

    } else {
      // ── Release/coast mode: friction decay + boundary spring ──
      const applyBound = (bound, isRight) => {
        const outside = isRight ? positionX.current > bound : positionX.current < bound;
        if (!outside) return;
        const dist = bound - positionX.current;
        const force = dist * 0.14;
        const restX = positionX.current + (velocityX.current + force) * FRICTION / (1 - FRICTION);
        const willOvershoot = isRight ? restX > bound : restX < bound;
        velocityX.current += willOvershoot ? force : (dist * 0.14 - velocityX.current);
      };
      applyBound(0, true);
      applyBound(leftBound, false);

      velocityX.current *= FRICTION;
      positionX.current += velocityX.current;
    }

    // Render
    trackRef.current.style.transform = `translate3d(${positionX.current}px, 0, 0)`;

    // Continue?
    const isOutside = positionX.current > 0.5 || positionX.current < leftBound - 0.5;
    const isMoving = Math.abs(velocityX.current) > 0.03;

    if (isDragging.current || targetX.current !== null || isMoving || isOutside) {
      animFrameId.current = requestAnimationFrame(updatePhysics);
    } else {
      // Final snap
      if (positionX.current > 0) positionX.current = 0;
      if (positionX.current < leftBound) positionX.current = leftBound;
      velocityX.current = 0;
      trackRef.current.style.transform = `translate3d(${positionX.current}px, 0, 0)`;
      animFrameId.current = null;
    }
  }, []);

  const startLoop = useCallback(() => {
    if (!animFrameId.current) {
      animFrameId.current = requestAnimationFrame(updatePhysics);
    }
  }, [updatePhysics]);

  // ─── Arrow controls ──────────────────────────────────────────────────────────

  const scrollPrev = useCallback(() => {
    const step = getCardStep();
    const next = Math.min(0, positionX.current + step);
    targetX.current = next;
    startLoop();
  }, [startLoop]);

  const scrollNext = useCallback(() => {
    const leftBound = getLeftBound();
    const step = getCardStep();
    const next = Math.max(leftBound, positionX.current - step);
    targetX.current = next;
    startLoop();
  }, [startLoop]);

  // ─── Mouse events ────────────────────────────────────────────────────────────

  const onMousedown = useCallback((e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    isDragging.current = true;
    targetX.current = null; // cancel any arrow animation
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
    if (Math.abs(moveX) > 4) hasMoved.current = true;
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

  // ─── Touch events ────────────────────────────────────────────────────────────

  const onTouchStart = useCallback((e) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    isDragging.current = true;
    targetX.current = null;
    hasMoved.current = false;
    dragStartX.current = t.pageX;
    particleDragStartX.current = positionX.current;
    dragPositionX.current = positionX.current;
    startLoop();
  }, [startLoop]);

  const onTouchMove = useCallback((e) => {
    if (!isDragging.current || e.touches.length !== 1) return;
    const t = e.touches[0];
    const moveX = t.pageX - dragStartX.current;
    if (Math.abs(moveX) > 4) hasMoved.current = true;
    dragPositionX.current = particleDragStartX.current + moveX;
    startLoop();
  }, [startLoop]);

  const onTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    startLoop();
  }, [startLoop]);

  // ─── Click-through guard ─────────────────────────────────────────────────────

  const onClickCapture = useCallback((e) => {
    if (hasMoved.current) {
      e.stopPropagation();
      e.preventDefault();
      hasMoved.current = false;
    }
  }, []);

  // ─── Cleanup ─────────────────────────────────────────────────────────────────

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

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="relative z-10 overflow-hidden group/strip">
      {/* Edge fade gradients */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-3 w-8 bg-gradient-to-r from-ink-soft/90 to-transparent z-20 rounded-l-xl" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-3 w-8 bg-gradient-to-l from-ink-soft/90 to-transparent z-20 rounded-r-xl" />

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

      {/* Physics container */}
      <div
        ref={containerRef}
        className={`overflow-hidden pb-3 cursor-grab select-none ${className}`}
        onMouseDown={onMousedown}
        onMouseMove={onMousemove}
        onMouseUp={onMouseup}
        onMouseLeave={onMouseup}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
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
