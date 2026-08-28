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

    /* ── Generate Stars & Rapunzel Fairytale Sparkles ──── */
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
        isWarm: Math.random() > 0.75, // Golden stars
        isRose: Math.random() > 0.65, // Rapunzel pink/rose fairy sparkle
      });
    }

    /* ── Floating Rapunzel Lantern / Petal Sparkles (Light Mode) ──── */
    const rapunzelSparkles = [];
    for (let i = 0; i < 18; i++) {
      rapunzelSparkles.push({
        x: Math.random(),
        y: Math.random(),
        r: 1.2 + Math.random() * 2.2,
        vy: 0.00015 + Math.random() * 0.00025, // Slow upward drift
        swaySpeed: 0.5 + Math.random() * 1.2,
        swayPhase: Math.random() * Math.PI * 2,
        swayAmp: 0.0004 + Math.random() * 0.0006,
        alpha: 0.25 + Math.random() * 0.45,
        hue: Math.random() > 0.5 ? "rose" : "amber", // Rose or warm golden lantern
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

      const isLight = document.documentElement.classList.contains("light");

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      /* 1. Dynamic Atmosphere Backdrop (Light Mode: Soft Fairytale Aura | Dark Mode: Midnight Sky) */
      if (isLight) {
        // Luminous warm fairytale aura without any dark/black artifacts
        const lightGrad = ctx.createRadialGradient(w * 0.5, h * 0.35, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.75);
        lightGrad.addColorStop(0, "rgba(255, 255, 255, 0.45)");
        lightGrad.addColorStop(0.35, "rgba(255, 230, 240, 0.25)");
        lightGrad.addColorStop(0.75, "rgba(253, 215, 226, 0.12)");
        lightGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = lightGrad;
        ctx.fillRect(0, 0, w, h);
      } else {
        // Dark Mode Midnight Gradient
        const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.2, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.8);
        bgGrad.addColorStop(0, "rgba(22, 28, 48, 0.4)");
        bgGrad.addColorStop(0.6, "rgba(12, 14, 24, 0.2)");
        bgGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);
      }

      const ptr = mouseRef.current;

      /* 2. Floating Rapunzel Lantern / Petal Sparkles (Light Mode Fairy Touch) */
      if (isLight) {
        for (let i = 0; i < rapunzelSparkles.length; i++) {
          const sp = rapunzelSparkles[i];
          sp.y -= sp.vy * spd;
          sp.x += Math.sin(time * sp.swaySpeed + sp.swayPhase) * sp.swayAmp;

          // Wrap around screen
          if (sp.y < -0.05) sp.y = 1.05;
          if (sp.x < -0.05) sp.x = 1.05;
          if (sp.x > 1.05) sp.x = -0.05;

          const sx = sp.x * w;
          const sy = sp.y * h;
          const pulse = 0.7 + 0.3 * Math.sin(time * 2 + sp.swayPhase);
          const currentAlpha = sp.alpha * pulse;

          // Soft Glowing Fairy Orb
          const spGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, sp.r * 2.5);
          if (sp.hue === "rose") {
            spGrad.addColorStop(0, `rgba(251, 113, 133, ${(currentAlpha * 0.9).toFixed(2)})`);
            spGrad.addColorStop(0.5, `rgba(244, 63, 94, ${(currentAlpha * 0.4).toFixed(2)})`);
            spGrad.addColorStop(1, "rgba(255, 200, 220, 0)");
          } else {
            spGrad.addColorStop(0, `rgba(253, 224, 71, ${(currentAlpha * 0.9).toFixed(2)})`);
            spGrad.addColorStop(0.5, `rgba(245, 158, 11, ${(currentAlpha * 0.4).toFixed(2)})`);
            spGrad.addColorStop(1, "rgba(255, 235, 180, 0)");
          }

          ctx.beginPath();
          ctx.arc(sx, sy, sp.r * pulse * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = spGrad;
          ctx.fill();

          // Shiny Center Core
          ctx.beginPath();
          ctx.arc(sx, sy, sp.r * 0.7, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${(currentAlpha * 0.95).toFixed(2)})`;
          ctx.fill();
        }
      }

      /* 3. Check & Trigger Periodic Star Flare */
      if (!activeFlare && now >= nextFlareTime) {
        const randIdx = Math.floor(Math.random() * stars.length);
        activeFlare = {
          starIndex: randIdx,
          startTime: now,
          duration: 2200, // 2.2 seconds flare
        };
        nextFlareTime = now + 5000 + Math.random() * 3000; // Next flare in 5-8s
      }

      /* 4. Check & Trigger Shooting Star (15-20s) */
      if (!shootingStar && now >= nextShootingStarTime) {
        triggerShootingStar(now);
      }

      /* 5. Render Stars */
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Twinkle formula
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

        if (isLight) {
          // Rapunzel Light mode colors (Rose, Amber, Pearl)
          if (star.isRose) {
            ctx.fillStyle = `rgba(225, 29, 72, ${Math.min(0.85, (opacity * 0.8).toFixed(2))})`;
          } else if (star.isWarm) {
            ctx.fillStyle = `rgba(217, 119, 6, ${Math.min(0.85, (opacity * 0.75).toFixed(2))})`;
          } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, (opacity * 0.95).toFixed(2))})`;
          }
        } else {
          // Dark mode colors
          if (star.isWarm) {
            ctx.fillStyle = `rgba(255, 238, 205, ${Math.min(1, opacity.toFixed(2))})`;
          } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, opacity.toFixed(2))})`;
          }
        }
        ctx.fill();

        // Outer glow for larger stars
        if (r > 1.3 && opacity > 0.35) {
          ctx.beginPath();
          ctx.arc(px, py, r * 2.2, 0, Math.PI * 2);
          if (isLight) {
            ctx.fillStyle = star.isRose
              ? `rgba(244, 63, 94, ${(opacity * 0.2).toFixed(2)})`
              : `rgba(255, 255, 255, ${(opacity * 0.35).toFixed(2)})`;
          } else {
            ctx.fillStyle = star.isWarm
              ? `rgba(255, 220, 160, ${(opacity * 0.18).toFixed(2)})`
              : `rgba(255, 255, 255, ${(opacity * 0.15).toFixed(2)})`;
          }
          ctx.fill();
        }

        /* ── 6. Render Active Star Flare / Bloom ── */
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
            if (isLight) {
              haloGrad.addColorStop(0, `rgba(255, 255, 255, ${(0.95 * intensity).toFixed(2)})`);
              haloGrad.addColorStop(0.4, `rgba(251, 113, 133, ${(0.45 * intensity).toFixed(2)})`);
              haloGrad.addColorStop(1, "rgba(255, 225, 235, 0)");
            } else {
              haloGrad.addColorStop(0, `rgba(255, 245, 210, ${(0.85 * intensity).toFixed(2)})`);
              haloGrad.addColorStop(0.4, `rgba(225, 29, 72, ${(0.35 * intensity).toFixed(2)})`);
              haloGrad.addColorStop(1, "rgba(255, 200, 150, 0)");
            }

            ctx.beginPath();
            ctx.arc(px, py, haloR, 0, Math.PI * 2);
            ctx.fillStyle = haloGrad;
            ctx.fill();

            // Diamond / Cross Sparkle Flare Rays
            const rayLen = (18 + r * 8) * intensity;
            const rayWidth = 1.5 * intensity;

            ctx.save();
            ctx.translate(px, py);
            ctx.fillStyle = isLight
              ? `rgba(255, 255, 255, ${(0.98 * intensity).toFixed(2)})`
              : `rgba(255, 255, 255, ${(0.9 * intensity).toFixed(2)})`;

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

      /* ── 7. Render Shooting Star (15-20s Kayan Yıldız) ── */
      if (shootingStar) {
        const elapsed = now - shootingStar.startTime;
        if (elapsed > shootingStar.duration) {
          shootingStar = null;
        } else {
          const progress = elapsed / shootingStar.duration;
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
          if (isLight) {
            trailGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
            trailGrad.addColorStop(0.5, `rgba(251, 113, 133, ${(0.55 * fade).toFixed(2)})`);
            trailGrad.addColorStop(1, `rgba(255, 255, 255, ${(0.95 * fade).toFixed(2)})`);
          } else {
            trailGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
            trailGrad.addColorStop(0.6, `rgba(255, 210, 160, ${(0.45 * fade).toFixed(2)})`);
            trailGrad.addColorStop(1, `rgba(255, 255, 255, ${(0.95 * fade).toFixed(2)})`);
          }

          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(headX, headY);
          ctx.strokeStyle = trailGrad;
          ctx.lineWidth = 2.2;
          ctx.lineCap = "round";
          ctx.stroke();

          // Draw Glowing Meteor Head
          const headGrad = ctx.createRadialGradient(headX, headY, 0, headX, headY, 8);
          headGrad.addColorStop(0, `rgba(255, 255, 255, ${(1 * fade).toFixed(2)})`);
          if (isLight) {
            headGrad.addColorStop(0.4, `rgba(251, 113, 133, ${(0.7 * fade).toFixed(2)})`);
            headGrad.addColorStop(1, "rgba(255, 210, 225, 0)");
          } else {
            headGrad.addColorStop(0.4, `rgba(255, 220, 150, ${(0.6 * fade).toFixed(2)})`);
            headGrad.addColorStop(1, "rgba(255, 180, 100, 0)");
          }

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
              isLight,
            });
          }
        }
      }

      /* ── 8. Render Stardust Particles ── */
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
        if (p.isLight) {
          ctx.fillStyle = `rgba(251, 113, 133, ${p.life.toFixed(2)})`;
        } else {
          ctx.fillStyle = `rgba(255, 220, 170, ${p.life.toFixed(2)})`;
        }
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
