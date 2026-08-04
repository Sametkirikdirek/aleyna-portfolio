import { motion } from "framer-motion";

/**
 * Animated Heart Component — Pulsating Glowing Heart with Light Pink & Midnight Blue gradients.
 */
export default function HeartAnimation({ isColorActive, className = "" }) {
  return (
    <motion.div
      animate={{ scale: [1, 1.12, 1, 1.08, 1] }}
      transition={{
        duration: 2.2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`relative inline-flex items-center justify-center ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-full h-full transition-all duration-700"
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
        </defs>

        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill={isColorActive ? "url(#heartGradActive)" : "url(#heartGradIdle)"}
          style={{
            filter: isColorActive
              ? "drop-shadow(0 0 8px #ff8fa3) drop-shadow(0 0 16px #3b82f6)"
              : "drop-shadow(0 0 6px rgba(255,255,255,0.8))",
            transition: "all 0.7s ease-in-out",
          }}
        />
      </svg>
    </motion.div>
  );
}
