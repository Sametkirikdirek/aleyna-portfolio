import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { profile } from "../data/content";
import SignatureLine from "./SignatureLine";

export default function Hero() {
  return (
    <section className="canvas-grain relative min-h-[100svh] flex flex-col justify-center px-6 md:px-10 pt-24 pb-16 overflow-hidden">
      {/* Arka planda çok hafif kanvas dokusu + ışık lekesi */}
      <div
        className="pointer-events-none absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-brush), transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 -left-32 w-[420px] h-[420px] rounded-full opacity-[0.14] blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-circuit), transparent 70%)" }}
      />

      <div className="relative max-w-5xl mx-auto w-full">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-mono text-xs md:text-sm tracking-[0.25em] uppercase text-circuit-soft mb-6"
        >
          {profile.roles.join("  ·  ")}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-paper text-[13vw] leading-[0.95] md:text-[6.4rem] md:leading-[0.95] tracking-tight text-balance"
        >
          {profile.name}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-6 md:mt-8 max-w-xl font-sans text-paper/75 text-base md:text-lg leading-relaxed"
        >
          {profile.tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-9 flex flex-wrap gap-4"
        >
          <Link
            to="/gallery"
            className="px-6 py-3 bg-brush text-paper font-sans text-sm rounded-full hover:bg-brush-soft transition-colors"
          >
            Eserlere göz at
          </Link>
          <Link
            to="/ai-work"
            className="px-6 py-3 border border-paper/25 text-paper font-sans text-sm rounded-full hover:border-circuit-soft hover:text-circuit-soft transition-colors"
          >
            Yapay zeka çalışmaları
          </Link>
        </motion.div>
      </div>

      <SignatureLine className="relative mt-16 md:mt-20 w-full max-w-5xl mx-auto h-10 md:h-14" />
    </section>
  );
}
