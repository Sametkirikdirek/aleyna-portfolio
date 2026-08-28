import { useEffect, useRef } from "react";
import { useColorMode } from "../../context/ColorModeContext";
import { useProfile } from "../../hooks/useContent";

const DEFAULT_LEAF_COLORS = ["#e11d48", "#be123c", "#f43f5e", "#dc2626", "#fda4af"];

function drawPetal(ctx, size) {
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.quadraticCurveTo(size * 0.75, -size * 0.3, size * 0.5, size * 0.7);
  ctx.quadraticCurveTo(0, size, 0, size);
  ctx.quadraticCurveTo(0, size, -size * 0.5, size * 0.7);
  ctx.quadraticCurveTo(-size * 0.75, -size * 0.3, 0, -size);
  ctx.closePath();
}

/**
 * GlobalFallingLeaves: Light modda tüm sayfalarda (Galeri, Yazılar, Yapay Zeka vb.)
 * arka planda sonsuza kadar süzülen hafif, zarif yaprak parçacıkları katmanı.
 */
export default function GlobalFallingLeaves() {
  const { theme } = useColorMode();
  const { data: profile } = useProfile();
  const canvasRef = useRef(null);

  const isLight = theme === "light";
  const treeConfig = profile?.treeConfig || {
    enabled: true,
    leafColors: DEFAULT_LEAF_COLORS,
    leafCount: 35,
    speed: 1,
  };

  const isEnabled = isLight && treeConfig.enabled !== false;

  useEffect(() => {
    if (!isEnabled) return;

    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      cvs.width = window.innerWidth * dpr;
      cvs.height = window.innerHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const getW = () => window.innerWidth;
    const getH = () => window.innerHeight;

    const colors = treeConfig.leafColors && treeConfig.leafColors.length > 0
      ? treeConfig.leafColors
      : DEFAULT_LEAF_COLORS;

    // 20-30 ambient floating leaves across the whole viewport
    const count = Math.min(35, Math.max(16, Math.floor(treeConfig.leafCount * 0.7)));
    const leaves = [];

    for (let i = 0; i < count; i++) {
      leaves.push({
        x: Math.random() * getW(),
        y: Math.random() * getH(),
        vx: -0.3 - Math.random() * 0.6, // gentle leftward drift
        vy: 0.5 + Math.random() * 0.8,  // gentle fall
        size: 4.5 + Math.random() * 6,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03,
        flip: Math.random() * Math.PI * 2,
        flipSpeed: 0.02 + Math.random() * 0.035,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 1.0 + Math.random() * 1.3,
        swayAmp: 1.0 + Math.random() * 1.5,
        color: colors[Math.floor(Math.random() * colors.length)] || "#e11d48",
        alpha: 0.35 + Math.random() * 0.4,
      });
    }

    let startTime = performance.now();
    let rafId = 0;

    const render = (now) => {
      const w = getW();
      const h = getH();
      const time = (now - startTime) / 1000;
      const spd = treeConfig.speed || 1;

      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.scale(dpr, dpr);

      for (let i = 0; i < leaves.length; i++) {
        const leaf = leaves[i];
        leaf.y += leaf.vy * spd;
        leaf.x += (leaf.vx + Math.sin(time * leaf.swaySpeed + leaf.swayPhase) * leaf.swayAmp) * spd;
        leaf.rotation += leaf.rotSpeed;
        leaf.flip += leaf.flipSpeed;

        // Reset seamlessly when falling past bottom of screen or left edge
        if (leaf.y > h + 30) {
          leaf.y = -30;
          leaf.x = Math.random() * (w + 100);
        }
        if (leaf.x < -30) {
          leaf.x = w + 30;
        }

        ctx.save();
        ctx.translate(leaf.x, leaf.y);
        ctx.rotate(leaf.rotation);
        ctx.scale(Math.cos(leaf.flip), 1);
        ctx.fillStyle = leaf.color;
        ctx.globalAlpha = leaf.alpha;
        drawPetal(ctx, leaf.size);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafId);
    };
  }, [isEnabled, treeConfig.leafColors, treeConfig.leafCount, treeConfig.speed]);

  if (!isEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-10 w-full h-full"
      style={{ pointerEvents: "none" }}
    />
  );
}
