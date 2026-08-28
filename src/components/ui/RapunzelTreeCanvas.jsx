import { useEffect, useRef, useState } from "react";

const DEFAULT_LEAF_COLORS = ["#e11d48", "#be123c", "#f43f5e", "#dc2626", "#fda4af"];

/**
 * Draws an artistic pointed petal/leaf with bezier curvature
 */
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
 * Draws a tapered smooth branch limb between two points with curve control
 */
function drawTaperedBranch(ctx, startX, startY, ctrlX, ctrlY, endX, endY, startWidth, endWidth, gradient) {
  const angle = Math.atan2(endY - startY, endX - startX);
  const perp = angle + Math.PI / 2;

  const sx1 = startX + Math.cos(perp) * (startWidth / 2);
  const sy1 = startY + Math.sin(perp) * (startWidth / 2);
  const sx2 = startX - Math.cos(perp) * (startWidth / 2);
  const sy2 = startY - Math.sin(perp) * (startWidth / 2);

  const ex1 = endX + Math.cos(perp) * (endWidth / 2);
  const ey1 = endY + Math.sin(perp) * (endWidth / 2);
  const ex2 = endX - Math.cos(perp) * (endWidth / 2);
  const ey2 = endY - Math.sin(perp) * (endWidth / 2);

  ctx.beginPath();
  ctx.moveTo(sx1, sy1);
  ctx.quadraticCurveTo(ctrlX + Math.cos(perp) * ((startWidth + endWidth) / 4), ctrlY + Math.sin(perp) * ((startWidth + endWidth) / 4), ex1, ey1);
  ctx.lineTo(ex2, ey2);
  ctx.quadraticCurveTo(ctrlX - Math.cos(perp) * ((startWidth + endWidth) / 4), ctrlY - Math.sin(perp) * ((startWidth + endWidth) / 4), sx2, sy2);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();
}

