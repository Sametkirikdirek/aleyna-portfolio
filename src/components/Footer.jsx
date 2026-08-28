import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { profile } from "../data/content";

const socialLinks = [
  { label: "Medium", href: profile.social.medium },
  { label: "GitHub", href: profile.social.github },
  { label: "LinkedIn", href: profile.social.linkedin },
  { label: "Instagram", href: profile.social.instagram },
];

export default function Footer() {
  return (
    <section className="relative min-h-screen flex items-center px-6 md:px-10 pt-28 pb-24 md:pt-32 md:pb-32 bg-ink overflow-hidden">
      <div
        className="pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full opacity-[0.12] blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-brush), transparent 70%)" }}
      />

      <div className="relative max-w-3xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5 }}
          className="font-mono text-xs tracking-[0.25em] uppercase text-brush-soft mb-4"
        >
          İletişim
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="font-display text-3xl md:text-5xl text-paper leading-tight text-balance"
        >
          Birlikte bir şey inşa edelim.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 font-sans text-paper/65 text-base md:text-lg leading-relaxed"
        >
          İster bir tablo siparişi, ister bir yapay zeka projesi, ister sadece
          merhaba demek için — kapım açık.
        </motion.p>

        <motion.a
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(profile?.email || "hello@aleynaaltunsu.com")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-9 inline-flex items-center gap-2 px-7 py-3.5 bg-brush text-paper font-sans text-sm rounded-full hover:bg-brush-soft transition-colors"
        >
          {profile.email}
          <ArrowUpRight size={16} />
        </motion.a>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-3 font-mono text-xs text-paper/50"
        >
          {socialLinks.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-circuit-soft transition-colors"
            >
              {s.label}
            </a>
          ))}
        </motion.div>

        <p className="mt-14 font-mono text-[11px] text-paper/30">
          © {new Date().getFullYear()} {profile.name}. Tüm hakları saklıdır.
        </p>
      </div>
    </section>
  );
}
