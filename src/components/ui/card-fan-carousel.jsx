import { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

const MAX_VISIBLE = 7;
const HALF = 3;

const FAN_POSITIONS = [
  { rot: -21, scale: 0.7756, x: -24, y: 6.0, zIndex: 1 },
  { rot: -14, scale: 0.8498, x: -17, y: 3.5, zIndex: 2 },
  { rot: -7,  scale: 0.9346, x: -9,  y: 1.2, zIndex: 3 },
  { rot: 0,   scale: 1.0,    x: 0,   y: 0.0, zIndex: 10 },
  { rot: 7,   scale: 0.9346, x: 9,   y: 1.2, zIndex: 3 },
  { rot: 14,  scale: 0.8498, x: 17,  y: 3.5, zIndex: 2 },
  { rot: 21,  scale: 0.7756, x: 24,  y: 6.0, zIndex: 1 },
];

function getResponsiveMultiplier(width) {
  if (width < 380) return 0.18;
  if (width < 480) return 0.21;
  if (width < 640) return 0.32;
  if (width < 768) return 0.45;
  if (width < 1024) return 0.62;
  return 0.80;
}

function getHeightMultiplier(width) {
  let idealPx;
  if (width < 480) idealPx = 20 * 16;
  else if (width < 640) idealPx = 24 * 16;
  else if (width < 768) idealPx = 26 * 16;
  else if (width < 1024) idealPx = 32 * 16;
  else idealPx = 36 * 16;

  const available = window.innerHeight * 0.7;
  if (available >= idealPx) return 1;
  return available / idealPx;
}

function getSlotConfig(totalCards, slot) {
  if (totalCards >= MAX_VISIBLE) return FAN_POSITIONS[slot];
  const center = totalCards >> 1;
  const distance = totalCards > 1 ? (slot - center) / center : 0;
  const absDistance = Math.abs(distance);
  return {
    rot: distance * 21,
    scale: 1.0 - 0.2244 * absDistance * absDistance,
    x: distance * 24,
    y: absDistance * absDistance * 6.0,
    zIndex: 10 - Math.abs(slot - center),
  };
}

const ARROW_CLASSES =
  "relative flex items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white/80 cursor-pointer shrink-0 z-30 outline-none shadow-lg hover:border-white/40 hover:text-white hover:bg-white/20 active:scale-95 transition-all duration-300";

export default function SocialCards({ cards = [] }) {
  const containerRef = useRef(null);
  const isAnimating = useRef(false);
  const hasEntered = useRef(false);
  const directionRef = useRef(null);
  const prevVisible = useRef(new Set());

  // Touch / Swipe Tracking Refs
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const totalCards = cards.length;
  const needsPagination = totalCards > MAX_VISIBLE;
  const [centerIndex, setCenterIndex] = useState(needsPagination ? HALF : totalCards >> 1);

  const getVisibleMap = useCallback((center) => {
    const map = new Map();
    if (!needsPagination) {
      cards.forEach((_, i) => map.set(i, i));
      return map;
    }
    for (let slot = 0; slot < MAX_VISIBLE; slot++) {
      map.set(((center + slot - HALF) % totalCards + totalCards) % totalCards, slot);
    }
    return map;
  }, [totalCards, needsPagination, cards]);

  const cycle = useCallback((direction) => {
    if (isAnimating.current || !needsPagination) return;
    isAnimating.current = true;
    directionRef.current = direction;
    setCenterIndex(prev =>
      direction === "right" ? (prev + 1) % totalCards : (prev - 1 + totalCards) % totalCards
    );
  }, [totalCards, needsPagination]);

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      touchStartX.current = e.touches[0].clientX;
      touchEndX.current = e.touches[0].clientX;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      touchEndX.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    const threshold = 35; // px swipe sensitivity
    if (Math.abs(swipeDistance) > threshold) {
      if (swipeDistance > 0) {
        cycle("right"); // Swiped left -> next card
      } else {
        cycle("left"); // Swiped right -> prev card
      }
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !totalCards) return;

    const cardElements = Array.from(container.querySelectorAll(".fan-card"));
    if (!cardElements.length) return;

    const visibleMap = getVisibleMap(centerIndex);
    const previouslyVisible = prevVisible.current;
    const direction = directionRef.current;
    const isFirstMount = !hasEntered.current;
    const multiplier = getResponsiveMultiplier(window.innerWidth);
    const hMult = getHeightMultiplier(window.innerWidth);
    const slotCount = needsPagination ? MAX_VISIBLE : totalCards;
    const config = (slot) => getSlotConfig(slotCount, slot);

    if (isFirstMount) isAnimating.current = true;

    let completedCount = 0;
    const visibleCount = visibleMap.size;
    const onCardDone = () => {
      if (++completedCount >= visibleCount) {
        isAnimating.current = false;
        if (isFirstMount) hasEntered.current = true;
      }
    };

    cardElements.forEach((card, cardIndex) => {
      const slot = visibleMap.get(cardIndex);
      const wasVisible = previouslyVisible.has(cardIndex);

      if (slot !== undefined) {
        const { x, y, rot, scale, zIndex } = config(slot);
        const target = {
          x: `${x * multiplier}rem`,
          y: `${y * hMult}rem`,
          rotation: rot,
          scale,
          opacity: 1,
          zIndex,
        };

        if (isFirstMount) {
          gsap.set(card, { x: 0, y: `${12 * hMult}rem`, rotation: 0, scale: 0.5, opacity: 0 });
          gsap.to(card, { ...target, duration: 1.2, ease: "elastic.out(1.05,.78)", delay: 0.2 + slot * 0.06, onComplete: onCardDone });
        } else if (!wasVisible) {
          const enterX = direction === "right" ? 40 : -40;
          gsap.set(card, { x: `${enterX}rem`, y: `${y * hMult}rem`, rotation: direction === "right" ? 30 : -30, scale: 0.5, opacity: 0 });
          gsap.to(card, { ...target, duration: 0.6, ease: "power2.out", onComplete: onCardDone });
        } else {
          gsap.to(card, { ...target, duration: 0.5, ease: "power2.out", onComplete: onCardDone });
        }
      } else if (wasVisible) {
        const exitX = direction === "right" ? -40 : 40;
        gsap.to(card, { x: `${exitX}rem`, opacity: 0, scale: 0.5, rotation: direction === "right" ? -30 : 30, duration: 0.4, ease: "power2.in", zIndex: 0 });
      } else if (isFirstMount) {
        gsap.set(card, { opacity: 0, scale: 0.3, x: 0, y: 0, zIndex: 0 });
      }
    });

    prevVisible.current = new Set(visibleMap.keys());

    // Hover interactions
    const visibleEntries = [];
    cardElements.forEach((el, i) => {
      const slot = visibleMap.get(i);
      if (slot !== undefined) visibleEntries.push({ el, slot });
    });
    visibleEntries.sort((a, b) => a.slot - b.slot);

    let activeSlot = null;
    let leaveTimer = null;
    const centerSlot = visibleEntries.length >> 1;

    const updateHoverLayout = (hoveredSlot) => {
      const mult = getResponsiveMultiplier(window.innerWidth);
      const hM = getHeightMultiplier(window.innerWidth);

      visibleEntries.forEach(({ el, slot }) => {
        const base = config(slot);
        let targetX = base.x * mult;
        let targetY = base.y * hM;
        let targetRot = base.rot;
        let targetScale = base.scale;
        let delay = 0;

        if (hoveredSlot !== null) {
          const distance = Math.abs(slot - hoveredSlot);
          delay = distance * 0.02;

          if (slot === hoveredSlot) {
            targetY -= 2.5 * hM;
            targetScale *= 1.08;
          } else {
            const normalized = centerSlot > 0 ? (slot - centerSlot) / centerSlot : 0;
            const pushStrength = 8 * (1 - Math.abs(normalized)) * (1 + 0.2 * Math.max(0, 3 - distance));

            if (slot < hoveredSlot) {
              targetX -= pushStrength * mult;
              targetRot -= 3 / (distance + 1);
            } else {
              targetX += pushStrength * mult;
              targetRot += 3 / (distance + 1);
            }

            if (slot === visibleEntries.length - 1 && hoveredSlot < centerSlot) targetY -= 1 * hM;
            if (slot === 0 && hoveredSlot > centerSlot) targetY -= 1 * hM;
          }
        } else {
          delay = Math.abs(slot - centerSlot) * 0.02;
        }

        gsap.to(el, {
          x: `${targetX}rem`, y: `${targetY}rem`, rotation: targetRot, scale: targetScale,
          duration: 0.5, delay, ease: "elastic.out(1,.75)", overwrite: "auto",
        });
        gsap.set(el, { zIndex: base.zIndex });
      });
    };

    const enterHandlers = visibleEntries.map(({ el, slot }) => {
      const handler = () => {
        if (isAnimating.current) return;
        if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null; }
        if (activeSlot !== slot) { activeSlot = slot; updateHoverLayout(slot); }
      };
      el.addEventListener("mouseenter", handler);
      return { el, handler };
    });

    const onMouseLeave = () => {
      if (isAnimating.current) return;
      if (leaveTimer) clearTimeout(leaveTimer);
      leaveTimer = setTimeout(() => { activeSlot = null; updateHoverLayout(null); }, 50);
    };
    container.addEventListener("mouseleave", onMouseLeave);

    const onResize = () => { if (!isAnimating.current) updateHoverLayout(activeSlot); };
    window.addEventListener("resize", onResize);

    return () => {
      enterHandlers.forEach(({ el, handler }) => el.removeEventListener("mouseenter", handler));
      container.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", onResize);
      if (leaveTimer) clearTimeout(leaveTimer);
    };
  }, [centerIndex, totalCards, getVisibleMap, needsPagination]);

  if (!totalCards) return null;

  const visibleMap = getVisibleMap(centerIndex);
  const centerSlot = needsPagination ? HALF : (totalCards >> 1);

  const chevron = (direction) => (
    <svg className="relative z-[2] w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points={direction === "left" ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
    </svg>
  );

  return (
    <section className="flex flex-col items-center w-full py-2 lg:py-6 px-1 md:px-4 relative z-20 overflow-visible select-none">
      <div className="flex items-center justify-center w-full max-w-[42rem]">
        <div
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="fan-layout flex relative justify-center items-center w-full h-[16.5rem] sm:h-[19rem] md:h-[24rem] touch-pan-y"
        >
          {cards.map((card, index) => {
            const slot = visibleMap.get(index);
            const isCenterCard = slot === centerSlot;

            const cardContent = (
              <div
                className={`relative w-[8.5rem] h-[12.5rem] sm:w-[10rem] sm:h-[14.5rem] md:w-[12rem] md:h-[17rem] rounded-2xl overflow-hidden shadow-2xl border-2 transition-all duration-300 bg-ink group ${
                  isCenterCard
                    ? "border-rose-400/80 shadow-[0_0_25px_rgba(244,63,94,0.3)] cursor-pointer"
                    : "border-white/20 opacity-90 cursor-pointer"
                }`}
              >
                <img
                  src={card.imgUrl || card.image}
                  loading="lazy"
                  alt={card.alt || card.title || `Card ${index}`}
                  className="absolute inset-0 w-full h-full object-cover z-10"
                />
                {card.title && (
                  <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20 text-white font-mono text-[10px] sm:text-[11px] font-medium leading-tight">
                    {card.title}
                  </div>
                )}

                {/* Öne Çıkan Aktif Kart Rozeti */}
                {isCenterCard && (
                  <div className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded-full bg-rose-600/90 text-white font-mono text-[9px] tracking-wider uppercase shadow-md backdrop-blur-sm">
                    Aktif
                  </div>
                )}
              </div>
            );

            const link = card.linkUrl || card.link;

            const handleCardClick = (e) => {
              // Yan kart tıklandığında: Kartı öne getir!
              if (!isCenterCard) {
                e.preventDefault();
                e.stopPropagation();
                if (slot < centerSlot) {
                  cycle("left");
                } else if (slot > centerSlot) {
                  cycle("right");
                }
              }
              // Ortadaki karta tıklandığında link normal çalışır
            };

            return link ? (
              <a
                key={index}
                href={isCenterCard ? link : "#"}
                target={isCenterCard && link.startsWith("http") ? "_blank" : "_self"}
                rel="noopener noreferrer"
                onClick={handleCardClick}
                className="fan-card absolute transition-transform"
              >
                {cardContent}
              </a>
            ) : (
              <div
                key={index}
                onClick={handleCardClick}
                className="fan-card absolute transition-transform"
              >
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>

      {needsPagination && (
        <div className="flex items-center justify-center gap-3 sm:gap-4 mt-2 md:mt-4 z-30">
          <button className={`${ARROW_CLASSES} w-9 h-9 md:w-10 md:h-10`} onClick={() => cycle("left")} aria-label="Previous">
            {chevron("left")}
          </button>
          <div className="flex items-center gap-1.5">
            {cards.map((_, i) => (
              <span key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === centerIndex ? "bg-rose-400 scale-[1.3]" : "bg-white/20"}`} />
            ))}
          </div>
          <button className={`${ARROW_CLASSES} w-9 h-9 md:w-10 md:h-10`} onClick={() => cycle("right")} aria-label="Next">
            {chevron("right")}
          </button>
        </div>
      )}
    </section>
  );
}
