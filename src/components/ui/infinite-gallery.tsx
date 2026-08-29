import type React from 'react';
import { useRef, useMemo, useCallback, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

type ImageItem = string | { src: string; alt?: string };

interface InfiniteGalleryProps {
	images: ImageItem[];
	speed?: number;
	autoPlaySpeed?: number;
	idleDelay?: number;
	visibleCount?: number;
	className?: string;
	style?: React.CSSProperties;
}

interface PlaneData {
	index: number;
	z: number;
	imageIndex: number;
	x: number;
	y: number;
}

const DEPTH_RANGE = 60;

// Simple lit material — no blur/fade trickery, just clean opacity
function createSimpleMaterial(): THREE.MeshBasicMaterial {
	return new THREE.MeshBasicMaterial({
		transparent: true,
		opacity: 1.0,
		side: THREE.FrontSide,
	});
}

function ImagePlane({
	texture,
	position,
	scale,
	opacity,
}: {
	texture: THREE.Texture;
	position: [number, number, number];
	scale: [number, number, number];
	opacity: number;
}) {
	const matRef = useRef<THREE.MeshBasicMaterial>(null);

	useEffect(() => {
		if (matRef.current) {
			matRef.current.map = texture;
			matRef.current.needsUpdate = true;
		}
	}, [texture]);

	useEffect(() => {
		if (matRef.current) {
			matRef.current.opacity = opacity;
		}
	}, [opacity]);

	return (
		<mesh position={position} scale={scale}>
			<planeGeometry args={[1, 1, 1, 1]} />
			<meshBasicMaterial
				ref={matRef}
				map={texture}
				transparent
				opacity={opacity}
			/>
		</mesh>
	);
}

// ─── INTERNAL SCENE ─────────────────────────────────────────────────────────
// Holds all planes and the scroll logic. Must be inside <Canvas>.
function GalleryScene({
	images,
	speed = 1,
	autoPlaySpeed = 0.3,
	idleDelay = 3000,
	visibleCount = 16,
}: {
	images: { src: string; alt: string }[];
	speed?: number;
	autoPlaySpeed?: number;
	idleDelay?: number;
	visibleCount?: number;
}) {
	const { gl, invalidate } = useThree();

	// ---------- Textures (loads all images) ----------
	const textures = useTexture(images.map((img) => img.src));

	const totalImages = images.length;

	// ---------- Velocity refs ----------
	const velocityRef = useRef(autoPlaySpeed); // start moving immediately
	const autoPlayRef = useRef(true);
	const lastInteraction = useRef(Date.now() - idleDelay - 100); // start in autoplay

	// ---------- Spatial offsets for scatter effect ----------
	const spatialPositions = useMemo(() => {
		return Array.from({ length: visibleCount }, (_, i) => {
			const angle = (i * 2.618) % (Math.PI * 2);
			const radius = (i % 3) * 1.0;
			const x = Math.sin(angle) * radius * 2.5;
			const y = Math.cos((i * 1.618) % (Math.PI * 2)) * 1.2;
			return { x, y };
		});
	}, [visibleCount]);

	// ---------- Plane Z positions cycling through all images ----------
	const planesData = useRef<PlaneData[]>([]);
	useMemo(() => {
		if (totalImages === 0) { planesData.current = []; return; }
		planesData.current = Array.from({ length: visibleCount }, (_, i) => ({
			index: i,
			z: (DEPTH_RANGE / visibleCount) * i,
			imageIndex: i % totalImages,
			x: spatialPositions[i]?.x ?? 0,
			y: spatialPositions[i]?.y ?? 0,
		}));
	}, [visibleCount, totalImages, spatialPositions]);

	// ---------- Wheel event on THIS canvas ----------
	const handleWheel = useCallback(
		(event: WheelEvent) => {
			event.preventDefault();
			event.stopPropagation();
			velocityRef.current += event.deltaY * 0.015 * speed;
			autoPlayRef.current = false;
			lastInteraction.current = Date.now();
			invalidate();
		},
		[speed, invalidate]
	);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].includes(event.key)) {
				const dir = (event.key === 'ArrowDown' || event.key === 'ArrowRight') ? 1 : -1;
				velocityRef.current += dir * 3 * speed;
				autoPlayRef.current = false;
				lastInteraction.current = Date.now();
				invalidate();
			}
		},
		[speed, invalidate]
	);

	useEffect(() => {
		const canvas = gl.domElement;
		canvas.addEventListener('wheel', handleWheel, { passive: false });
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			canvas.removeEventListener('wheel', handleWheel);
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [gl.domElement, handleWheel, handleKeyDown]);

	// ---------- Auto-play idle timer ----------
	useEffect(() => {
		const interval = setInterval(() => {
			if (!autoPlayRef.current && Date.now() - lastInteraction.current > idleDelay) {
				autoPlayRef.current = true;
			}
		}, 500);
		return () => clearInterval(interval);
	}, [idleDelay]);

	// ---------- useFrame: advance planes each frame ----------
	useFrame((_state, delta) => {
		if (totalImages === 0) return;

		// Auto-play: smoothly ramp velocity towards target
		if (autoPlayRef.current) {
			const target = autoPlaySpeed;
			velocityRef.current += (target - velocityRef.current) * 0.05;
		} else {
			// Damping when user-controlled
			velocityRef.current *= 0.92;
		}

		const vel = velocityRef.current;
		if (Math.abs(vel) < 0.0001) return;

		const halfRange = DEPTH_RANGE / 2;

		planesData.current.forEach((plane) => {
			let newZ = plane.z + vel * delta * 12;

			// Wrap around
			if (newZ >= DEPTH_RANGE) {
				const wraps = Math.floor(newZ / DEPTH_RANGE);
				newZ -= DEPTH_RANGE * wraps;
				// Advance image index so different images cycle through
				plane.imageIndex = (plane.imageIndex + wraps * Math.max(1, Math.floor(totalImages / visibleCount))) % totalImages;
			} else if (newZ < 0) {
				const wraps = Math.ceil(-newZ / DEPTH_RANGE);
				newZ += DEPTH_RANGE * wraps;
				plane.imageIndex = ((plane.imageIndex - wraps * Math.max(1, Math.floor(totalImages / visibleCount))) % totalImages + totalImages) % totalImages;
			}

			plane.z = newZ;
		});
	});

	// ---------- Render: compute worldZ + opacity per plane ----------
	if (totalImages === 0) return null;

	return (
		<>
			{planesData.current.map((plane) => {
				const texture = textures[plane.imageIndex % textures.length];
				if (!texture) return null;

				const worldZ = plane.z - DEPTH_RANGE / 2;

				// Fade: near camera (worldZ > -5) and far back (worldZ < -halfRange+5)
				const normZ = (plane.z / DEPTH_RANGE); // 0→1
				let opacity = 1;
				// Fade in as it comes out from behind camera
				if (normZ < 0.1) opacity = normZ / 0.1;
				// Fade out as it goes back into the distance
				else if (normZ > 0.8) opacity = 1 - (normZ - 0.8) / 0.2;

				opacity = Math.max(0, Math.min(1, opacity));

				const aspect = texture.image
					? texture.image.width / texture.image.height
					: 1;
				const scale: [number, number, number] =
					aspect > 1 ? [2.4 * aspect, 2.4, 1] : [2.4, 2.4 / aspect, 1];

				return (
					<ImagePlane
						key={plane.index}
						texture={texture}
						position={[plane.x, plane.y, worldZ]}
						scale={scale}
						opacity={opacity}
					/>
				);
			})}
		</>
	);
}

