import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { profile, skills, experiences } from "../data/content";
import { MapPin, ArrowUpRight, FileText, Download, ExternalLink, Briefcase, Building2, Calendar, CheckCircle2 } from "lucide-react";
import LottieAnimation from "./ui/LottieAnimation";

export default function About() {
  const [isColorActive, setIsColorActive] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsColorActive((prev) => !prev);
    window.addEventListener("toggleColorMode", handleToggle);
    return () => window.removeEventListener("toggleColorMode", handleToggle);
  }, []);

  const handleLottieClick = () => {
    window.dispatchEvent(new CustomEvent("toggleColorMode"));
  };

  return (
    <section className="min-h-screen px-6 md:px-10 pt-28 pb-24 md:pt-32 md:pb-32 bg-paper text-ink">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Giriş Başlığı & Özet */}
        <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-12 md:gap-20 items-start">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2.5 mb-4"
            >
              <button
                type="button"
                onClick={handleLottieClick}
                className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center cursor-pointer transition-all duration-500 hover:scale-125 focus:outline-none shrink-0"
                title="Kalp animasyonunu ve renk paletini tetikleyin"
                aria-label="Kalp animasyonu butonu"
              >
                <LottieAnimation isColorActive={isColorActive} className="w-full h-full" />
              </button>
              <p className="font-mono text-xs tracking-[0.25em] uppercase text-umber font-semibold">
                Hakkımda
              </p>
            </motion.div>
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

        {/* 3 Ana Üçlü Disiplin Odak Kartları */}
        {profile.extendedBio && (
          <div className="grid md:grid-cols-3 gap-6">
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

        {/* İş & Profesyonel Deneyim Geçmişi (LinkedIn / CV) */}
        <div className="pt-8 border-t border-ink/10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="font-mono text-xs tracking-[0.25em] uppercase text-umber flex items-center gap-2 mb-2">
                <Briefcase size={15} className="text-umber" />
                İş & Kariyer Geçmişi
              </span>
              <h3 className="font-display text-2xl md:text-3xl text-ink font-bold">
                Deneyim & Proje Sorumlulukları
              </h3>
            </div>
            <a
              href={profile.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-umber hover:text-brush transition-colors inline-flex items-center gap-1 self-start md:self-auto"
            >
              LinkedIn'de Tümünü Gör <ArrowUpRight size={13} />
            </a>
          </div>

          <div className="space-y-6">
            {experiences.map((exp, i) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="p-6 md:p-8 rounded-2xl border border-ink/12 bg-white/60 backdrop-blur-sm space-y-4 hover:border-ink/25 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-ink/10 pb-4">
                  <div>
                    <span className="font-mono text-xs text-umber uppercase tracking-wider">
                      {exp.type}
                    </span>
                    <h4 className="font-display text-xl font-bold text-ink mt-0.5">
                      {exp.role}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 font-sans text-sm text-ink/70 mt-1">
                      <span className="flex items-center gap-1 font-medium text-ink">
                        <Building2 size={14} className="text-umber" />
                        {exp.company}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-ink/40" />
                        {exp.location}
                      </span>
                    </div>
                  </div>
                  <div className="font-mono text-xs text-ink/60 bg-ink/5 px-3 py-1.5 rounded-full self-start md:self-auto border border-ink/10">
                    <Calendar size={12} className="inline mr-1.5 opacity-70" />
                    {exp.period}
                  </div>
                </div>

                <p className="font-sans text-sm text-ink/80 leading-relaxed">
                  {exp.description}
                </p>

                {/* Öne Çıkan Başarılar & Vurgular */}
                {exp.highlights && (
                  <div className="grid sm:grid-cols-2 gap-2 pt-2">
                    {exp.highlights.map((item) => (
                      <div key={item} className="flex items-start gap-2 font-sans text-xs text-ink/75">
                        <CheckCircle2 size={14} className="text-brush shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Teknolojiler */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {exp.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 rounded-md border border-ink/12 font-mono text-[11px] text-ink/80 bg-ink/[0.02]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

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
