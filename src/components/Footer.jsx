import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useProfile } from "../hooks/useContent";
import { GithubIcon, LinkedinIcon, InstagramIcon, MediumIcon } from "./ui/SocialIcons";

export default function Footer() {
  const { data: profile } = useProfile();

  const socialLinks = [
    { label: "Medium", href: profile?.social?.medium || "#", icon: <MediumIcon className="w-3.5 h-3.5" /> },
    { label: "GitHub", href: profile?.social?.github || "#", icon: <GithubIcon className="w-3.5 h-3.5" /> },
    { label: "LinkedIn", href: profile?.social?.linkedin || "#", icon: <LinkedinIcon className="w-3.5 h-3.5" /> },
    { label: "Instagram", href: profile?.social?.instagram || "#", icon: <InstagramIcon className="w-3.5 h-3.5" /> },
  ];
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
          className="mt-9 inline-flex items-center gap-2 px-7 py-3.5 bg-brush text-paper font-sans text-sm rounded-full hover:bg-brush-soft transition-colors shadow-lg hover:shadow-brush/30"
        >
          {profile.email}
          <ArrowUpRight size={16} />
        </motion.a>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-14 flex flex-wrap justify-center items-center gap-2.5 sm:gap-3"
        >
          {socialLinks.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-4 py-2 rounded-xl border border-paper/10 bg-paper/[0.03] hover:border-brush hover:bg-brush/10 text-paper/75 hover:text-paper font-mono text-xs transition-all duration-200 shadow-xs active:scale-95"
            >
              <span className="text-brush-soft group-hover:scale-110 transition-transform">
                {s.icon}
              </span>
              <span>{s.label}</span>
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
