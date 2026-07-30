import { motion } from "framer-motion";
import { profile, skills } from "../data/content";
import { MapPin, ArrowUpRight, FileText, Download, ExternalLink, Sparkles } from "lucide-react";

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
              Sanat & Üretim Felsefesi
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

        {/* CV İndir & İncele Bölümü */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="p-8 rounded-2xl bg-gradient-to-r from-ink/[0.04] to-ink/[0.08] border border-ink/15 space-y-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-umber flex items-center gap-2 mb-1">
                <FileText size={14} className="text-umber" />
                Özgeçmiş / Curriculum Vitae
              </span>
              <h3 className="font-display text-2xl text-ink font-bold">
                Detaylı CV & Profesyonel Geçmiş
              </h3>
              <p className="font-sans text-sm text-ink/70 mt-1 max-w-xl">
                LLMOps, Bilgisayarlı Görü, NLP, Multi-Agent mimariler ve akademik projelerimi içeren detaylı özgeçmiş dosyamı inceleyebilir veya indirebilirsiniz.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            {/* Türkçe CV Kartı */}
            <div className="p-5 rounded-xl bg-white/70 backdrop-blur-sm border border-ink/12 hover:border-ink/30 transition-all flex flex-col justify-between space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-brush/10 text-brush">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="font-display text-base font-semibold text-ink">
                      Türkçe Özgeçmiş (PDF)
                    </h4>
                    <span className="font-mono text-xs text-ink/50">Aleyna_Altunsu_CV_TR.pdf (~600 KB)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <a
                  href={profile.cv.tr}
                  download="Aleyna_Altunsu_CV_TR.pdf"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-ink text-paper font-sans text-xs font-medium hover:bg-ink/90 transition-colors"
                >
                  <Download size={14} />
                  İndir (TR)
                </a>
                <a
                  href={profile.cv.tr}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-lg border border-ink/20 text-ink font-sans text-xs font-medium hover:bg-ink/5 transition-colors inline-flex items-center gap-1"
                >
                  <ExternalLink size={13} />
                  Aç
                </a>
              </div>
            </div>

            {/* İngilizce CV Kartı */}
            <div className="p-5 rounded-xl bg-white/70 backdrop-blur-sm border border-ink/12 hover:border-ink/30 transition-all flex flex-col justify-between space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-circuit-soft/10 text-circuit-soft">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="font-display text-base font-semibold text-ink">
                      English Resume (PDF)
                    </h4>
                    <span className="font-mono text-xs text-ink/50">Aleyna_Altunsu_CV_EN.pdf (~595 KB)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <a
                  href={profile.cv.en}
                  download="Aleyna_Altunsu_CV_EN.pdf"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-ink text-paper font-sans text-xs font-medium hover:bg-ink/90 transition-colors"
                >
                  <Download size={14} />
                  Download (EN)
                </a>
                <a
                  href={profile.cv.en}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-lg border border-ink/20 text-ink font-sans text-xs font-medium hover:bg-ink/5 transition-colors inline-flex items-center gap-1"
                >
                  <ExternalLink size={13} />
                  View
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 3 Ana Üçlü Disiplin Odak Kartları */}
        {profile.extendedBio && (
          <div className="grid md:grid-cols-3 gap-6 pt-4">
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

        {/* Detaylı Yetkinlik Grupları (Skills Breakdown from CV) */}
        <div className="pt-8 border-t border-ink/10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-mono text-xs tracking-[0.25em] uppercase text-umber">
                Uzmanlık & Teknik Alanlar
              </h3>
              <p className="font-sans text-sm text-ink/60 mt-1">
                Çalıştığım ve üretim seviyesinde deneyim kazandığım tüm teknolojiler
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {skills.map((group, i) => (
              <motion.div
                key={group.group}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="p-5 rounded-xl border border-ink/10 bg-white/40 space-y-3 hover:border-ink/20 transition-all"
              >
                <h4 className="font-display text-sm font-semibold tracking-wide text-ink border-b border-ink/10 pb-2">
                  {group.group}
                </h4>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="px-2.5 py-1 rounded-md border border-ink/12 font-mono text-[11px] text-ink/85 bg-ink/[0.02]"
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
