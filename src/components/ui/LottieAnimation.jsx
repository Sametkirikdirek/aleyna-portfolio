import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Animated Heart Component — Pulsating Glowing Heart with Splash Burst & Light Pink/Midnight Blue theme.
 */
export default function HeartAnimation({ isColorActive, className = "" }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate a 12-particle radial splash whenever isColorActive state changes
    const newParticles = Array.from({ length: 12 }, (_, i) => {
      const angle = (i * 360) / 12 + (Math.random() * 20 - 10);
      const distance = 22 + Math.random() * 20;
      const rad = (angle * Math.PI) / 180;
      return {
        id: Date.now() + "-" + i,
        x: Math.cos(rad) * distance,
        y: Math.sin(rad) * distance,
        size: 3 + Math.random() * 4,
        color: i % 2 === 0 ? "#ff8fa3" : "#3b82f6",
      };
    });

    setParticles(newParticles);
    const timer = setTimeout(() => setParticles([]), 750);
    return () => clearTimeout(timer);
  }, [isColorActive]);

  return (
    <div className={`relative inline-flex items-center justify-center overflow-visible ${className}`}>
      {/* Particle Splash */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            initial={{ opacity: 1, scale: 0.2, x: 0, y: 0 }}
            animate={{
              opacity: [1, 0.9, 0],
              scale: [0.4, 1.3, 0],
              x: p.x,
              y: p.y,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="absolute rounded-full pointer-events-none z-20"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 8px ${p.color}`,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Heart Pulse */}
      <motion.div
        animate={{ scale: isColorActive ? [1, 1.18, 1, 1.12, 1] : [1, 1.06, 1] }}
        transition={{
          duration: isColorActive ? 1.6 : 2.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="w-full h-full flex items-center justify-center overflow-visible"
      >
        <svg
          viewBox="-6 -6 36 36"
          className="w-full h-full overflow-visible pointer-events-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Active Gradient: Light Pink -> Midnight Blue */}
            <linearGradient id="heartGradActive" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff8fa3" />
              <stop offset="45%" stopColor="#ff758f" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>

            {/* Idle Gradient: Crisp White -> Soft Pastel Pink */}
            <linearGradient id="heartGradIdle" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f7cad0" />
            </linearGradient>

            {/* Vector Glow Filter for Active State */}
            <filter id="heartGlowActive" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#ff8fa3" floodOpacity="0.9" />
              <feDropShadow dx="0" dy="0" stdDeviation="4.5" floodColor="#3b82f6" floodOpacity="0.75" />
            </filter>

            {/* Vector Glow Filter for Idle State */}
            <filter id="heartGlowIdle" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#ffffff" floodOpacity="0.85" />
            </filter>
          </defs>

          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill={isColorActive ? "url(#heartGradActive)" : "url(#heartGradIdle)"}
            filter={isColorActive ? "url(#heartGlowActive)" : "url(#heartGlowIdle)"}
          />
        </svg>
      </motion.div>
    </div>
  );
}
