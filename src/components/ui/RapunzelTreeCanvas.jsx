import { useEffect, useRef, useState } from "react";

const DEFAULT_LEAF_COLORS = ["#e11d48", "#be123c", "#f43f5e", "#dc2626", "#fda4af"];

/**
 * Draws a single artistic petal / leaf with realistic curvature
 */
function drawLeafPath(ctx, size) {
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.quadraticCurveTo(size * 0.75, -size * 0.3, size * 0.5, size * 0.7);
  ctx.quadraticCurveTo(0, size, 0, size);
  ctx.quadraticCurveTo(0, size, -size * 0.5, size * 0.7);
  ctx.quadraticCurveTo(-size * 0.75, -size * 0.3, 0, -size);
  ctx.closePath();
}

export default function RapunzelTreeCanvas({
  leafColors = DEFAULT_LEAF_COLORS,
  leafCount = 35,
  speed = 1,
  className = "",
}) {
  const canvasRef = useRef(null);
  const [canBurstState, setCanBurstState] = useState(true);
  const canBurstRef = useRef(true);
  const activeColorsRef = useRef(leafColors.length > 0 ? leafColors : DEFAULT_LEAF_COLORS);
  const activeCountRef = useRef(leafCount);
  const activeSpeedRef = useRef(speed);
  const burstParticlesRef = useRef([]);
  const treeShakeRef = useRef({ intensity: 0, decay: 0.92 });

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

    /* ── Generate Branch Nodes (Where leaves grow and spawn) ── */
    const getBranchNodes = (w, h) => {
      // Tree base is at bottom-right around (0.75 * w, 0.95 * h)
      return [
        { x: w * 0.82, y: h * 0.22, clusterSize: 18 },
        { x: w * 0.74, y: h * 0.16, clusterSize: 22 },
        { x: w * 0.65, y: h * 0.12, clusterSize: 25 },
        { x: w * 0.54, y: h * 0.14, clusterSize: 20 },
        { x: w * 0.44, y: h * 0.20, clusterSize: 16 },
        { x: w * 0.35, y: h * 0.26, clusterSize: 14 },
        { x: w * 0.88, y: h * 0.32, clusterSize: 16 },
        { x: w * 0.78, y: h * 0.38, clusterSize: 18 },
        { x: w * 0.68, y: h * 0.30, clusterSize: 20 },
        { x: w * 0.58, y: h * 0.24, clusterSize: 18 },
      ];
    };

    /* ── Create Continuous Falling Leaf Object ── */
    const createFallingLeaf = (w, h, nodes, randomY = false) => {
      const node = nodes[Math.floor(Math.random() * nodes.length)];
      const colors = activeColorsRef.current;
      const color = colors[Math.floor(Math.random() * colors.length)] || "#e11d48";
      const startX = node ? node.x + (Math.random() - 0.5) * 60 : Math.random() * w;
      const startY = randomY ? Math.random() * h : (node ? node.y + (Math.random() - 0.5) * 40 : -20);

      return {
        x: startX,
        y: startY,
        vx: -0.4 - Math.random() * 0.8, // gentle drift leftwards
        vy: 0.6 + Math.random() * 0.9,  // fall speed
        size: 5 + Math.random() * 7,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        flip: Math.random() * Math.PI * 2,
        flipSpeed: 0.03 + Math.random() * 0.04,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 1.2 + Math.random() * 1.5,
        swayAmp: 1.2 + Math.random() * 1.5,
        color,
        alpha: 0.65 + Math.random() * 0.35,
      };
    };

    const count = Math.max(15, activeCountRef.current);
    const initialNodes = getBranchNodes(getW(), getH());
    const leaves = [];
    for (let i = 0; i < count; i++) {
      leaves.push(createFallingLeaf(getW(), getH(), initialNodes, true));
    }

    /* ── Draw Tree & Sprawling Branches ── */
    const drawTree = (w, h, shakeOffset) => {
      ctx.save();
      ctx.translate(shakeOffset.x, shakeOffset.y);

      // Root / Trunk base on right side behind card fan
      const trunkX = w * 0.78;
      const trunkY = h * 0.98;

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 1. Trunk
      const trunkGrad = ctx.createLinearGradient(trunkX, trunkY, trunkX - 80, h * 0.4);
      trunkGrad.addColorStop(0, "rgba(58, 25, 38, 0.85)");
      trunkGrad.addColorStop(0.5, "rgba(82, 38, 54, 0.75)");
      trunkGrad.addColorStop(1, "rgba(108, 48, 70, 0.65)");

      ctx.beginPath();
      ctx.moveTo(trunkX + 45, trunkY);
      ctx.quadraticCurveTo(trunkX + 25, h * 0.75, trunkX - 10, h * 0.55);
      ctx.quadraticCurveTo(trunkX - 35, h * 0.42, trunkX - 60, h * 0.32);
      ctx.lineTo(trunkX - 80, h * 0.32);
      ctx.quadraticCurveTo(trunkX - 45, h * 0.45, trunkX - 25, h * 0.6);
      ctx.quadraticCurveTo(trunkX - 5, h * 0.78, trunkX - 15, trunkY);
      ctx.closePath();
      ctx.fillStyle = trunkGrad;
      ctx.fill();

      // 2. Main Large Branch curving upwards and left across top
      ctx.beginPath();
      ctx.moveTo(trunkX - 65, h * 0.33);
      ctx.quadraticCurveTo(w * 0.65, h * 0.22, w * 0.52, h * 0.16);
      ctx.quadraticCurveTo(w * 0.42, h * 0.12, w * 0.32, h * 0.20);
      ctx.strokeStyle = "rgba(78, 34, 50, 0.7)";
      ctx.lineWidth = 12;
      ctx.stroke();

      // 3. Secondary upper branch reaching high top-left
      ctx.beginPath();
      ctx.moveTo(w * 0.60, h * 0.19);
      ctx.quadraticCurveTo(w * 0.55, h * 0.08, w * 0.42, h * 0.06);
      ctx.strokeStyle = "rgba(88, 38, 56, 0.65)";
      ctx.lineWidth = 7;
      ctx.stroke();

      // 4. Branch arching towards top-right
      ctx.beginPath();
      ctx.moveTo(trunkX - 30, h * 0.45);
      ctx.quadraticCurveTo(w * 0.85, h * 0.35, w * 0.94, h * 0.26);
      ctx.strokeStyle = "rgba(88, 38, 56, 0.65)";
      ctx.lineWidth = 9;
      ctx.stroke();

      // 5. Higher sub-branch right
      ctx.beginPath();
      ctx.moveTo(w * 0.82, h * 0.36);
      ctx.quadraticCurveTo(w * 0.86, h * 0.22, w * 0.92, h * 0.15);
      ctx.strokeStyle = "rgba(98, 42, 62, 0.55)";
      ctx.lineWidth = 5;
      ctx.stroke();

      // 6. Mid-height spreading artistic tendril
      ctx.beginPath();
      ctx.moveTo(w * 0.52, h * 0.16);
      ctx.quadraticCurveTo(w * 0.45, h * 0.28, w * 0.36, h * 0.34);
      ctx.strokeStyle = "rgba(98, 42, 62, 0.55)";
      ctx.lineWidth = 5;
      ctx.stroke();

      // 7. Foliage / Blossom Clusters along branch nodes
      const colors = activeColorsRef.current;
      const nodes = getBranchNodes(w, h);

      nodes.forEach((node, nIdx) => {
        const clusterCount = node.clusterSize || 16;
        for (let b = 0; b < clusterCount; b++) {
          const offsetX = (Math.sin(b * 1.7 + nIdx) * 35);
          const offsetY = (Math.cos(b * 1.9 + nIdx) * 25);
          const leafSize = 4 + (b % 4) * 2;
          const color = colors[(b + nIdx) % colors.length] || "#e11d48";

          ctx.save();
          ctx.translate(node.x + offsetX, node.y + offsetY);
          ctx.rotate((b * 37 * Math.PI) / 180);
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.45 + (b % 3) * 0.2;
          drawLeafPath(ctx, leafSize);
          ctx.fill();
          ctx.restore();
        }
      });

      ctx.restore();
    };

    /* ── Click / Burst Trigger Handler ── */
    const triggerLeafBurst = (clickX, clickY) => {
      if (!canBurstRef.current) return;
      canBurstRef.current = false;
      setCanBurstState(false);

      // Start tree shake impulse
      treeShakeRef.current.intensity = 12;

      const colors = activeColorsRef.current;
      const nodes = getBranchNodes(getW(), getH());
      // Center burst around click or closest branch node
      const burstOriginX = clickX || getW() * 0.65;
      const burstOriginY = clickY || getH() * 0.22;

      // Spawn 45-60 burst particles
      const burstCount = 50 + Math.floor(Math.random() * 15);
      for (let i = 0; i < burstCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const blastSpeed = 3.5 + Math.random() * 7.5;
        const color = colors[Math.floor(Math.random() * colors.length)] || "#e11d48";

        burstParticlesRef.current.push({
          x: burstOriginX + (Math.random() - 0.5) * 40,
          y: burstOriginY + (Math.random() - 0.5) * 40,
          vx: Math.cos(angle) * blastSpeed,
          vy: Math.sin(angle) * blastSpeed - 1.5, // slight upward pop
          size: 6 + Math.random() * 8,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.12,
          flip: Math.random() * Math.PI * 2,
          flipSpeed: 0.06 + Math.random() * 0.08,
          color,
          alpha: 1,
          gravity: 0.12,
          friction: 0.94,
          life: 1,
          decay: 0.007 + Math.random() * 0.006, // ~2.5 - 3s life
        });
      }

      // Also trigger a shower from all tree nodes
      nodes.forEach((n) => {
        for (let k = 0; k < 3; k++) {
          const angle = Math.random() * Math.PI * 2;
          burstParticlesRef.current.push({
            x: n.x + (Math.random() - 0.5) * 20,
            y: n.y + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 3,
            vy: 0.5 + Math.random() * 2,
            size: 5 + Math.random() * 6,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.08,
            flip: Math.random() * Math.PI * 2,
            flipSpeed: 0.05,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1,
            gravity: 0.08,
            friction: 0.97,
            life: 1,
            decay: 0.008,
          });
        }
      });

      // 1.8s debounce cooldown
      setTimeout(() => {
        canBurstRef.current = true;
        setCanBurstState(true);
      }, 1800);
    };

    const handleCanvasClick = (e) => {
      const rect = cvs.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      triggerLeafBurst(clickX, clickY);
    };

    cvs.addEventListener("click", handleCanvasClick);

    /* ── Animation Render Loop ── */
    let startTime = performance.now();
    let rafId = 0;

    const render = (now) => {
      const w = getW();
      const h = getH();
      const time = (now - startTime) / 1000;
      const spd = activeSpeedRef.current;

      ctx.clearRect(0, 0, w, h);

      // Tree Shake / Wind Sway Calculation
      const shake = treeShakeRef.current;
      shake.intensity *= shake.decay;
      if (shake.intensity < 0.05) shake.intensity = 0;

      const windSway = Math.sin(time * 1.5) * 2.5;
      const shakeOffsetX = (Math.random() - 0.5) * shake.intensity + windSway;
      const shakeOffsetY = (Math.random() - 0.5) * (shake.intensity * 0.5);

      // 1. Draw Tree & Blossom Branches
      drawTree(w, h, { x: shakeOffsetX, y: shakeOffsetY });

      const nodes = getBranchNodes(w, h);

      // 2. Draw & Update Continuous Falling Leaves
      for (let i = 0; i < leaves.length; i++) {
        const leaf = leaves[i];
        leaf.y += leaf.vy * spd;
        leaf.x += (leaf.vx + Math.sin(time * leaf.swaySpeed + leaf.swayPhase) * leaf.swayAmp) * spd;
        leaf.rotation += leaf.rotSpeed;
        leaf.flip += leaf.flipSpeed;

        // Reset when out of bounds
        if (leaf.y > h + 20 || leaf.x < -30) {
          const fresh = createFallingLeaf(w, h, nodes, false);
          Object.assign(leaf, fresh);
        }

        // Draw Tumbling Leaf
        ctx.save();
        ctx.translate(leaf.x, leaf.y);
        ctx.rotate(leaf.rotation);
        ctx.scale(Math.cos(leaf.flip), 1); // 3D Tumbling perspective
        ctx.fillStyle = leaf.color;
        ctx.globalAlpha = leaf.alpha;
        drawLeafPath(ctx, leaf.size);
        ctx.fill();
        ctx.restore();
      }

      // 3. Draw & Update Burst Particles (Interactive Click Burst)
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

        if (p.life <= 0 || p.y > h + 30) {
          bursts.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.scale(Math.cos(p.flip), 1);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life * p.alpha);
        drawLeafPath(ctx, p.size);
        ctx.fill();
        ctx.restore();
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      cvs.removeEventListener("click", handleCanvasClick);
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

      {/* Tiny subtle aesthetic interaction hint on top-right of tree */}
      <div className="absolute top-20 right-8 md:right-16 pointer-events-none opacity-40 hover:opacity-80 transition-opacity font-mono text-[10px] text-umber/80 bg-white/40 backdrop-blur-xs px-2.5 py-1 rounded-full border border-umber/15 select-none hidden sm:flex items-center gap-1.5 shadow-xs">
        <span>🌸</span>
        <span>Dallara tıkla: Yaprakları savur</span>
      </div>
    </div>
  );
}
