import { useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * DragScrollStrip
 * David DeSandro (practical-ui-physics / Flickity) photo-scroller physics engine.
 * Fully supports desktop mouse drag, mobile touch swipe, and smooth 1-card target spring animation for arrows.
 */
export default function DragScrollStrip({ children, className = "", showControls = true }) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);

  // DeSandro Physics Variables
  const positionX = useRef(0);
  const dragPositionX = useRef(0);
  const velocityX = useRef(0);
  const friction = 0.90;
  const isDragging = useRef(false);
  const isAnimatingTarget = useRef(false);

  const dragStartX = useRef(0);
  const particleDragStartX = useRef(0);
  const hasMoved = useRef(false);
  const animFrameId = useRef(null);

  const applyForce = (force) => {
    velocityX.current += force;
  };

  const applyDragForce = () => {
    if (!isDragging.current && !isAnimatingTarget.current) return;

    const dragVelocity = dragPositionX.current - positionX.current;
    const dragForce = (dragVelocity - velocityX.current) * 0.28;
    applyForce(dragForce);

    // Settle target animation once arrived near target card
    if (!isDragging.current && isAnimatingTarget.current) {
      if (Math.abs(dragVelocity) < 0.5 && Math.abs(velocityX.current) < 0.2) {
        positionX.current = dragPositionX.current;
        velocityX.current = 0;
        isAnimatingTarget.current = false;
      }
    }
  };

  const applyBoundForce = (bound, isForward) => {
    const isInside = isForward ? positionX.current < bound : positionX.current > bound;
    if (isDragging.current || isInside) return;

    const distance = bound - positionX.current;
    const force = distance * 0.14;
    const restX = positionX.current + (velocityX.current + force) * friction / (1 - friction);
    const isRestOutside = isForward ? restX > bound : restX < bound;

    if (isRestOutside) {
      applyForce(force);
      return;
    }
    // Bounce back align
    const bounceForce = distance * 0.14 - velocityX.current;
    applyForce(bounceForce);
  };

  const getLeftBound = useCallback(() => {
    if (!containerRef.current || !trackRef.current) return -2000;
    const containerWidth = containerRef.current.clientWidth;
    const trackWidth = trackRef.current.scrollWidth;
    let bound = containerWidth - trackWidth;

    // Safety fallback if trackWidth layout hasn't populated yet
    if (bound >= 0 && trackRef.current.children.length > 1) {
      const step = getCardStepWidth();
      bound = -(trackRef.current.children.length * step - containerWidth);
    }
    return Math.min(-10, bound);
  }, [getCardStepWidth]);

  const updatePhysics = useCallback(() => {
    if (!containerRef.current || !trackRef.current) return;

    const rightBound = 0; // left edge (0)
    const leftBound = getLeftBound(); // right edge (negative offset)

    // 1) Apply Drag / Target Attraction Force
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

    // Continue loop if moving, dragging, animating target or rebounding
    const isOutside = pos > 0.5 || pos < leftBound - 0.5;
    const isMoving = Math.abs(velocityX.current) > 0.03;

    if (isDragging.current || isAnimatingTarget.current || isMoving || isOutside) {
      animFrameId.current = requestAnimationFrame(updatePhysics);
    } else {
      // Snap neatly to exact bound
      if (pos > 0) positionX.current = 0;
      if (pos < leftBound) positionX.current = leftBound;
      velocityX.current = 0;
      trackRef.current.style.transform = `translate3d(${positionX.current}px, 0, 0)`;
      animFrameId.current = null;
    }
  }, [friction, getLeftBound]);

  const startLoop = useCallback(() => {
    if (!animFrameId.current) {
      animFrameId.current = requestAnimationFrame(updatePhysics);
    }
  }, [updatePhysics]);

  // Arrow controls: Smooth 1-card step without extra spring bounce
  const scrollPrev = useCallback(() => {
    if (!containerRef.current || !trackRef.current) return;
    const step = getCardStepWidth();
    const nextPos = Math.min(0, positionX.current + step);
    dragPositionX.current = nextPos;
    isAnimatingTarget.current = true;
    startLoop();
  }, [getCardStepWidth, startLoop]);

  const scrollNext = useCallback(() => {
    if (!containerRef.current || !trackRef.current) return;
    const leftBound = getLeftBound();
    const step = getCardStepWidth();
    const nextPos = Math.max(leftBound, positionX.current - step);
    dragPositionX.current = nextPos;
    isAnimatingTarget.current = true;
    startLoop();
  }, [getCardStepWidth, getLeftBound, startLoop]);

  // Desktop Mouse Events
  const onMousedown = useCallback((e) => {
    if (e.button !== 0) return;
    e.preventDefault();

    isDragging.current = true;
    isAnimatingTarget.current = false;
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

  // Mobile Touch Events
  const onTouchStart = useCallback((e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    isDragging.current = true;
    isAnimatingTarget.current = false;
    hasMoved.current = false;

    dragStartX.current = touch.pageX;
    particleDragStartX.current = positionX.current;
    dragPositionX.current = positionX.current;

    startLoop();
  }, [startLoop]);

  const onTouchMove = useCallback((e) => {
    if (!isDragging.current || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const moveX = touch.pageX - dragStartX.current;
    if (Math.abs(moveX) > 4) {
      hasMoved.current = true;
    }
    dragPositionX.current = particleDragStartX.current + moveX;
    startLoop();
  }, [startLoop]);

  const onTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
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

      {/* Left/Right Navigation Arrow Overlay Buttons (Smooth 1-card step) */}
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

      {/* DeSandro Physics Container for Mouse & Touch */}
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