// ─── FALLBACK (no WebGL) ─────────────────────────────────────────────────────
function FallbackGallery({ images }: { images: ImageItem[] }) {
	const normalized = useMemo(
		() => images.map((img) => typeof img === 'string' ? { src: img, alt: '' } : img),
		[images]
	);
	return (
		<div className="flex flex-wrap gap-3 items-center justify-center h-full p-4 overflow-y-auto">
			{normalized.map((img, i) => (
				<img key={i} src={img.src} alt={img.alt} className="h-40 w-auto object-cover rounded-lg opacity-80" />
			))}
		</div>
	);
}

// ─── PUBLIC EXPORT ────────────────────────────────────────────────────────────
export default function InfiniteGallery({
	images,
	speed = 1,
	autoPlaySpeed = 0.3,
	idleDelay = 3000,
	visibleCount = 16,
	className = 'h-96 w-full',
	style,
}: InfiniteGalleryProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	const normalized = useMemo(
		() => images.map((img) => typeof img === 'string' ? { src: img, alt: '' } : img),
		[images]
	);

	// Extra: also listen to wheel on the container so the overlay captures scroll
	// (the Canvas may not bubble wheel events to its parent)
	const velocityExternalRef = useRef(0); // not used directly; wheel on canvas handles it

	if (normalized.length === 0) return null;

	return (
		<div ref={containerRef} className={className} style={{ ...style, touchAction: 'none' }}>
			<Canvas
				camera={{ position: [0, 0, 5], fov: 60 }}
				gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
				frameloop="always"
			>
				<Suspense fallback={null}>
					<GalleryScene
						images={normalized}
						speed={speed}
						autoPlaySpeed={autoPlaySpeed}
						idleDelay={idleDelay}
						visibleCount={Math.min(visibleCount, normalized.length > 0 ? normalized.length : visibleCount)}
					/>
				</Suspense>
			</Canvas>
		</div>
	);
}
