/**
 * InfiniteGallery — High-performance Three.js Tunnel Gallery
 * 
 * Features:
 * - Direct Mesh Position & Shader Uniform updates inside useFrame (60-120 FPS, 0 React re-renders)
 * - True infinite seamless looping: wraps planes and cycles across ALL uploaded images
 * - Interactive scroll via mouse wheel, drag, swipe, and arrow keys anywhere on the screen
 * - Cloth/flag wave simulation on hover + velocity curve distortion
 * - Admin-configurable autoPlaySpeed and idleDelay
 */

import React, { useRef, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

type ImageItem = string | { src: string; alt?: string };

export interface InfiniteGalleryProps {
  images: ImageItem[];
  speed?: number;
  autoPlaySpeed?: number;
  idleDelay?: number;
  visibleCount?: number;
  className?: string;
  style?: React.CSSProperties;
}

const Z_NEAR = -2.5; // Near camera (wraps here)
const Z_FAR = -38.5; // Far in distance (spawns here)
const RANGE = Z_NEAR - Z_FAR; // 36 units

// ─── Custom Cloth / Wave Shader ───────────────────────────────────────────────
function createClothMaterial(tex: THREE.Texture) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      map: { value: tex },
      opacity: { value: 1.0 },
      scrollForce: { value: 0.0 },
      time: { value: 0.0 },
      isHovered: { value: 0.0 },
    },
    vertexShader: `
      uniform float scrollForce;
      uniform float time;
      uniform float isHovered;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vec3 pos = position;

        // Subtle curve based on scroll speed
        float curve = length(pos.xy) * scrollForce * 0.05;

        // Interactive flag wave ripple when mouse hovers
        float wave = 0.0;
        if (isHovered > 0.5) {
          float wavePhase = pos.x * 3.5 + time * 7.0;
          float damp = smoothstep(-0.5, 0.5, pos.x);
          wave = sin(wavePhase) * 0.07 * damp;
        }

        pos.z -= (curve + wave);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform float opacity;
      uniform float scrollForce;
      varying vec2 vUv;

      void main() {
        vec4 color = texture2D(map, vUv);
        float highlight = abs(scrollForce) * 0.03;
        gl_FragColor = vec4(color.rgb + vec3(highlight), color.a * opacity);
      }
    `,
  });
}

