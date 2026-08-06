import { useCallback, useEffect, useRef } from "react";

/**
 * ParticleCanvas / StarrySkyCanvas — Interactive Night Sky with GitHubSky-style twinkling stars,
 * periodic star flare/sparkle animations (every 5-7s), mouse parallax,
 * and shooting star / meteor streaks (every 15-20s).
 */
export default function ParticleCanvas({
  particleCount = 240,
  speed = 1,
  accentColor = "#c0956c",
  className = "",
}) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1, y: -1, inside: false });
  const rafRef = useRef(0);

  // Sync prop refs
  const speedRef = useRef(speed);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    /* sizing */
    const resize = () => {
      cvs.width = cvs.offsetWidth * dpr;
      cvs.height = cvs.offsetHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const getW = () => cvs.offsetWidth;
    const getH = () => cvs.offsetHeight;

    /* ── Generate Stars (GitHubSky Twinkle Logic) ──── */
    const count = Math.min(300, Math.max(120, particleCount));
    const stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        id: i,
        x: Math.random(),
        y: Math.random(),
        size: 0.7 + Math.random() * 1.5,
        baseOpacity: 0.15 + Math.random() * 0.55,
        twinkleSpeed: 0.35 + Math.random() * 1.1,
        twinklePhase: Math.random() * Math.PI * 2,
        isWarm: Math.random() > 0.75, // Some warm golden stars
      });
    }

    /* ── Mouse Listener ── */
    const handlePointerMove = (e) => {
      const rect = cvs.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / (rect.width || 1),
        y: (e.clientY - rect.top) / (rect.height || 1),
        inside: true,
      };
    };

    const handlePointerLeave = () => {
      mouseRef.current.inside = false;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

    /* ── Periodic Star Flare (Arada bir parlayan yıldız: 5-7s) ── */
    let activeFlare = null; // { starIndex, startTime, duration }
    let nextFlareTime = performance.now() + 2000; // First flare after 2s

    /* ── Shooting Star / Meteor State (15-20s interval) ── */
    let shootingStar = null; // { startX, startY, angle, length, speed, startTime, duration }
    let nextShootingStarTime = performance.now() + 4000; // First shooting star after 4s
    const stardust = []; // Tail dust particles

    const triggerShootingStar = (now) => {
      const w = getW();
      const h = getH();
      const angle = (35 + Math.random() * 20) * (Math.PI / 180); // ~35° - 55° downward diagonal
      shootingStar = {
        startX: Math.random() * w * 0.7,
        startY: Math.random() * h * 0.3,
        angle,
        length: 140 + Math.random() * 100,
        startTime: now,
        duration: 1200 + Math.random() * 400, // ~1.2s - 1.6s flight
      };

      // Schedule next shooting star in 15 - 20 seconds
      nextShootingStarTime = now + 15000 + Math.random() * 5000;
    };

    /* ── Draw Loop ── */
    let startTime = performance.now();

    const render = (now) => {
      const w = getW();
      const h = getH();
      const spd = speedRef.current;
      const time = (now - startTime) / 1000;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      /* 1. Subtle Night Sky Radial Gradient Backdrop */
      const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.2, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.8);
      bgGrad.addColorStop(0, "rgba(22, 28, 48, 0.4)");
      bgGrad.addColorStop(0.6, "rgba(12, 14, 24, 0.2)");
      bgGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      const ptr = mouseRef.current;

      /* 2. Check & Trigger Periodic Star Flare */
      if (!activeFlare && now >= nextFlareTime) {
        const randIdx = Math.floor(Math.random() * stars.length);
        activeFlare = {
          starIndex: randIdx,
          startTime: now,
          duration: 2200, // 2.2 seconds flare
        };
        nextFlareTime = now + 5000 + Math.random() * 3000; // Next flare in 5-8s
      }

      /* 3. Check & Trigger Shooting Star (15-20s) */
      if (!shootingStar && now >= nextShootingStarTime) {
        triggerShootingStar(now);
      }

      /* 4. Render Stars */
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Twinkle formula from GitHubSky: 0.55 + 0.45 * sin(time * speed + phase)
        const twinkle = 0.55 + 0.45 * Math.sin(time * star.twinkleSpeed * Math.PI * 2 + star.twinklePhase);
        let opacity = star.baseOpacity * twinkle;
        let scale = 1;
        let tx = 0;
        let ty = 0;

        // Mouse Parallax & Proximity Glow
        if (ptr.inside) {
          const dx = star.x - ptr.x;
          const dy = star.y - ptr.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const parallaxRadius = 0.25;

          if (dist < parallaxRadius && dist > 0.001) {
            const influence = 1 - dist / parallaxRadius;
            const parallaxStrength = 4;
            tx = (dx / dist) * influence * parallaxStrength;
            ty = (dy / dist) * influence * parallaxStrength;
            opacity *= 1 + influence * 0.65;
            scale = 1 + influence * 0.25;
          }
        }

        const px = star.x * w + tx;
        const py = star.y * h + ty;
        const r = star.size * scale;

        // Draw Base Star Point
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        if (star.isWarm) {
          ctx.fillStyle = `rgba(255, 238, 205, ${Math.min(1, opacity.toFixed(2))})`;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, opacity.toFixed(2))})`;
        }
        ctx.fill();

        // Subtle outer glow for larger stars
        if (r > 1.4 && opacity > 0.4) {
          ctx.beginPath();
          ctx.arc(px, py, r * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = star.isWarm
            ? `rgba(255, 220, 160, ${(opacity * 0.18).toFixed(2)})`
            : `rgba(255, 255, 255, ${(opacity * 0.15).toFixed(2)})`;
          ctx.fill();
        }

        /* ── 5. Render Active Star Flare / Bloom ── */
        if (activeFlare && activeFlare.starIndex === i) {
          const elapsed = now - activeFlare.startTime;
          if (elapsed > activeFlare.duration) {
            activeFlare = null;
          } else {
            const flareProgress = elapsed / activeFlare.duration;
            // Bell curve intensity (0 -> 1 -> 0)
            const intensity = Math.sin(flareProgress * Math.PI);

            // Halo Radial Glow
            const haloR = (12 + r * 6) * intensity;
            const haloGrad = ctx.createRadialGradient(px, py, 0, px, py, haloR);
            haloGrad.addColorStop(0, `rgba(255, 245, 210, ${(0.85 * intensity).toFixed(2)})`);
            haloGrad.addColorStop(0.4, `rgba(225, 29, 72, ${(0.35 * intensity).toFixed(2)})`);
            haloGrad.addColorStop(1, "rgba(255, 200, 150, 0)");

            ctx.beginPath();
            ctx.arc(px, py, haloR, 0, Math.PI * 2);
            ctx.fillStyle = haloGrad;
            ctx.fill();

            // Diamond / Cross Sparkle Flare Rays
            const rayLen = (18 + r * 8) * intensity;
            const rayWidth = 1.5 * intensity;

            ctx.save();
            ctx.translate(px, py);
            ctx.fillStyle = `rgba(255, 255, 255, ${(0.9 * intensity).toFixed(2)})`;

            // Horizontal Ray
            ctx.beginPath();
            ctx.moveTo(-rayLen, 0);
            ctx.quadraticCurveTo(0, -rayWidth, rayLen, 0);
            ctx.quadraticCurveTo(0, rayWidth, -rayLen, 0);
            ctx.fill();

            // Vertical Ray
            ctx.beginPath();
            ctx.moveTo(0, -rayLen);
            ctx.quadraticCurveTo(-rayWidth, 0, 0, rayLen);
            ctx.quadraticCurveTo(rayWidth, 0, 0, -rayLen);
            ctx.fill();

            ctx.restore();
          }
        }
      }

      /* ── 6. Render Shooting Star (15-20s Kayan Yıldız) ── */
      if (shootingStar) {
        const elapsed = now - shootingStar.startTime;
        if (elapsed > shootingStar.duration) {
          shootingStar = null;
        } else {
          const progress = elapsed / shootingStar.duration;
          // Fade in & out along trajectory
          const fade = Math.sin(progress * Math.PI);

          const distance = Math.hypot(w, h) * 0.45;
          const currentDist = distance * progress;

          const headX = shootingStar.startX + Math.cos(shootingStar.angle) * currentDist;
          const headY = shootingStar.startY + Math.sin(shootingStar.angle) * currentDist;

          const tailLen = Math.min(shootingStar.length, currentDist);
          const tailX = headX - Math.cos(shootingStar.angle) * tailLen;
          const tailY = headY - Math.sin(shootingStar.angle) * tailLen;

          // Draw Meteor Trail Line
          const trailGrad = ctx.createLinearGradient(tailX, tailY, headX, headY);
          trailGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
          trailGrad.addColorStop(0.6, `rgba(255, 210, 160, ${(0.45 * fade).toFixed(2)})`);
          trailGrad.addColorStop(1, `rgba(255, 255, 255, ${(0.95 * fade).toFixed(2)})`);

          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(headX, headY);
          ctx.strokeStyle = trailGrad;
          ctx.lineWidth = 2;
          ctx.lineCap = "round";
          ctx.stroke();

          // Draw Glowing Meteor Head
          const headGrad = ctx.createRadialGradient(headX, headY, 0, headX, headY, 8);
          headGrad.addColorStop(0, `rgba(255, 255, 255, ${(1 * fade).toFixed(2)})`);
          headGrad.addColorStop(0.4, `rgba(255, 220, 150, ${(0.6 * fade).toFixed(2)})`);
          headGrad.addColorStop(1, "rgba(255, 180, 100, 0)");

          ctx.beginPath();
          ctx.arc(headX, headY, 8, 0, Math.PI * 2);
          ctx.fillStyle = headGrad;
          ctx.fill();

          // Spawn stardust particles along path
          if (Math.random() < 0.6) {
            stardust.push({
              x: headX + (Math.random() - 0.5) * 4,
              y: headY + (Math.random() - 0.5) * 4,
              vx: (Math.random() - 0.5) * 0.5,
              vy: (Math.random() - 0.5) * 0.5,
              life: 1,
              decay: 0.03 + Math.random() * 0.03,
              size: 0.8 + Math.random() * 1.2,
            });
          }
        }
      }

      /* ── 7. Render Stardust Particles ── */
      for (let i = stardust.length - 1; i >= 0; i--) {
        const p = stardust[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.life <= 0) {
          stardust.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 220, 170, ${p.life.toFixed(2)})`;
        ctx.fill();
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, [particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 w-full h-full ${className}`}
    />
  );
}
