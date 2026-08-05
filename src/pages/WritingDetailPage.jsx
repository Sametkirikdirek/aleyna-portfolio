import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Calendar, Tag, Feather, Share2 } from "lucide-react";
import { useWritings, useProfile } from "../hooks/useContent";

export default function WritingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: writingsData, loading } = useWritings();
  const { data: profile } = useProfile();

  const personalWritings = writingsData?.personalWritings || [];
  const article = personalWritings.find((w) => String(w.id) === String(id));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center px-6 text-center">
        <Feather size={40} className="text-ink/30 mb-4" />
        <h1 className="font-display text-2xl md:text-3xl mb-2">Yazı Bulunamadı</h1>
        <p className="font-sans text-sm text-ink/60 mb-6">Aradığınız yazı mevcut olmayabilir veya kaldırılmış olabilir.</p>
        <Link
          to="/writings?tab=library"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brush text-paper font-sans text-sm font-medium hover:bg-brush-soft transition-colors"
        >
          <ArrowLeft size={16} /> Kütüphaneye Dön
        </Link>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-paper text-ink pt-28 pb-24 md:pt-36 md:pb-32 px-6 md:px-10">
      <div className="max-w-3xl mx-auto space-y-10">
        {/* Navigasyon & Geri Dön */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            to="/writings?tab=library"
            className="inline-flex items-center gap-2 text-sm font-sans text-ink/60 hover:text-brush transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Kütüphaneye Dön
          </Link>
        </motion.div>

        {/* Üst Bilgiler & Künye */}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6 pb-8 border-b border-ink/10"
        >
          <div className="flex items-center gap-3 flex-wrap text-xs font-mono text-ink/50">
            {article.tag && (
              <span className="px-3 py-1 rounded-full bg-ink/[0.07] text-umber font-semibold tracking-wider uppercase">
                {article.tag}
              </span>
            )}
            {article.date && (
              <span className="flex items-center gap-1">
                <Calendar size={13} /> {article.date}
              </span>
            )}
            {article.readTime && (
              <span className="flex items-center gap-1">
                <Clock size={13} /> {article.readTime} okuma
              </span>
            )}
          </div>

          <h1 className="font-display text-3xl md:text-5xl lg:text-6xl text-ink leading-[1.12] tracking-tight">
            {article.title}
          </h1>

          {/* Yazar Bilgisi */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center font-display font-bold text-rose-700 text-sm">
                AA
              </div>
              <div>
                <p className="font-sans font-medium text-sm text-ink">{profile?.name || "Aleyna Altunsu"}</p>
                <p className="font-mono text-xs text-ink/40">Kişisel Notlar & Atölye Günlüğü</p>
              </div>
            </div>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: article.title, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Bağlantı kopyalandı!");
                }
              }}
              className="p-2.5 rounded-full hover:bg-ink/5 text-ink/40 hover:text-ink transition-colors"
              title="Paylaş"
            >
              <Share2 size={18} />
            </button>
          </div>
        </motion.header>

        {/* Yazı Metni */}
        <motion.main
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="font-sans text-base md:text-lg text-ink/85 leading-relaxed whitespace-pre-line space-y-6"
        >
          {article.content || article.excerpt}
        </motion.main>

        {/* Alt Kısım / Dönüş */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="pt-12 border-t border-ink/10 flex items-center justify-between"
        >
          <Link
            to="/writings?tab=library"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-ink/15 text-ink/70 hover:text-brush hover:border-brush/40 font-sans text-sm transition-all"
          >
            <ArrowLeft size={16} /> Kütüphaneye Dön
          </Link>
          <span className="font-mono text-xs text-ink/30">Aleyna Altunsu</span>
        </motion.footer>
      </div>
    </article>
  );
}
