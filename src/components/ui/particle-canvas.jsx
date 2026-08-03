import { useCallback, useEffect, useRef } from "react";

/**
 * ParticleHero — Canvas-based animated particle field with rotating spotlight.
 * Features smooth color & speed lerping without resetting particle positions.
 */
export default function ParticleCanvas({
  particleCount = 900,
  speed = 1,
  accentColor = "#c0956c",
  className = "",
}) {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });
  const raf = useRef(0);

  /* ── hex → {r,g,b} ─────────────────────────────── */
  const hexToRgb = useCallback((hex) => {
    const c = hex.replace("#", "");
    return {
      r: parseInt(c.substring(0, 2), 16),
      g: parseInt(c.substring(2, 4), 16),
      b: parseInt(c.substring(4, 6), 16),
    };
  }, []);

  // Refs for smooth lerp transitions without triggering particle re-creation
  const speedRef = useRef(speed);
  const currentSpeed = useRef(speed);
  const targetRgbRef = useRef(hexToRgb(accentColor));
  const currentRgbRef = useRef(hexToRgb(accentColor));

  // Sync prop changes smoothly
  useEffect(() => {
    speedRef.current = speed;
    targetRgbRef.current = hexToRgb(accentColor);
  }, [speed, accentColor, hexToRgb]);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio, 2);

    /* sizing */
    const resize = () => {
      cvs.width = cvs.offsetWidth * dpr;
      cvs.height = cvs.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const W = () => cvs.offsetWidth;
    const H = () => cvs.offsetHeight;

    /* ── particles (created ONLY on mount or when count changes) ──── */
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * W(),
        y: Math.random() * H(),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.8 + 0.6,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.02 + Math.random() * 0.03,
      });
    }

    /* ── draw loop ────────────────────────────────── */
    let t = 0;
    const draw = () => {
      // Smoothly lerp speed and colors
      currentSpeed.current += (speedRef.current - currentSpeed.current) * 0.05;
      const curR = currentRgbRef.current.r += (targetRgbRef.current.r - currentRgbRef.current.r) * 0.04;
      const curG = currentRgbRef.current.g += (targetRgbRef.current.g - currentRgbRef.current.g) * 0.04;
      const curB = currentRgbRef.current.b += (targetRgbRef.current.b - currentRgbRef.current.b) * 0.04;

      const spd = currentSpeed.current;
      t += 0.016 * spd;
      const w = W();
      const h = H();

      ctx.clearRect(0, 0, w, h);

      /* rotating spotlight */
      const spotAngle = t * 0.3;
      const spotX = w * 0.5 + Math.cos(spotAngle) * w * 0.35;
      const spotY = h * 0.5 + Math.sin(spotAngle) * h * 0.3;
      const spotR = Math.min(w, h) * 0.55;
      const grad = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, spotR);
      grad.addColorStop(0, `rgba(${Math.round(curR)},${Math.round(curG)},${Math.round(curB)},0.08)`);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      /* second subtle spotlight */
      const spot2X = w * 0.5 + Math.cos(spotAngle + Math.PI) * w * 0.25;
      const spot2Y = h * 0.5 + Math.sin(spotAngle + Math.PI) * h * 0.25;
      const grad2 = ctx.createRadialGradient(spot2X, spot2Y, 0, spot2X, spot2Y, spotR * 0.7);
      grad2.addColorStop(0, "rgba(120,180,220,0.04)");
      grad2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, w, h);

      /* draw particles */
      for (const p of particles) {
        /* mouse repulsion */
        const mx = mouse.current.x * w;
        const my = mouse.current.y * h;
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = ((120 - dist) / 120) * 0.6;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        /* physics */
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx * spd;
        p.y += p.vy * spd;

        /* wrap edges */
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        /* twinkle */
        p.phase += p.twinkleSpeed * spd;
        const alpha = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(p.phase));

        /* distance to spotlight → warm tint */
        const dSpot = Math.sqrt((p.x - spotX) ** 2 + (p.y - spotY) ** 2);
        const inSpot = Math.max(0, 1 - dSpot / spotR);

        const r = Math.round(200 + inSpot * (curR - 200));
        const g = Math.round(200 + inSpot * (curG - 200));
        const b = Math.round(210 + inSpot * (curB - 210));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha.toFixed(2)})`;
        ctx.fill();
      }

      /* connection lines */
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const d = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
          if (d < 80) {
            const midX = (a.x + b.x) / 2;
            const midY = (a.y + b.y) / 2;
            const dMid = Math.sqrt((midX - spotX) ** 2 + (midY - spotY) ** 2);
            const inSpotLine = Math.max(0, 1 - dMid / spotR);
            if (inSpotLine > 0.2) {
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(${Math.round(curR)},${Math.round(curG)},${Math.round(curB)},${(
                0.08 *
                inSpotLine *
                (1 - d / 80)
              ).toFixed(3)})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      raf.current = requestAnimationFrame(draw);
    };

    raf.current = requestAnimationFrame(draw);

    /* mouse tracking */
    const onMove = (e) => {
      const rect = cvs.getBoundingClientRect();
      mouse.current.x = (e.clientX - rect.left) / rect.width;
      mouse.current.y = (e.clientY - rect.top) / rect.height;
    };
    cvs.addEventListener("pointermove", onMove);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
      cvs.removeEventListener("pointermove", onMove);
    };
  }, [particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ pointerEvents: "auto" }}
    />
  );
}
