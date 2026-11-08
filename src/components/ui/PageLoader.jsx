import { motion } from "framer-motion";

export default function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
      <div className="relative w-12 h-12 flex items-center justify-center">
        {/* Pulsing glow orb */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.35, 0.75, 0.35],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-500/40 via-amber-500/30 to-rose-600/40 blur-md"
        />

        {/* Rotating subtle ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-8 h-8 rounded-full border-2 border-transparent border-t-rose-500 border-r-amber-500/50"
        />
      </div>

      <motion.p
        animate={{ opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="font-mono text-xs tracking-[0.25em] uppercase text-umber/80 dark:text-paper/60"
      >
        Yükleniyor...
      </motion.p>
    </div>
  );
}