export default function RapunzelTreeCanvas({
  leafColors = DEFAULT_LEAF_COLORS,
  leafCount = 35,
  speed = 1,
  className = "",
}) {
  const canvasRef = useRef(null);
  const canBurstRef = useRef(true);
  const activeColorsRef = useRef(leafColors.length > 0 ? leafColors : DEFAULT_LEAF_COLORS);
  const activeCountRef = useRef(leafCount);
  const activeSpeedRef = useRef(speed);
  const burstParticlesRef = useRef([]);
  const treeShakeRef = useRef({ intensity: 0, decay: 0.90 });

  useEffect(() => {
    activeColorsRef.current = leafColors.length > 0 ? leafColors : DEFAULT_LEAF_COLORS;
  }, [leafColors]);

  useEffect(() => {
    activeCountRef.current = leafCount;
  }, [leafCount]);

  useEffect(() => {
    activeSpeedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      cvs.width = cvs.offsetWidth * dpr;
      cvs.height = cvs.offsetHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const getW = () => cvs.offsetWidth;
    const getH = () => cvs.offsetHeight;

    /**
     * Calculates the exact center of "Gece Vardiyası" card on both desktop and mobile
     */
    const getCardCenter = (w, h) => {
      const isMobile = w < 1024;
      return {
        cx: isMobile ? w * 0.50 : w * 0.725,
        cy: isMobile ? h * 0.70 : h * 0.54,
        scale: Math.max(0.65, Math.min(1, w / 1100)),
      };
    };

    /**
     * Branch blossom nodes where flowers and leaves grow (Mobile vs Desktop)
     */
    const getBranchNodes = (w, h) => {
      const isMobile = w < 1024;
      if (isMobile) {
        return [
          // Top-right canopy framing the header & avatar area
          { x: w * 0.92, y: h * 0.05, size: 22 },
          { x: w * 0.76, y: h * 0.08, size: 24 },
          { x: w * 0.60, y: h * 0.11, size: 20 },
          { x: w * 0.42, y: h * 0.09, size: 18 },
          { x: w * 0.85, y: h * 0.15, size: 20 },
          // Card flank nodes (framing 3D carousel horizontally without crossing buttons)
          { x: w * 0.16, y: h * 0.78, size: 18 },
          { x: w * 0.84, y: h * 0.78, size: 18 },
          { x: w * 0.32, y: h * 0.86, size: 16 },
          { x: w * 0.68, y: h * 0.86, size: 16 },
        ];
      }

      const cx = w * 0.725;
      const cy = h * 0.54;
      return [
        { x: cx - w * 0.12, y: cy - h * 0.28, size: 24 },
        { x: cx - w * 0.22, y: cy - h * 0.35, size: 28 },
        { x: cx - w * 0.34, y: cy - h * 0.32, size: 22 },
        { x: cx - w * 0.05, y: cy - h * 0.42, size: 26 },
        { x: cx + w * 0.08, y: cy - h * 0.46, size: 22 },
        { x: cx + w * 0.18, y: cy - h * 0.36, size: 26 },
        { x: cx + w * 0.26, y: cy - h * 0.26, size: 20 },
        { x: cx - w * 0.02, y: cy - h * 0.22, size: 20 },
        { x: cx + w * 0.12, y: cy - h * 0.20, size: 18 },
      ];
    };

    /**
     * Continuous falling leaf generator
     */
    const createFallingLeaf = (w, h, nodes, randomY = false) => {
      const node = nodes[Math.floor(Math.random() * nodes.length)];
      const colors = activeColorsRef.current;
      const color = colors[Math.floor(Math.random() * colors.length)] || "#e11d48";
      const startX = node ? node.x + (Math.random() - 0.5) * 80 : Math.random() * w;
      const startY = randomY ? Math.random() * h : (node ? node.y + (Math.random() - 0.5) * 50 : -20);

      return {
        x: startX,
        y: startY,
        vx: -0.4 - Math.random() * 0.7,
        vy: 0.6 + Math.random() * 0.9,
        size: 5 + Math.random() * 7,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        flip: Math.random() * Math.PI * 2,
        flipSpeed: 0.03 + Math.random() * 0.04,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 1.2 + Math.random() * 1.5,
        swayAmp: 1.2 + Math.random() * 1.6,
        color,
        alpha: 0.65 + Math.random() * 0.35,
      };
    };

    const isMob = getW() < 768;
    const count = isMob ? Math.min(20, activeCountRef.current) : Math.max(16, activeCountRef.current);
    const initialNodes = getBranchNodes(getW(), getH());
    const leaves = [];
    for (let i = 0; i < count; i++) {
      leaves.push(createFallingLeaf(getW(), getH(), initialNodes, true));
    }

    /**
     * Draws the Rapunzel Tree branching out
     */
    const drawRapunzelTree = (w, h, shakeOffset) => {
      ctx.save();
      ctx.translate(shakeOffset.x, shakeOffset.y);

      const isMobile = w < 1024;
      const colors = activeColorsRef.current;
      const nodes = getBranchNodes(w, h);

      if (isMobile) {
        // ── MOBILE: Organic top canopy and subtle lower card side boughs ──
        const barkGrad = ctx.createLinearGradient(w * 0.95, 0, w * 0.45, h * 0.15);
        barkGrad.addColorStop(0, "rgba(52, 22, 34, 0.92)");
        barkGrad.addColorStop(0.5, "rgba(75, 30, 48, 0.85)");
        barkGrad.addColorStop(1, "rgba(102, 42, 66, 0.75)");

        const subBarkGrad = "rgba(85, 34, 54, 0.78)";

        // Top Canopy Branch arching across top-right towards avatar
        drawTaperedBranch(ctx, w * 1.02, h * 0.02, w * 0.85, h * 0.06, w * 0.68, h * 0.09, 22, 10, barkGrad);
        drawTaperedBranch(ctx, w * 0.68, h * 0.09, w * 0.54, h * 0.11, w * 0.40, h * 0.09, 10, 4, subBarkGrad);
        drawTaperedBranch(ctx, w * 0.85, h * 0.06, w * 0.88, h * 0.12, w * 0.82, h * 0.18, 9, 3.5, subBarkGrad);

        // Lower Card Flank Branches (behind the cards at the bottom, without crossing buttons)
        const cardCy = h * 0.78;
        drawTaperedBranch(ctx, w * 0.50, cardCy + 50, w * 0.32, cardCy + 30, w * 0.16, cardCy + 10, 16, 6, barkGrad);
        drawTaperedBranch(ctx, w * 0.50, cardCy + 50, w * 0.68, cardCy + 30, w * 0.84, cardCy + 10, 16, 6, barkGrad);
      } else {
        // ── DESKTOP: Tree rooted behind "Gece Vardiyası" card spreading across top ──
        const cx = w * 0.725;
        const cy = h * 0.54;

        const barkGrad = ctx.createLinearGradient(cx, cy + 200, cx, cy - 250);
        barkGrad.addColorStop(0, "rgba(52, 22, 34, 0.92)");
        barkGrad.addColorStop(0.5, "rgba(75, 30, 48, 0.85)");
        barkGrad.addColorStop(1, "rgba(102, 42, 66, 0.75)");

        const subBarkGrad = "rgba(85, 34, 54, 0.78)";

        // 1. Trunk (Rooted directly behind the center card)
        drawTaperedBranch(ctx, cx, cy + 180, cx - 10, cy + 60, cx - 15, cy - 30, 42, 26, barkGrad);

        // 2. Main Left Upper Branch (Arching across top left)
        drawTaperedBranch(ctx, cx - 15, cy - 30, cx - w * 0.12, cy - h * 0.22, cx - w * 0.24, cy - h * 0.34, 24, 12, barkGrad);
        drawTaperedBranch(ctx, cx - w * 0.24, cy - h * 0.34, cx - w * 0.30, cy - h * 0.36, cx - w * 0.36, cy - h * 0.32, 12, 5, subBarkGrad);

        // 3. Main Center/High Branch (Reaching up to top)
        drawTaperedBranch(ctx, cx - 15, cy - 30, cx + 10, cy - h * 0.26, cx - w * 0.05, cy - h * 0.42, 20, 10, barkGrad);
        drawTaperedBranch(ctx, cx - w * 0.05, cy - h * 0.42, cx + w * 0.02, cy - h * 0.48, cx + w * 0.08, cy - h * 0.46, 10, 4, subBarkGrad);

        // 4. Main Right Upper Branch (Arching towards top right)
        drawTaperedBranch(ctx, cx - 15, cy - 30, cx + w * 0.10, cy - h * 0.20, cx + w * 0.20, cy - h * 0.34, 22, 10, barkGrad);
        drawTaperedBranch(ctx, cx + w * 0.20, cy - h * 0.34, cx + w * 0.25, cy - h * 0.30, cx + w * 0.28, cy - h * 0.24, 10, 4, subBarkGrad);
      }

      // Blossom and Leaf Foliage Clusters on all branch tips
      nodes.forEach((node, nIdx) => {
        const clusterCount = node.size || 20;

        // Soft ambient petal glow behind cluster
        const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 45);
        glow.addColorStop(0, "rgba(251, 113, 133, 0.20)");
        glow.addColorStop(1, "rgba(251, 113, 133, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 45, 0, Math.PI * 2);
        ctx.fill();

        for (let b = 0; b < clusterCount; b++) {
          const angle = (b / clusterCount) * Math.PI * 2 + nIdx;
          const dist = 8 + (b % 4) * 7;
          const px = node.x + Math.cos(angle) * dist;
          const py = node.y + Math.sin(angle) * dist * 0.75;
          const leafSize = 4.2 + (b % 3) * 2;
          const color = colors[(b + nIdx) % colors.length] || "#e11d48";

          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(angle + Math.PI / 4);
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.55 + (b % 3) * 0.18;
          drawPetal(ctx, leafSize);
          ctx.fill();
          ctx.restore();
        }
      });

      ctx.restore();
    };

    /**
     * Interactive Click / Burst Trigger Handler (with 1.8s debounce cooldown)
     */
    const triggerLeafBurst = (clickX, clickY) => {
      if (!canBurstRef.current) return;
      canBurstRef.current = false;

      // Tree sway impulse
      treeShakeRef.current.intensity = 14;

      const colors = activeColorsRef.current;
      const nodes = getBranchNodes(getW(), getH());
      const burstOriginX = clickX || getW() * 0.65;
      const burstOriginY = clickY || getH() * 0.30;

      // 55+ radial burst particles from click point
      const burstCount = 55 + Math.floor(Math.random() * 15);
      for (let i = 0; i < burstCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const blastSpeed = 3.5 + Math.random() * 7.5;
        const color = colors[Math.floor(Math.random() * colors.length)] || "#e11d48";

        burstParticlesRef.current.push({
          x: burstOriginX + (Math.random() - 0.5) * 30,
          y: burstOriginY + (Math.random() - 0.5) * 30,
          vx: Math.cos(angle) * blastSpeed,
          vy: Math.sin(angle) * blastSpeed - 1.8, // slight upward pop
          size: 6 + Math.random() * 8,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.14,
          flip: Math.random() * Math.PI * 2,
          flipSpeed: 0.06 + Math.random() * 0.08,
          color,
          alpha: 1,
          gravity: 0.10,
          friction: 0.95,
          life: 1,
          decay: 0.006 + Math.random() * 0.005,
        });
      }

      // Also trigger a gentle shower from all branch nodes
      nodes.forEach((n) => {
        for (let k = 0; k < 3; k++) {
          const angle = Math.random() * Math.PI * 2;
          burstParticlesRef.current.push({
            x: n.x + (Math.random() - 0.5) * 25,
            y: n.y + (Math.random() - 0.5) * 25,
            vx: (Math.random() - 0.5) * 3.5,
            vy: 0.4 + Math.random() * 2.2,
            size: 5 + Math.random() * 6,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.08,
            flip: Math.random() * Math.PI * 2,
            flipSpeed: 0.05,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1,
            gravity: 0.07,
            friction: 0.97,
            life: 1,
            decay: 0.007,
          });
        }
      });

      // 1.8s debounce cooldown
      setTimeout(() => {
        canBurstRef.current = true;
      }, 1800);
    };

    const handleGlobalHeroClick = (e) => {
      // Do not trigger burst when clicking on interactive buttons, links, inputs, or fan cards
      const isInteractive = e.target.closest("button, a, input, select, textarea, .fan-card, [role='button']");
      if (isInteractive) return;

      const rect = cvs.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) return;

      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      triggerLeafBurst(clickX, clickY);
    };

    window.addEventListener("click", handleGlobalHeroClick);

    let startTime = performance.now();
    let rafId = 0;

    const render = (now) => {
      const w = getW();
      const h = getH();
      const time = (now - startTime) / 1000;
      const spd = activeSpeedRef.current;

      // Completely wipe entire physical canvas on every frame to prevent any trailing paint lines
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      ctx.scale(dpr, dpr);

      // Tree sway calculation
      const shake = treeShakeRef.current;
      shake.intensity *= shake.decay;
      if (shake.intensity < 0.05) shake.intensity = 0;

      const windSway = Math.sin(time * 1.5) * 2.2;
      const shakeOffsetX = (Math.random() - 0.5) * shake.intensity + windSway;
      const shakeOffsetY = (Math.random() - 0.5) * (shake.intensity * 0.5);

      // 1. Draw Rapunzel Tree from behind center card
      drawRapunzelTree(w, h, { x: shakeOffsetX, y: shakeOffsetY });

      const nodes = getBranchNodes(w, h);

      // 2. Draw Continuous Falling Leaves (Falling infinitely past bottom)
      for (let i = 0; i < leaves.length; i++) {
        const leaf = leaves[i];
        leaf.y += leaf.vy * spd;
        leaf.x += (leaf.vx + Math.sin(time * leaf.swaySpeed + leaf.swayPhase) * leaf.swayAmp) * spd;
        leaf.rotation += leaf.rotSpeed;
        leaf.flip += leaf.flipSpeed;

        // Reset seamlessly when falling past bottom of screen
        if (leaf.y > h + 40) {
          const fresh = createFallingLeaf(w, h, nodes, false);
          Object.assign(leaf, fresh);
        }
        if (leaf.x < -40) {
          leaf.x = w + 20;
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

      // 3. Draw & Update Burst Particles (Click Explosion)
      const bursts = burstParticlesRef.current;
      for (let i = bursts.length - 1; i >= 0; i--) {
        const p = bursts[i];
        p.vx *= p.friction;
        p.vy = p.vy * p.friction + p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.flip += p.flipSpeed;
        p.life -= p.decay;

        if (p.life <= 0 || p.y > h + 50) {
          bursts.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.scale(Math.cos(p.flip), 1);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life * p.alpha);
        drawPetal(ctx, p.size);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("click", handleGlobalHeroClick);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className={`absolute inset-0 pointer-events-auto overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
        title="Dallara tıklayarak yaprakları savurun! 🌸🍃"
      />
    </div>
  );
}
