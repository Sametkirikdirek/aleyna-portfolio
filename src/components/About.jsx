import { motion } from "framer-motion";
import { profile, skills } from "../data/content";
import { MapPin, ArrowUpRight } from "lucide-react";

export default function About() {
  return (
    <section className="min-h-screen px-6 md:px-10 pt-28 pb-24 md:pt-32 md:pb-32 bg-paper text-ink">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Giriş Başlığı & Özet */}
        <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-12 md:gap-20 items-start">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5 }}
              className="font-mono text-xs tracking-[0.25em] uppercase text-umber mb-4"
            >
              Hakkımda
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6 }}
              className="font-display text-3xl md:text-5xl leading-tight text-balance"
            >
              İki disiplin, tek bakış açısı.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 font-sans text-ink/80 text-base md:text-lg leading-relaxed"
            >
              {profile.bio}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mt-6 flex items-center gap-2 font-mono text-sm text-umber"
            >
              <MapPin size={16} className="text-umber" />
              <span>{profile.location}</span>
            </motion.div>
          </div>

          {/* Felsefe Alıntı Kutusu */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-7 md:p-8 rounded-2xl bg-ink/5 border border-ink/10 relative overflow-hidden"
          >
            <p className="font-mono text-xs uppercase tracking-widest text-umber mb-3">
              Sanat & Tefekkür Felsefesi
            </p>
            <blockquote className="font-display text-lg md:text-xl text-ink leading-snug italic">
              "{profile.philosophy}"
            </blockquote>
            <div className="mt-6 pt-4 border-t border-ink/10 flex items-center justify-between font-mono text-xs text-ink/60">
              <span>Aleyna Altunsu</span>
              <a
                href={profile.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-brush transition-colors"
              >
                LinkedIn Profili <ArrowUpRight size={13} />
              </a>
            </div>
          </motion.div>
        </div>

        {/* 3 Ana Üçlü Disiplin Odak Kartları */}
        {profile.extendedBio && (
          <div className="grid md:grid-cols-3 gap-6 pt-6">
            {profile.extendedBio.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 md:p-7 rounded-xl border border-ink/12 bg-white/50 backdrop-blur-sm space-y-3 hover:border-ink/25 transition-all"
              >
                <h3 className="font-display text-xl text-ink font-semibold">
                  {item.title}
                </h3>
                <p className="font-sans text-sm text-ink/70 leading-relaxed">
                  {item.content}
                </p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Yetkinlik Grupları (Skills) */}
        <div className="pt-8 border-t border-ink/10">
          <h3 className="font-mono text-xs tracking-[0.25em] uppercase text-umber mb-8">
            Uzmanlık & Yetkinlikler
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {skills.map((group, i) => (
              <motion.div
                key={group.group}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <h4 className="font-sans text-sm font-semibold tracking-wide text-ink mb-4">
                  {group.group}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="px-3.5 py-1.5 rounded-full border border-ink/15 font-mono text-xs text-ink/85 bg-ink/[0.02]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
