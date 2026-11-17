import { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  ExternalLink,
  MapPin,
  Calendar,
  User,
  MessageSquare,
  AlertTriangle,
  FileText,
  Search,
  Filter,
} from "lucide-react";
import { db } from "../../lib/firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

export default function CommissionEditor() {
  const [activeTab, setActiveTab] = useState("artist"); // "artist" | "mod" | "incidents"
  const [requests, setRequests] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  // Firestore'dan canlı dinle
  useEffect(() => {
    const unsubReq = onSnapshot(collection(db, "commission_requests"), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setRequests(list);
      setLoading(false);
    });

    const unsubInc = onSnapshot(collection(db, "incident_logs"), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setIncidents(list);
    });

    return () => {
      unsubReq();
      unsubInc();
    };
  }, []);

  // Filtreler
  const artistRequests = useMemo(
    () => requests.filter((r) => r.status === "artist_review" || r.status === "approved" || r.status === "declined"),
    [requests]
  );
  const pendingModRequests = useMemo(
    () => requests.filter((r) => r.status === "mod_pending"),
    [requests]
  );

  const updateRequestStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, "commission_requests", id), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      alert("Durum güncellenirken hata oluştu: " + err.message);
    }
  };

  const deleteRequest = async (id) => {
    if (!confirm("Bu talebi silmek istediğinize emin misiniz?")) return;
    try {
      await deleteDoc(doc(db, "commission_requests", id));
    } catch (err) {
      alert("Silinemedi: " + err.message);
    }
  };

  const copyIncidentReport = (inc) => {
    const reportText = `--- ADLİ BİLİŞİM / SİBER SUÇ İHBAR TUTANAĞI ---
Tarih/Saat: ${inc.formattedDate || inc.timestamp}
Olay Türü: Güvenlik İhlali / Uygunsuz İçerik Gönderimi
IP Adresi: ${inc.ip}
Konum / ISP: ${inc.city}, ${inc.country}
Tarayıcı / User-Agent: ${inc.userAgent}
Cihaz Parmak İzi Hash: ${inc.deviceHash}
Ziyaretçinin Girdiği Not: ${inc.submittedNote || "Yok"}
Ziyaretçinin Girdiği İletişim: ${inc.submittedContact || "Yok"}
Kanıt Görseli Linki: ${inc.imageUrl}
Engelleme Gerekçesi: ${inc.flagReason}
----------------------------------------------`;

    navigator.clipboard.writeText(reportText);
    setCopiedId(inc.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Üst Başlık ve Sekmeler */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Sparkles className="text-amber-400" size={22} />
            Tuval Talepleri & Güvenlik Yönetimi
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Ziyaretçi özel siparişleri, sanatçı onay havuzu ve adli güvenlik kayıtları
          </p>
        </div>

        {/* Sekmeler */}
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab("artist")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "artist"
                ? "bg-amber-500/20 text-amber-200 border border-amber-500/30 shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span>👩‍🎨 Aleyna'nın Masası</span>
            {artistRequests.filter((r) => r.status === "artist_review").length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("mod")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "mod"
                ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span>🛡️ Ön Eleme</span>
            {pendingModRequests.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-200 font-bold">
                {pendingModRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("incidents")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "incidents"
                ? "bg-rose-500/20 text-rose-200 border border-rose-500/30 shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            <ShieldAlert size={14} className="text-rose-400" />
            <span>Adli Kayıtlar</span>
            {incidents.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/30 text-rose-200 font-bold">
                {incidents.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ─── SEKME 1: ALEYNA'NIN MASASI (Sanatçının Steril Havuzu) ─── */}
      {activeTab === "artist" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center gap-3">
            <span className="text-xl">✨</span>
            <p className="text-xs text-amber-200/90 leading-relaxed">
              Bu alanda yalnızca <strong>koordinatör onayından geçmiş, güvenli ve kaliteli</strong> tuval talepleri yer alır.
              Aleyna burada çizmek istediği eserleri tek tıkla kabul edebilir veya uygun değil olarak işaretleyebilir.
            </p>
          </div>

          {artistRequests.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-white/[0.02] border border-white/5">
              <Sparkles size={28} className="text-white/20 mx-auto mb-2" />
              <p className="font-mono text-xs text-white/50">Şu anda incelenecek yeni onaylı talep yok.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {artistRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="flex gap-4">
                    {/* Görsel Önizleme */}
                    <a
                      href={req.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-28 h-28 rounded-xl overflow-hidden shrink-0 border border-white/15 bg-black/40 group relative"
                    >
                      <img src={req.imageUrl} alt="Referans" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <ExternalLink size={16} className="text-white" />
                      </div>
                    </a>

                    {/* Detaylar */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-white/40">
                          {req.ipInfo?.formattedDate || req.submissionDate}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                            req.status === "approved"
                              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                              : req.status === "declined"
                              ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
                              : "bg-amber-500/15 border-amber-500/30 text-amber-300 animate-pulse"
                          }`}
                        >
                          {req.status === "approved" ? "Onaylandı" : req.status === "declined" ? "Uygun Değil" : "Karar Bekliyor"}
                        </span>
                      </div>

                      <p className="text-xs text-white/90 line-clamp-3 bg-white/5 p-2 rounded-lg font-sans">
                        &ldquo;{req.note || "Ziyaretçi not bırakmadı."}&rdquo;
                      </p>

                      <p className="text-[11px] font-mono text-amber-200/80 flex items-center gap-1.5 pt-1">
                        <User size={12} /> {req.contact || "İletişim girilmedi"}
                      </p>
                    </div>
                  </div>

                  {/* Eylemler */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                    <button
                      onClick={() => updateRequestStatus(req.id, "approved")}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                        req.status === "approved"
                          ? "bg-emerald-600 text-white shadow-emerald-950/40"
                          : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      <CheckCircle2 size={14} /> Bu Eseri Çizebilirim
                    </button>

                    <button
                      onClick={() => updateRequestStatus(req.id, "declined")}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                        req.status === "declined"
                          ? "bg-rose-600 text-white"
                          : "bg-white/5 hover:bg-rose-500/10 text-white/60 hover:text-rose-300 border border-white/10"
                      }`}
                    >
                      <XCircle size={14} /> Uygun Değil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── SEKME 2: KOORDİNATÖR ÖN ELEME HAVUZU ─── */}
      {activeTab === "mod" && (
        <div className="space-y-4">
          <p className="text-xs text-white/50">
            Ziyaretçilerin doğrudan yüklediği, WhatsApp bildirimine ek olarak buradan da onaylayabileceğiniz ham talepler.
          </p>

          {pendingModRequests.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-white/[0.02] border border-white/5">
              <CheckCircle2 size={28} className="text-emerald-400/40 mx-auto mb-2" />
              <p className="font-mono text-xs text-white/50">Tüm talepler incelendi, bekleyen istek yok.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingModRequests.map((req) => (
                <div key={req.id} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                  <div className="flex gap-4">
                    <img src={req.imageUrl} alt="Önizleme" className="w-24 h-24 rounded-xl object-cover border border-white/10" />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="text-[11px] font-mono text-white/40 flex items-center justify-between">
                        <span>{req.ipInfo?.city || "TR"} · {req.ipInfo?.ip}</span>
                      </div>
                      <p className="text-xs text-white/80 line-clamp-2">&ldquo;{req.note}&rdquo;</p>
                      <p className="text-[11px] font-mono text-emerald-300">{req.contact}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => updateRequestStatus(req.id, "artist_review")}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 cursor-pointer"
                    >
                      ✓ Aleyna'nın Masasına Gönder
                    </button>
                    <button
                      onClick={() => deleteRequest(req.id)}
                      className="py-2 px-3 rounded-xl text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 cursor-pointer"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── SEKME 3: ADLİ GÜVENLİK KAYITLARI (İHLAL VE ŞİKAYET KANITLARI) ─── */}
      {activeTab === "incidents" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
            <ShieldAlert size={20} className="text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-rose-200 uppercase font-mono">
                Adli Bilişim & Siber Güvenlik İhlal Havuzu
              </h4>
              <p className="text-xs text-rose-200/80 mt-1 leading-relaxed">
                Yapay zekâ filtrelerine takılan, genel ahlaka aykırı veya siber taciz/troll şüphesi taşıyan tüm engellenmiş
                gönderiler burada <strong>IP adresi, tam zaman damgası ve delil görseliyle</strong> saklanır. Gerektiğinde savcılık
                veya emniyet siber suçlar birimine şikayette bulunabilmeniz için tutanak metnini tek tıkla kopyalayabilirsiniz.
              </p>
            </div>
          </div>

          {incidents.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-white/[0.02] border border-white/5">
              <CheckCircle2 size={28} className="text-emerald-400/40 mx-auto mb-2" />
              <p className="font-mono text-xs text-white/50">Harika! Kayıtlı bir güvenlik ihlali veya saldırı denemesi yok.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    {inc.imageUrl && (
                      <a href={inc.imageUrl} target="_blank" rel="noopener noreferrer" className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-red-500/40 bg-black">
                        <img src={inc.imageUrl} alt="Delil" className="w-full h-full object-cover blur-[2px] hover:blur-none transition-all" title="Görmek için üzerine gelin" />
                      </a>
                    )}
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-red-400">
                          IP: {inc.ip}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300">
                          {inc.city || "Bilinmiyor"}, {inc.country || "TR"}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-white/50">
                        {inc.formattedDate || inc.timestamp} · Tarayıcı: {inc.userAgent?.slice(0, 35)}...
                      </p>
                      <p className="text-xs text-red-200/90 font-medium">
                        ⚠️ {inc.flagReason || "Zararlı İçerik Filtresi"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => copyIncidentReport(inc)}
                    className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/40 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    {copiedId === inc.id ? (
                      <>
                        <CheckCircle2 size={13} className="text-emerald-400" /> Tutanak Kopyalandı!
                      </>
                    ) : (
                      <>
                        <Copy size={13} /> Şikayet Raporunu Kopyala
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
