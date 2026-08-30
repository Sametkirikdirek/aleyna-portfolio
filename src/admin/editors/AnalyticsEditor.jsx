import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  ExternalLink,
  Globe,
  Smartphone,
  Laptop,
  Tablet,
  CheckCircle2,
  Zap,
  BookOpen,
  Image,
  Cpu,
  ShieldCheck,
  Heart,
  Flame,
  Clock,
  ArrowUpRight,
  Sparkles,
  MapPin,
  History,
} from "lucide-react";
import {
  useWritings,
  useGallery,
  useAiProjects,
  useTimeline,
} from "../../hooks/useContent";

export default function AnalyticsEditor() {
  const { data: writingsData } = useWritings();
  const { data: galleryData } = useGallery();
  const { data: aiData } = useAiProjects();
  const timelineData = useTimeline();

  const [timeRange, setTimeRange] = useState("7d"); // '7d' | '30d' | 'all'

  // Content counts
  const writings = writingsData?.personalWritings || [];
  const artworks = galleryData?.artworks || galleryData?.paintings || [];
  const aiProjects = aiData?.projects || [];
  const timelineImages = timelineData?.data?.images || [];

  const writingsCount = writings.length;
  const artworksCount = artworks.length;
  const aiCount = aiProjects.length;
  const timelineCount = timelineImages.length;

  // Calculate real total likes across artworks
  const totalLikes = useMemo(() => {
    return artworks.reduce(
      (acc, art) => acc + Number(art.likesCount || art.likes || 0),
      0
    );
  }, [artworks]);

  // Top liked artworks
  const topArtworks = useMemo(() => {
    return [...artworks]
      .sort(
        (a, b) =>
          Number(b.likesCount || b.likes || 0) -
          Number(a.likesCount || a.likes || 0)
      )
      .slice(0, 3);
  }, [artworks]);

  // Traffic data mockup based on timeRange
  const trafficData = useMemo(() => {
    if (timeRange === "7d") {
      return [
        { label: "Pzt", views: 420, visitors: 190, pct: 45 },
        { label: "Sal", views: 560, visitors: 240, pct: 60 },
        { label: "Çar", views: 680, visitors: 310, pct: 75 },
        { label: "Per", views: 590, visitors: 260, pct: 65 },
        { label: "Cum", views: 780, visitors: 390, pct: 85 },
        { label: "Cmt", views: 920, visitors: 480, pct: 100 },
        { label: "Paz", views: 840, visitors: 410, pct: 90 },
      ];
    }
    if (timeRange === "30d") {
      return [
        { label: "1. Hf", views: 3200, visitors: 1400, pct: 65 },
        { label: "2. Hf", views: 4100, visitors: 1850, pct: 82 },
        { label: "3. Hf", views: 3800, visitors: 1620, pct: 76 },
        { label: "4. Hf", views: 5000, visitors: 2200, pct: 100 },
      ];
    }
    return [
      { label: "May", views: 8200, visitors: 3400, pct: 55 },
      { label: "Haz", views: 11400, visitors: 4800, pct: 75 },
      { label: "Tem", views: 13900, visitors: 5900, pct: 88 },
      { label: "Ağu", views: 16200, visitors: 7100, pct: 100 },
    ];
  }, [timeRange]);

  const totalViews = trafficData.reduce((acc, d) => acc + d.views, 0);
  const totalVisitors = trafficData.reduce((acc, d) => acc + d.visitors, 0);

  return (
    <div className="space-y-8 max-w-5xl mx-auto text-white">
      {/* ─── Başlık & Üst Bilgi ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Analitik & İstatistikler
            </h1>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Canlı Trafik Akışı
            </span>
          </div>
          <p className="text-sm text-white/50 mt-1">
            Ziyaretçi trafiği, sayfa etkileşimleri, beğeni sayıları ve içerik dağılımı
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Zaman Aralığı Seçici */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-1 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setTimeRange("7d")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                timeRange === "7d"
                  ? "bg-rose-600 text-white font-bold shadow-sm"
                  : "text-white/50 hover:text-white"
              }`}
            >
              7 Gün
            </button>
            <button
              type="button"
              onClick={() => setTimeRange("30d")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                timeRange === "30d"
                  ? "bg-rose-600 text-white font-bold shadow-sm"
                  : "text-white/50 hover:text-white"
              }`}
            >
              30 Gün
            </button>
            <button
              type="button"
              onClick={() => setTimeRange("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                timeRange === "all"
                  ? "bg-rose-600 text-white font-bold shadow-sm"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Tümü
            </button>
          </div>

          <a
            href="https://vercel.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-mono text-xs font-semibold transition-all cursor-pointer"
          >
            Vercel Panel <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* ─── Ana KPI Kartları (4 Sütun) ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Toplam Görüntülenme */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-rose-400">
            <Eye size={20} />
            <span className="text-[10px] font-mono bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold">
              +18.4%
            </span>
          </div>
          <div>
            <p className="text-3xl font-bold font-display text-white tracking-tight">
              {totalViews.toLocaleString("tr-TR")}
            </p>
            <p className="text-xs text-white/50 mt-0.5">Sayfa Görüntülenmesi</p>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-rose-500 rounded-full w-[78%]" />
          </div>
        </div>

        {/* Benzersiz Ziyaretçi */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-amber-400">
            <Users size={20} />
            <span className="text-[10px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
              +12.6%
            </span>
          </div>
          <div>
            <p className="text-3xl font-bold font-display text-white tracking-tight">
              {totalVisitors.toLocaleString("tr-TR")}
            </p>
            <p className="text-xs text-white/50 mt-0.5">Benzersiz Ziyaretçi</p>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full w-[64%]" />
          </div>
        </div>

        {/* Toplam Galeri Beğenisi */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-pink-400">
            <Heart size={20} className="fill-pink-500/20" />
            <span className="text-[10px] font-mono bg-pink-500/15 text-pink-300 border border-pink-500/30 px-2 py-0.5 rounded-full font-bold">
              {artworksCount} Eser
            </span>
          </div>
          <div>
            <p className="text-3xl font-bold font-display text-white tracking-tight">
              {totalLikes.toLocaleString("tr-TR")}
            </p>
            <p className="text-xs text-white/50 mt-0.5">Toplam Eser Beğenisi</p>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-pink-500 rounded-full w-[85%]" />
          </div>
        </div>

        {/* Ortalama Oturum Süresi */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-cyan-400">
            <Clock size={20} />
            <span className="text-[10px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
              Ortalama
            </span>
          </div>
          <div>
            <p className="text-3xl font-bold font-display text-white tracking-tight">
              3dk 42sn
            </p>
            <p className="text-xs text-white/50 mt-0.5">Ziyaret Süresi</p>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 rounded-full w-[90%]" />
          </div>
        </div>
      </div>

      {/* ─── Etkileşimli Ziyaretçi & Trafik Trend Grafiği ─── */}
      <div className="p-6 md:p-7 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-rose-400" />
              Ziyaretçi & Görüntülenme Akışı
            </h3>
            <p className="text-xs text-white/50 mt-0.5 font-sans">
              Günün saatlerine ve günlere göre sitede gezinen kullanıcı dağılımı
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-rose-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Görüntülenme
            </span>
            <span className="flex items-center gap-1.5 text-amber-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400/60" /> Tekil Ziyaretçi
            </span>
          </div>
        </div>

        {/* Görsel Sütun Grafiği (Animated Bars) */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 pt-4 px-2 border-b border-white/10">
          {trafficData.map((d, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center gap-2 h-full justify-end group cursor-pointer"
            >
              {/* Tooltip on Hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity font-mono text-[10px] text-white bg-black/90 border border-white/20 px-2 py-1 rounded-md mb-1 pointer-events-none whitespace-nowrap shadow-lg">
                {d.views} görüntülenme · {d.visitors} tekil
              </div>

              {/* Bar */}
              <div className="w-full max-w-[38px] bg-white/5 rounded-t-lg overflow-hidden flex flex-col justify-end h-full">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${d.pct}%` }}
                  transition={{ duration: 0.6, delay: idx * 0.06 }}
                  className="w-full bg-gradient-to-t from-rose-600 via-rose-500 to-amber-400 rounded-t-lg relative group-hover:brightness-110 transition-all"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-white/40" />
                </motion.div>
              </div>

              {/* Label */}
              <span className="text-xs font-mono text-white/50 group-hover:text-white transition-colors">
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── İçerik Envanteri & En Çok Beğenilen Eserler ─── */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* İçerik Envanteri Durumu */}
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400" />
              Sitedeki İçerik Envanteri
            </h3>
            <span className="text-xs text-white/40 font-mono">Gerçek Zamanlı</span>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="flex items-center justify-between text-purple-400">
                <Image size={16} />
                <span className="font-mono text-xl font-bold text-white">
                  {artworksCount}
                </span>
              </div>
              <p className="text-xs text-white/50">Galerideki Eser</p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="flex items-center justify-between text-rose-400">
                <History size={16} />
                <span className="font-mono text-xl font-bold text-white">
                  {timelineCount}
                </span>
              </div>
              <p className="text-xs text-white/50">Zaman Yolculuğu</p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="flex items-center justify-between text-amber-400">
                <BookOpen size={16} />
                <span className="font-mono text-xl font-bold text-white">
                  {writingsCount}
                </span>
              </div>
              <p className="text-xs text-white/50">Yayınlanan Yazı</p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="flex items-center justify-between text-cyan-400">
                <Cpu size={16} />
                <span className="font-mono text-xl font-bold text-white">
                  {aiCount}
                </span>
              </div>
              <p className="text-xs text-white/50">Yapay Zekâ Projesi</p>
            </div>
          </div>
        </div>

        {/* En Çok Beğenilen Eserler */}
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Flame size={18} className="text-rose-400" />
              En Çok Beğenilen Eserler
            </h3>
            <span className="text-xs text-rose-300 font-mono font-bold">
              {totalLikes} Toplam Beğeni
            </span>
          </div>

          <div className="space-y-2.5">
            {topArtworks.length > 0 ? (
              topArtworks.map((art, idx) => (
                <div
                  key={art.id || idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs font-bold text-white/40 w-4">
                      #{idx + 1}
                    </span>
                    {art.image && (
                      <img
                        src={art.image}
                        alt={art.title}
                        className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white/90 truncate">
                        {art.title || "İsimsiz Eser"}
                      </p>
                      <p className="text-[11px] text-white/40 font-mono truncate">
                        {art.category || "Sanat"} · {art.year || "2026"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-pink-400 font-mono text-xs font-bold bg-pink-500/10 px-2.5 py-1 rounded-lg border border-pink-500/20 shrink-0">
                    <Heart size={13} className="fill-pink-500" />
                    {art.likesCount || art.likes || 0}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-white/40 py-6 text-center">
                Henüz eser verisi yüklenmedi.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ─── Cihaz Dağılımı & Popüler Sayfalar ─── */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Popüler Sayfalar */}
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Eye size={18} className="text-rose-400" /> Popüler Sayfalar
            </h3>
            <span className="text-xs text-white/40 font-mono">Trafik Payı</span>
          </div>

          <div className="space-y-3.5 text-xs font-sans">
            <div>
              <div className="flex justify-between mb-1.5 text-white/80">
                <span>Anasayfa (Hero & 3D Kartlar)</span>
                <span className="font-mono text-rose-400 font-bold">42%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: "42%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5 text-white/80">
                <span>Kütüphane & Yazılar (/writings)</span>
                <span className="font-mono text-amber-400 font-bold">28%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "28%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5 text-white/80">
                <span>Yapay Zekâ Mimarileri (/ai-work)</span>
                <span className="font-mono text-cyan-400 font-bold">18%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: "18%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5 text-white/80">
                <span>Galeri & Tuval Eserleri (/gallery)</span>
                <span className="font-mono text-purple-400 font-bold">12%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: "12%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Cihaz & Tarayıcı Dağılımı */}
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Smartphone size={18} className="text-cyan-400" /> Cihaz & Tarayıcı Dağılımı
            </h3>
            <span className="text-xs text-white/40 font-mono">Platform</span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-center space-y-1">
              <Smartphone size={18} className="mx-auto text-rose-400" />
              <p className="font-mono text-base font-bold text-white">58%</p>
              <p className="text-[11px] text-white/40">Mobil</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-center space-y-1">
              <Laptop size={18} className="mx-auto text-amber-400" />
              <p className="font-mono text-base font-bold text-white">36%</p>
              <p className="text-[11px] text-white/40">Masaüstü</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-center space-y-1">
              <Tablet size={18} className="mx-auto text-purple-400" />
              <p className="font-mono text-base font-bold text-white">6%</p>
              <p className="text-[11px] text-white/40">Tablet</p>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono text-white/50">
            <span>Chrome %64</span>
            <span>·</span>
            <span>Safari %26</span>
            <span>·</span>
            <span>Firefox / Edge %10</span>
          </div>
        </div>
      </div>
    </div>
  );
}
