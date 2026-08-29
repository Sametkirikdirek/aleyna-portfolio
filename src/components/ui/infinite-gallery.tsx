/**
 * InfiniteGallery — Tunnel-scroll 3D gallery
 *
 * Architecture:
 *  - Camera sits at [0,0,0] looking toward -Z
 *  - Planes live from worldZ = -NEAR to worldZ = -FAR (all in front of camera)
 *  - Each frame, planes approach camera (Z increases toward 0)
 *  - When a plane reaches the near clip it wraps back to the far end
 *  - Velocity is stored in a shared ref accessible from both the fixed overlay
 *    div AND the Three.js scene (solves the "overlay eats scroll events" problem)
 */

import type React from "react";
import { useRef, useMemo, useEffect, Suspense, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

// ─── Types ────────────────────────────────────────────────────────────────────
type NormalizedImage = { src: string; alt: string };

export interface InfiniteGalleryProps {
  images: (string | { src: string; alt?: string })[];
  speed?: number;         // scroll multiplier
  autoPlaySpeed?: number; // units/s during autoplay
  idleDelay?: number;     // ms before autoplay resumes
  visibleCount?: number;  // simultaneous planes in scene
  className?: string;
  style?: React.CSSProperties;
}

// ─── Shared velocity object (created outside Canvas so both div & scene share) ─
interface SharedState {
  velocity: number;
  isAutoPlay: boolean;
  lastInteraction: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const NEAR_CLIP = 1;    // planes disappear when closer than this
const FAR_CLIP  = 40;   // planes spawn this far away
const SPREAD_X  = 2.5;  // max horizontal scatter
const SPREAD_Y  = 1.2;  // max vertical scatter

// ─── Scene (runs inside Canvas) ───────────────────────────────────────────────
function GalleryScene({
  images,
  shared,
  speed,
  autoPlaySpeed,
  idleDelay,
  visibleCount,
}: {
  images: NormalizedImage[];
  shared: React.MutableRefObject<SharedState>;
  speed: number;
  autoPlaySpeed: number;
  idleDelay: number;
  visibleCount: number;
}) {
  const { gl } = useThree();
  const totalImages = images.length;

  // Load all textures
  const textures = useTexture(images.map((img) => img.src));

  // Scatter offsets — deterministic per slot
  const offsets = useMemo(
    () =>
      Array.from({ length: visibleCount }, (_, i) => ({
        x: Math.sin((i * 2.618) % (Math.PI * 2)) * (i % 3) * (SPREAD_X / 3),
        y: Math.cos((i * 1.618) % (Math.PI * 2)) * ((i % 2) * 0.5) * SPREAD_Y,
      })),
    [visibleCount]
  );

  // Plane positions (in scene-space Z: positive = distance from camera)
  const planes = useRef(
    Array.from({ length: visibleCount }, (_, i) => ({
      slot: i,
      dist: NEAR_CLIP + (FAR_CLIP - NEAR_CLIP) * (i / visibleCount), // evenly spaced
      imgIdx: i % totalImages,
    }))
  );

  // Also attach wheel to THIS canvas as a backup (in case the div listener misses)
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      shared.current.velocity += e.deltaY * 0.012 * speed;
      shared.current.isAutoPlay = false;
      shared.current.lastInteraction = Date.now();
    },
    [shared, speed]
  );

  useEffect(() => {
    const cvs = gl.domElement;
    cvs.addEventListener("wheel", handleWheel, { passive: false });
    return () => cvs.removeEventListener("wheel", handleWheel);
  }, [gl.domElement, handleWheel]);

  // Idle timer — runs inside scene so it has access to shared ref
  useEffect(() => {
    const t = setInterval(() => {
      if (
        !shared.current.isAutoPlay &&
        Date.now() - shared.current.lastInteraction > idleDelay
      ) {
        shared.current.isAutoPlay = true;
      }
    }, 500);
    return () => clearInterval(t);
  }, [shared, idleDelay]);

  useFrame((_s, delta) => {
    const s = shared.current;

    // Auto-play: smoothly blend toward target speed
    if (s.isAutoPlay) {
      s.velocity += (autoPlaySpeed - s.velocity) * Math.min(1, delta * 3);
    } else {
      // Damp user-initiated scroll
      s.velocity *= Math.pow(0.88, delta * 60);
      if (Math.abs(s.velocity) < 0.001) s.velocity = 0;
    }

    const vel = s.velocity;
    if (vel === 0 && !s.isAutoPlay) return;

    const range = FAR_CLIP - NEAR_CLIP;

    planes.current.forEach((p) => {
      // Move plane toward camera (dist decreases)
      p.dist -= vel * delta * 10;

      // Wrap: if past camera, send to back; advance image index
      if (p.dist < NEAR_CLIP) {
        const wraps = Math.floor((NEAR_CLIP - p.dist) / range) + 1;
        p.dist += range * wraps;
        // Advance to a NEW image (skip by roughly totalImages/visibleCount slots)
        const step = Math.max(1, Math.round(totalImages / visibleCount));
        p.imgIdx = (p.imgIdx + step * wraps) % totalImages;
      }

      // Wrap backward: if scrolling backward and plane is too far
      if (p.dist > FAR_CLIP) {
        const wraps = Math.floor((p.dist - FAR_CLIP) / range) + 1;
        p.dist -= range * wraps;
        const step = Math.max(1, Math.round(totalImages / visibleCount));
        p.imgIdx = ((p.imgIdx - step * wraps) % totalImages + totalImages) % totalImages;
      }
    });
  });

  return (
    <>
      {planes.current.map((p) => {
        const texture = textures[p.imgIdx % textures.length];
        if (!texture) return null;

        // worldZ is negative (in front of camera)
        const worldZ = -p.dist;

        // Opacity: fade in when freshly spawned (dist > FAR*0.85) and fade out near camera
        const normDist = (p.dist - NEAR_CLIP) / (FAR_CLIP - NEAR_CLIP); // 0=near, 1=far
        let opacity = 1;
        if (normDist > 0.85) {
          // Far end: fade in as it enters
          opacity = (1 - normDist) / 0.15;
        } else if (normDist < 0.12) {
          // Near end: fade out as it passes camera
          opacity = normDist / 0.12;
        }
        opacity = Math.max(0, Math.min(1, opacity));

        // Perspective scale: larger when close
        const pScale = 3.5 * (1 / (p.dist * 0.18 + 0.4));
        const aspect = texture.image
          ? texture.image.width / texture.image.height
          : 1;
        const w = aspect >= 1 ? pScale * aspect : pScale;
        const h = aspect >= 1 ? pScale : pScale / aspect;

        const off = offsets[p.slot] ?? { x: 0, y: 0 };

        return (
          <mesh
            key={p.slot}
            position={[off.x, off.y, worldZ]}
            scale={[w, h, 1]}
          >
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
              map={texture}
              transparent
              opacity={opacity}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </>
  );
}

// ─── Public export ─────────────────────────────────────────────────────────────
export default function InfiniteGallery({
  images,
  speed = 1,
  autoPlaySpeed = 0.3,
  idleDelay = 3000,
  visibleCount = 14,
  className = "h-96 w-full",
  style,
}: InfiniteGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Shared state — lives outside Canvas so overlay div can write to it
  const shared = useRef<SharedState>({
    velocity: autoPlaySpeed * 0.5,
    isAutoPlay: true,
    lastInteraction: Date.now() - idleDelay - 100,
  });

  const normalized = useMemo<NormalizedImage[]>(
    () =>
      images.map((img) =>
        typeof img === "string" ? { src: img, alt: "" } : { src: img.src, alt: img.alt ?? "" }
      ),
    [images]
  );

  // ── Wheel listener on the CONTAINER div (catches overlay scroll) ───────────
  const handleContainerWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      shared.current.velocity += e.deltaY * 0.012 * speed;
      shared.current.isAutoPlay = false;
      shared.current.lastInteraction = Date.now();
    },
    [speed]
  );

  // ── Keyboard listener ──────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"].includes(e.key)) {
        const dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
        shared.current.velocity += dir * 2.5 * speed;
        shared.current.isAutoPlay = false;
        shared.current.lastInteraction = Date.now();
      }
    },
    [speed]
  );

  useEffect(() => {
    const div = containerRef.current;
    if (!div) return;
    div.addEventListener("wheel", handleContainerWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      div.removeEventListener("wheel", handleContainerWheel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleContainerWheel, handleKeyDown]);

  // Touch support
  const touchStartY = useRef(0);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      const dy = touchStartY.current - e.touches[0].clientY;
      shared.current.velocity += dy * 0.02 * speed;
      shared.current.isAutoPlay = false;
      shared.current.lastInteraction = Date.now();
      touchStartY.current = e.touches[0].clientY;
    },
    [speed]
  );

  if (normalized.length === 0) return null;

  const clampedVisible = Math.min(
    Math.max(8, visibleCount),
    normalized.length
  );

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ ...style, touchAction: "none", cursor: "grab" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove as any}
    >
      <Canvas
        camera={{ position: [0, 0, 0], fov: 65, near: 0.01, far: 200 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
        }}
        frameloop="always"
      >
        <Suspense fallback={null}>
          <GalleryScene
            images={normalized}
            shared={shared}
            speed={speed}
            autoPlaySpeed={autoPlaySpeed}
            idleDelay={idleDelay}
            visibleCount={clampedVisible}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
