import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  Upload,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Send,
  Loader2,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { InstagramIcon } from "./ui/SocialIcons";
import {
  getDeviceFingerprint,
  stripExifAndOptimize,
  checkDailyQuota,
  subscribeToRequestStatus,
} from "../lib/commission";
import { db } from "../lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function CommissionModal({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [note, setNote] = useState("");
  const [contact, setContact] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Cihaz ve aktif talep durumu
  const [fingerprint, setFingerprint] = useState(null);
  const [activeRequest, setActiveRequest] = useState(null);
  const [quotaBlocked, setQuotaBlocked] = useState(false);

  const fileInputRef = useRef(null);

  // Modal açıldığında cihaz parmak izini ve kotayı sorgula
  useEffect(() => {
    if (!isOpen) return;

    let unsub = () => {};
    getDeviceFingerprint().then(async (fp) => {
      setFingerprint(fp);
      const quota = await checkDailyQuota(fp);
      if (!quota.allowed) {
        setQuotaBlocked(true);
        if (quota.existingData) {
          setActiveRequest(quota.existingData);
        }
        if (quota.existingId) {
          unsub = subscribeToRequestStatus(quota.existingId, (data) => {
            setActiveRequest(data);
          });
        }
      }
    });

    return () => unsub();
  }, [isOpen]);

  const handleFileSelect = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setErrorMessage("");
    setStatusMessage("Fotoğraf EXIF ve GPS verileri temizleniyor...");

    try {
      // 100% EXIF ve GPS konum verilerini kazı
      const cleanFile = await stripExifAndOptimize(selected);
      setFile(cleanFile);
      setPreviewUrl(URL.createObjectURL(cleanFile));
      setStatusMessage("Fotoğraf hazır! (Tüm konum ve cihaz verileri temizlendi)");
    } catch (err) {
      setErrorMessage("Görsel işlenirken bir sorun oluştu.");
      setStatusMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage("Lütfen tuvale aktarılmasını istediğiniz bir referans görseli seçin.");
      return;
    }
    if (!consent) {
      setErrorMessage("Lütfen kullanım ve güvenlik onay kutusunu işaretleyin.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setStatusMessage("Talebiniz güvenlik taramasından geçiriliyor ve iletiliyor...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("note", note);
      formData.append("contact", contact);
      formData.append("deviceHash", fingerprint || "unknown");
      formData.append("consent", "true");

      const response = await fetch("/api/commission", {
        method: "POST",
        body: formData,
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Sunucuya iletilemedi.");
      }

      // Firestore'a da anında yerleştir (canlı takip için)
      const reqId = resData.requestId;
      const todayKey = new Date().toISOString().slice(0, 10);
      const reqDoc = {
        id: reqId,
        imageUrl: resData.imageUrl,
        note,
        contact,
        deviceHash: fingerprint,
        status: "mod_pending",
        submissionDate: todayKey,
        ipInfo: resData.ipInfo || null,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, "commission_requests", reqId), reqDoc);
      localStorage.setItem(`comm_${fingerprint}_${todayKey}`, reqId);

      setActiveRequest(reqDoc);
      setQuotaBlocked(true);
      setStatusMessage("Harika! Talebiniz atölye koordinatörümüze ulaştı.");

      // Canlı dinlemeyi başlat
      subscribeToRequestStatus(reqId, (updated) => {
        setActiveRequest(updated);
      });
    } catch (err) {
      setErrorMessage(err.message || "Talebiniz iletilemedi. Lütfen tekrar deneyin.");
      setStatusMessage("");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg rounded-3xl bg-[#14151a] border border-amber-900/20 dark:border-white/15 p-6 sm:p-8 shadow-2xl z-10 text-paper"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-2.5 mb-2">
            <span className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300">
              <Sparkles size={18} />
            </span>
            <span className="font-mono text-xs uppercase font-bold text-amber-300/90 tracking-wider">
              Özel Tuval Siparişi
            </span>
          </div>

          <h2 className="font-display text-xl sm:text-2xl font-bold text-white mb-2">
            Senin Fotoğrafın, Aleyna'nın Tuvali
          </h2>
          <p className="font-sans text-xs text-white/60 mb-6 leading-relaxed">
            Sevdiklerini, özel bir anını veya beğendiğin bir görseli yükle; sanatçının fırça tekniğine ve tuval uygunluğuna göre değerlendirelim.
          </p>

          {/* ─── DURUM KARTI (Eğer Ziyaretçi Bugün Talep Gönderdiyse) ─── */}
          {quotaBlocked && activeRequest ? (
            <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="font-mono text-xs font-bold text-white/70">
                  Bugünkü Talebinizin Durumu
                </span>
                <span className="text-[10px] font-mono text-white/40">
                  {activeRequest.submissionDate}
                </span>
              </div>

              {/* Durum Aşamaları */}
              {activeRequest.status === "mod_pending" && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 text-sm font-semibold">
                    <Clock size={16} className="animate-spin" />
                    <span>Atölye Koordinatörü İnceliyor...</span>
                  </div>
                  <p className="text-xs text-amber-200/70 leading-relaxed font-sans">
                    Fotoğrafınız güvenle atölyemize ulaştı. Kalite ve teknik ön elemeden sonra Aleyna'nın masasına iletilecek.
                  </p>
                </div>
              )}

              {activeRequest.status === "artist_review" && (
                <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-300 text-sm font-semibold">
                    <Sparkles size={16} />
                    <span>Aleyna'nın Masasında Değerlendiriliyor!</span>
                  </div>
                  <p className="text-xs text-cyan-200/70 leading-relaxed font-sans">
                    Ön eleme tamamlandı! Sanatçı görseli tuval kompozisyonu ve çizim programına göre inceliyor.
                  </p>
                </div>
              )}

              {activeRequest.status === "approved" && (
                <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-300 text-sm font-bold">
                    <CheckCircle2 size={18} />
                    <span>Müjde! Sanatçı Bu Eseri Çizmek İçin Sabırsızlanıyor!</span>
                  </div>
                  <p className="text-xs text-emerald-200/80 leading-relaxed font-sans">
                    Talebiniz kabul edildi! Boyut, teknik ve sipariş detaylarını konuşmak için Instagram DM üzerinden yazışalım:
                  </p>
                  <a
                    href={`https://ig.me/m/aleynaaltunsuart?text=${encodeURIComponent(
                      "Merhaba Aleyna! Siteden onaylanan tuval talebim için yazıyorum."
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 hover:scale-[1.02] transition-transform"
                  >
                    <InstagramIcon className="w-4 h-4" /> Instagram DM ile İletişime Geç →
                  </a>
                </div>
              )}

              {activeRequest.status === "declined" && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                  <span className="text-xs font-bold text-white/80">🕊️ Bilgilendirme</span>
                  <p className="text-xs text-white/50 leading-relaxed font-sans">
                    Bu görsel sanatçının mevcut tuval ve renk paleti serisi için şu anda uygun bulunamadı. İlginiz için çok teşekkür ederiz!
                  </p>
                </div>
              )}

              <p className="text-[11px] font-mono text-white/40 text-center pt-2">
                * Güvenlik gereği aynı cihazdan günde yalnızca 1 talep gönderilebilir.
              </p>
            </div>
          ) : (
            /* ─── YÜKLEME FORMU ─── */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Dosya Seçim Alanı */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                  previewUrl
                    ? "border-amber-500/40 bg-amber-500/[0.03]"
                    : "border-white/15 hover:border-amber-500/30 hover:bg-white/[0.02]"
                }`}
              >
                {previewUrl ? (
                  <div className="flex items-center gap-4 text-left">
                    <img
                      src={previewUrl}
                      alt="Önizleme"
                      className="w-20 h-20 rounded-xl object-cover border border-white/20 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {file?.name}
                      </p>
                      <p className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 mt-1">
                        <ShieldCheck size={12} /> EXIF & GPS Konum Verileri Temizlendi
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="text-[11px] font-mono text-amber-300 hover:underline mt-1.5 inline-block"
                      >
                        Görseli Değiştir
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 py-3">
                    <Upload size={24} className="text-amber-400 mx-auto" />
                    <p className="text-xs font-medium text-white/80">
                      Fotoğraf seçmek için tıklayın veya sürükleyin
                    </p>
                    <p className="text-[10px] font-mono text-white/40">
                      JPG, PNG veya WEBP · Maksimum 10 MB
                    </p>
                  </div>
                )}
              </div>

              {/* Not Alanı */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-white/60">
                  Tablo Hakkında Notunuz (Opsiyonel)
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Örn: 50x70 cm ebatlarında yağlı boya düşünüyoruz, altın varak detayları olabilir..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-amber-400/50 transition-colors"
                />
              </div>

              {/* İletişim Alanı */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-white/60">
                  Instagram Kullanıcı Adınız veya İletişim Bilginiz
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="@kullanici_adi veya WhatsApp numaranız"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-amber-400/50 transition-colors"
                />
              </div>

              {/* Yasal Onay & KVKK Kutusu */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 rounded text-amber-500 focus:ring-amber-500 bg-white/10 border-white/20 cursor-pointer"
                />
                <span className="text-[10px] text-white/60 leading-relaxed font-sans">
                  Yüklediğim görselin telif haklarının şahsıma ait olduğunu, TCK mevzuatına ve genel ahlaka aykırı içerik barındırmadığını kabul ediyorum. Güvenlik ve iletişim amacıyla IP adresim ile iletişim bilgilerimin işlenmesini onaylıyorum.
                </span>
              </label>

              {/* Hata & Durum Mesajları */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {statusMessage && !errorMessage && (
                <p className="text-[11px] font-mono text-amber-300 text-center">
                  {statusMessage}
                </p>
              )}

              {/* Gönder Butonu */}
              <button
                type="submit"
                disabled={submitting || !file || !consent}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> İletiliyor...
                  </>
                ) : (
                  <>
                    <Send size={14} /> Değerlendirmeye Gönder
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