// ─── Single Plane Component ──────────────────────────────────────────────────
function TunnelPlane({
  slot,
  totalSlots,
  textures,
  totalImages,
  velocityRef,
}: {
  slot: number;
  totalSlots: number;
  textures: THREE.Texture[];
  totalImages: number;
  velocityRef: React.MutableRefObject<number>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const imgIdxRef = useRef(slot % totalImages);
  const zRef = useRef(Z_NEAR + (Z_FAR - Z_NEAR) * (slot / totalSlots));
  const isHoveredRef = useRef(false);

  // Scatter distribution on screen
  const offset = useMemo(() => {
    const angle = (slot * 2.618) % (Math.PI * 2);
    const r = ((slot % 3) * 1.1) + 0.6;
    return {
      x: Math.sin(angle) * r * 2.2,
      y: Math.cos((slot * 1.618) % (Math.PI * 2)) * 1.1,
    };
  }, [slot]);

  // Initial texture & material
  const initialTex = textures[imgIdxRef.current % textures.length];
  const material = useMemo(() => createClothMaterial(initialTex), [initialTex]);

  // Initial aspect ratio scale
  const initialScale = useMemo(() => {
    if (!initialTex?.image) return [2.8, 2.8, 1] as [number, number, number];
    const aspect = initialTex.image.width / initialTex.image.height;
    return (aspect >= 1 ? [2.8 * aspect, 2.8, 1] : [2.8, 2.8 / aspect, 1]) as [number, number, number];
  }, [initialTex]);

  useFrame((state, delta) => {
    if (!meshRef.current || !matRef.current || textures.length === 0) return;

    const vel = velocityRef.current;
    zRef.current += vel * delta * 7.5;

    // Wrap Forward (planes approach and pass camera)
    if (zRef.current > Z_NEAR) {
      const wraps = Math.floor((zRef.current - Z_NEAR) / RANGE) + 1;
      zRef.current -= RANGE * wraps;
      // Cycle to new image
      imgIdxRef.current = (imgIdxRef.current + totalSlots * wraps) % totalImages;
      const nextTex = textures[imgIdxRef.current % textures.length];
      if (nextTex) {
        matRef.current.uniforms.map.value = nextTex;
        const aspect = nextTex.image ? nextTex.image.width / nextTex.image.height : 1;
        const w = aspect >= 1 ? 2.8 * aspect : 2.8;
        const h = aspect >= 1 ? 2.8 : 2.8 / aspect;
        meshRef.current.scale.set(w, h, 1);
      }
    }

    // Wrap Backward (scrolling in reverse)
    if (zRef.current < Z_FAR) {
      const wraps = Math.floor((Z_FAR - zRef.current) / RANGE) + 1;
      zRef.current += RANGE * wraps;
      imgIdxRef.current = ((imgIdxRef.current - totalSlots * wraps) % totalImages + totalImages) % totalImages;
      const nextTex = textures[imgIdxRef.current % textures.length];
      if (nextTex) {
        matRef.current.uniforms.map.value = nextTex;
        const aspect = nextTex.image ? nextTex.image.width / nextTex.image.height : 1;
        const w = aspect >= 1 ? 2.8 * aspect : 2.8;
        const h = aspect >= 1 ? 2.8 : 2.8 / aspect;
        meshRef.current.scale.set(w, h, 1);
      }
    }

    // Direct Object3D position mutation
    meshRef.current.position.set(offset.x, offset.y, zRef.current);

    // Smooth Distance-based Opacity Fade
    let opacity = 1.0;
    if (zRef.current < Z_FAR + 6.0) {
      opacity = (zRef.current - Z_FAR) / 6.0;
    } else if (zRef.current > -5.5) {
      opacity = (Z_NEAR - zRef.current) / (Z_NEAR - (-5.5));
    }
    opacity = Math.max(0, Math.min(1, opacity));

    // Direct Material Uniforms mutation
    matRef.current.uniforms.opacity.value = opacity;
    matRef.current.uniforms.scrollForce.value = vel;
    matRef.current.uniforms.time.value = state.clock.elapsedTime;
    matRef.current.uniforms.isHovered.value = isHoveredRef.current ? 1.0 : 0.0;
  });

  return (
    <mesh
      ref={meshRef}
      position={[offset.x, offset.y, zRef.current]}
      scale={initialScale}
      material={material}
      onPointerOver={(e) => {
        e.stopPropagation();
        isHoveredRef.current = true;
      }}
      onPointerOut={() => {
        isHoveredRef.current = false;
      }}
    >
      <planeGeometry args={[1, 1, 24, 24]} />
      <primitive object={material} ref={matRef} attach="material" />
    </mesh>
  );
}

// ─── Scene Container ──────────────────────────────────────────────────────────
function TunnelScene({
  images,
  speed,
  autoPlaySpeed,
  idleDelay,
  visibleCount,
}: {
  images: { src: string; alt: string }[];
  speed: number;
  autoPlaySpeed: number;
  idleDelay: number;
  visibleCount: number;
}) {
  const textures = useTexture(images.map((img) => img.src));
  const totalImages = images.length;

  const velocityRef = useRef(autoPlaySpeed);
  const isAutoPlayRef = useRef(true);
  const lastInteractionRef = useRef(Date.now() - idleDelay - 100);

  // Global Interactive Listeners (Wheel, Arrow keys, Drag, Touch)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      velocityRef.current += e.deltaY * 0.009 * speed;
      isAutoPlayRef.current = false;
      lastInteractionRef.current = Date.now();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight", "Space"].includes(e.code)) {
        e.preventDefault();
        const dir = (e.code === "ArrowDown" || e.code === "ArrowRight" || e.code === "Space") ? 1 : -1;
        velocityRef.current += dir * 2.2 * speed;
        isAutoPlayRef.current = false;
        lastInteractionRef.current = Date.now();
      }
    };

    let isPointerDown = false;
    let startY = 0;

    const handlePointerDown = (e: PointerEvent) => {
      isPointerDown = true;
      startY = e.clientY;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isPointerDown) return;
      const dy = startY - e.clientY;
      velocityRef.current += dy * 0.015 * speed;
      isAutoPlayRef.current = false;
      lastInteractionRef.current = Date.now();
      startY = e.clientY;
    };

    const handlePointerUp = () => {
      isPointerDown = false;
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [speed]);

  // Frame Controller: Damping & Autoplay blending
  useFrame((_state, delta) => {
    const elapsedSinceInteraction = Date.now() - lastInteractionRef.current;

    if (elapsedSinceInteraction > idleDelay) {
      isAutoPlayRef.current = true;
    }

    if (isAutoPlayRef.current) {
      // Smoothly blend toward autoPlaySpeed
      velocityRef.current += (autoPlaySpeed - velocityRef.current) * Math.min(1, delta * 2.5);
    } else {
      // Natural inertia damping on user scroll
      velocityRef.current *= Math.pow(0.90, delta * 60);
      if (Math.abs(velocityRef.current) < 0.0005) {
        velocityRef.current = 0;
      }
    }
  });

  const slots = useMemo(
    () => Array.from({ length: visibleCount }, (_, i) => i),
    [visibleCount]
  );

  return (
    <>
      {slots.map((slot) => (
        <TunnelPlane
          key={slot}
          slot={slot}
          totalSlots={visibleCount}
          textures={textures}
          totalImages={totalImages}
          velocityRef={velocityRef}
        />
      ))}
    </>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function InfiniteGallery({
  images,
  speed = 1,
  autoPlaySpeed = 0.3,
  idleDelay = 3000,
  visibleCount = 12,
  className = "h-full w-full",
  style,
}: InfiniteGalleryProps) {
  const normalized = useMemo(
    () =>
      images
        .map((img) =>
          typeof img === "string" ? { src: img, alt: "" } : { src: img.src, alt: img.alt ?? "" }
        )
        .filter((img) => Boolean(img.src)),
    [images]
  );

  if (normalized.length === 0) return null;

  const activeCount = Math.min(
    Math.max(6, visibleCount),
    Math.max(6, normalized.length)
  );

  return (
    <div
      className={className}
      style={{
        ...style,
        touchAction: "none",
        userSelect: "none",
        position: "relative",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 0], fov: 60, near: 0.1, far: 100 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        frameloop="always"
      >
        <Suspense fallback={null}>
          <TunnelScene
            images={normalized}
            speed={speed}
            autoPlaySpeed={autoPlaySpeed}
            idleDelay={idleDelay}
            visibleCount={activeCount}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
