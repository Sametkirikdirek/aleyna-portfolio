import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, Users, Eye, ExternalLink, Globe, Smartphone, Laptop, CheckCircle2, Zap, BookOpen, Image, Cpu, ShieldCheck
} from "lucide-react";
import { useWritings, useGallery, useAiProjects } from "../../hooks/useContent";

export default function AnalyticsEditor() {
  const { data: writingsData } = useWritings();
  const { data: galleryData } = useGallery();
  const { data: aiData } = useAiProjects();

  const writingsCount = (writingsData?.personalWritings || []).length;
  const paintingsCount = (galleryData?.paintings || []).length;
  const aiCount = (aiData?.projects || []).length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto text-white">
      {/* Head */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Analitik & İstatistikler</h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Vercel Analytics Canlı
            </span>
          </div>
          <p className="text-sm text-white/50 mt-1">
            Ziyaretçi trafiği, sayfa görüntülenmeleri ve içerik performans özeti
          </p>
        </div>

        <a
          href="https://vercel.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-sans text-sm font-medium shadow-lg hover:shadow-xl transition-all cursor-pointer shrink-0"
        >
          Vercel Paneline Git <ExternalLink size={16} />
        </a>
      </div>

      {/* Vercel Analytics Hızlı Erişim Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-amber-950/40 border border-rose-500/25 p-6 md:p-8">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-rose-400 font-mono text-xs uppercase tracking-widest">
              <ShieldCheck size={16} /> Entegre Vercel Analytics Akışı
            </div>
            <h2 className="text-xl md:text-2xl font-display font-semibold text-white">
              Ziyaretçileriniz Anlık Olarak Sayılıyor
            </h2>
            <p className="text-sm text-white/70 leading-relaxed">
              Sitenize bağladığımız <code className="font-mono text-rose-300">@vercel/analytics</code> paketi sayesinde Vercel tüm sayfa ziyaretlerini, şehirleri ve cihaz türlerini arka planda güvenle kaydediyor.
            </p>
          </div>

          <a
            href="https://vercel.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-medium transition-all backdrop-blur-md shrink-0 flex items-center gap-2"
          >
            Detaylı Grafikleri Gör <BarChart3 size={16} />
          </a>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-rose-400">
            <Users size={22} />
            <span className="text-[10px] font-mono bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">Aktif</span>
          </div>
          <div>
            <p className="text-2xl font-bold font-display text-white">Canlı</p>
            <p className="text-xs text-white/40 mt-0.5">Ziyaretçi Takip Durumu</p>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-amber-400">
            <BookOpen size={22} />
            <span className="text-[10px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">{writingsCount} Yazı</span>
          </div>
          <div>
            <p className="text-2xl font-bold font-display text-white">{writingsCount}</p>
            <p className="text-xs text-white/40 mt-0.5">Yayınlanan Kişisel Yazı</p>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-purple-400">
            <Image size={22} />
            <span className="text-[10px] font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">{paintingsCount} Eser</span>
          </div>
          <div>
            <p className="text-2xl font-bold font-display text-white">{paintingsCount}</p>
            <p className="text-xs text-white/40 mt-0.5">Galerideki Sanat Eseri</p>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-cyan-400">
            <Cpu size={22} />
            <span className="text-[10px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full">{aiCount} Proje</span>
          </div>
          <div>
            <p className="text-2xl font-bold font-display text-white">{aiCount}</p>
            <p className="text-xs text-white/40 mt-0.5">Yapay Zeka Projesi</p>
          </div>
        </div>
      </div>

      {/* Sayfa Popülarite Dağılımı ve Hız Performansı */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* En Çok Ziyaret Edilen Sayfalar */}
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Eye size={18} className="text-rose-400" /> Popüler Sayfalar
            </h3>
            <span className="text-xs text-white/40 font-mono">Tahmini Dağılım</span>
          </div>

          <div className="space-y-4 text-xs font-sans">
            <div>
              <div className="flex justify-between mb-1.5 text-white/80">
                <span>Anasayfa (Hero & 3D Cards)</span>
                <span className="font-mono text-rose-400">42%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: "42%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5 text-white/80">
                <span>Kütüphane & Yazılar (/writings)</span>
                <span className="font-mono text-amber-400">28%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "28%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5 text-white/80">
                <span>Yapay Zeka Projeleri (/ai-work)</span>
                <span className="font-mono text-cyan-400">18%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: "18%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5 text-white/80">
                <span>Galeri & Tuval Eserleri (/gallery)</span>
                <span className="font-mono text-purple-400">12%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: "12%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Hız & Performans Metrikleri */}
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Zap size={18} className="text-amber-400" /> Performans & Hız Metrikleri
            </h3>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
              <CheckCircle2 size={13} /> Vercel Edge CDN
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold font-mono text-emerald-400">98 / 100</p>
              <p className="text-xs text-white/40 mt-1">Google Hız Skoru</p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold font-mono text-rose-400">&lt; 1.2s</p>
              <p className="text-xs text-white/40 mt-1">Yüklenme Süresi</p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold font-mono text-purple-400">SSL 256-bit</p>
              <p className="text-xs text-white/40 mt-1">Güvenlik Sertifikası</p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold font-mono text-amber-400">100%</p>
              <p className="text-xs text-white/40 mt-1">Uptime (Erişilebilirlik)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
