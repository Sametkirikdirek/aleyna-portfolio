import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  Palette,
  ShieldCheck,
  Send,
  Loader2,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import {
  stripExifAndOptimize,
  getDeviceFingerprint,
  checkDailyQuota,
  recordQuotaSubmission,
  subscribeToRequestStatus,
  MAX_DAILY_QUOTA,
  COOLDOWN_SECONDS,
} from "../lib/commission";
import { db } from "../lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

function InstagramIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export default function CommissionModal({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [note, setNote] = useState("");
  const [contact, setContact] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [fingerprint, setFingerprint] = useState(null);
  const [activeRequest, setActiveRequest] = useState(null);
  const [quotaInfo, setQuotaInfo] = useState({
    allowed: true,
    count: 0,
    remaining: MAX_DAILY_QUOTA,
    isCooldown: false,
    cooldownRemaining: 0,
    reason: "",
  });
  const [viewMode, setViewMode] = useState("auto"); // "auto" | "form" | "status"

  const fileInputRef = useRef(null);

  // Modal açıkken arkadaki sayfanın kaymasını kilitle ve ESC tuşunu dinle
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow || "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // 1 dakikalık Cooldown sayacını her saniye canlı geri say
  useEffect(() => {
    if (!quotaInfo.isCooldown || quotaInfo.cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setQuotaInfo((prev) => {
        if (prev.cooldownRemaining <= 1) {
          return {
            ...prev,
            isCooldown: false,
            cooldownRemaining: 0,
            allowed: prev.remaining > 0,
          };
        }
        return {
          ...prev,
          cooldownRemaining: prev.cooldownRemaining - 1,
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quotaInfo.isCooldown, quotaInfo.cooldownRemaining]);

  // Modal açıldığında cihaz parmak izini ve kotayı sorgula
  useEffect(() => {
    if (!isOpen) return;

    let unsub = () => {};
    getDeviceFingerprint().then(async (fp) => {
      setFingerprint(fp);
      const quota = await checkDailyQuota(fp);
      setQuotaInfo(quota);

      if (quota.lastRequestId) {
        unsub = subscribeToRequestStatus(quota.lastRequestId, (data) => {
          setActiveRequest(data);
        });
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

    // Gönderim öncesi cooldown kontrolü
    if (quotaInfo.isCooldown) {
      setErrorMessage(`Lütfen yeni görsel göndermeden önce ${quotaInfo.cooldownRemaining} saniye bekleyin.`);
      return;
    }
    if (quotaInfo.remaining <= 0) {
      setErrorMessage(`Bugün için ${MAX_DAILY_QUOTA} tuval değerlendirme hakkınızı kullandınız.`);
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setStatusMessage("Talebiniz güvenlik taramasından geçiriliyor ve koordinatöre iletiliyor...");

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

      try {
        await setDoc(doc(db, "commission_requests", reqId), reqDoc);
      } catch (err) {
        console.warn("Client Firestore write:", err.message);
      }

      // Kotayı kaydet (3 hak & 1 dk bekleme)
      recordQuotaSubmission(fingerprint, reqId);
      const updatedQuota = await checkDailyQuota(fingerprint);
      setQuotaInfo(updatedQuota);

      setActiveRequest(reqDoc);
      setViewMode("status");
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

  // Hangi ekran gösterilecek?
  const showStatusCard =
    (viewMode === "status" || (viewMode === "auto" && activeRequest && quotaInfo.count > 0)) &&
    viewMode !== "form";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-[#14151b] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl text-white my-8 overflow-hidden"
          >
            {/* Kapat Butonu */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
              aria-label="Kapat"
            >
              <X size={18} />
            </button>

            {/* Başlık ve Rozet */}
            <div className="flex items-center justify-between mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-semibold tracking-wider uppercase">
                <Palette size={13} />
                <span>Özel Tuval Siparişi</span>
              </div>

              {/* Günlük Kalan Hak Rozeti */}
              <div className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70">
                Kalan Hak: <span className="text-amber-400 font-bold">{quotaInfo.remaining}</span> / {MAX_DAILY_QUOTA}
              </div>
            </div>

            <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
              Senin Fotoğrafın, Aleyna'nın Tuvali
            </h2>
            <p className="font-sans text-xs text-white/60 mb-6 leading-relaxed">
              Sevdiklerini, özel bir anını veya beğendiğin bir görseli yükle; sanatçının fırça tekniğine ve tuval uygunluğuna göre değerlendirelim.
            </p>

            {/* ─── DURUM KARTI (Eğer Ziyaretçinin Mevcut Talebi Varsa) ─── */}
            {showStatusCard && activeRequest ? (
              <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="font-mono text-xs font-bold text-white/70 flex items-center gap-2">
                    <span>Son Talebinizin Durumu</span>
                    <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-white/5 text-amber-300">
                      (Bugün {quotaInfo.count}/{MAX_DAILY_QUOTA} talep)
                    </span>
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
                      <Palette size={16} />
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

                {/* Çoklu Hak Eylemi */}
                <div className="pt-2 border-t border-white/5">
                  {quotaInfo.remaining > 0 ? (
                    <div className="space-y-2">
                      <button
                        type="button"
                        disabled={quotaInfo.isCooldown}
                        onClick={() => {
                          setFile(null);
                          setPreviewUrl(null);
                          setNote("");
                          setErrorMessage("");
                          setStatusMessage("");
                          setViewMode("form");
                        }}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          quotaInfo.isCooldown
                            ? "bg-white/5 border border-white/10 text-white/40 cursor-not-allowed"
                            : "bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-200 shadow-sm"
                        }`}
                      >
                        {quotaInfo.isCooldown ? (
                          <>
                            <Clock size={14} className="animate-spin text-amber-400" />
                            <span>Yeni görsel için {quotaInfo.cooldownRemaining}s bekleyin</span>
                          </>
                        ) : (
                          <>
                            <Upload size={14} />
                            <span>Farklı Bir Görsel Daha Gönder (Kalan Hak: {quotaInfo.remaining}/{MAX_DAILY_QUOTA})</span>
                          </>
                        )}
                      </button>
                      <p className="text-[10px] font-mono text-white/40 text-center">
                        (Yanlış fotoğraf seçtiyseniz veya alternatif bir referans denemek isterseniz)
                      </p>
                    </div>
                  ) : (
                    <p className="text-[11px] font-mono text-white/40 text-center pt-1">
                      Bugünkü {MAX_DAILY_QUOTA} değerlendirme hakkınızı kullandınız. Yarın tekrar bekleriz!
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* ─── YÜKLEME FORMU ─── */
              <form onSubmit={handleSubmit} className="space-y-4">
                {activeRequest && (
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <button
                      type="button"
                      onClick={() => setViewMode("status")}
                      className="text-xs font-mono text-amber-300/80 hover:text-amber-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft size={13} /> Önceki Talebimin Durumuna Dön
                    </button>
                    <span className="text-[11px] font-mono text-white/40">
                      Hak: {quotaInfo.remaining}/{MAX_DAILY_QUOTA}
                    </span>
                  </div>
                )}

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
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/80 font-sans">
                    Tablo Hakkında Notunuz (Opsiyonel)
                  </label>
                  <textarea
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Örn: 50x70 cm ebatlarında yağlı boya düşünüyoruz, altın varak detayları olabilir..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-amber-400/50 transition-colors font-sans"
                  />
                </div>

                {/* İletişim Alanı */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/80 font-sans">
                    Instagram Kullanıcı Adınız veya İletişim Bilginiz
                  </label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="@kullanici_adi veya telefon / Telegram numaranız"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-amber-400/50 transition-colors font-sans"
                  />
                </div>

                {/* Yasal Onay & KVKK Kutusu */}
                <label className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-amber-500 focus:ring-amber-500 bg-white/10 border-white/20 cursor-pointer shrink-0"
                  />
                  <span className="text-[11px] sm:text-xs text-white/70 leading-relaxed font-sans">
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
                  disabled={submitting || !file || !consent || quotaInfo.isCooldown || quotaInfo.remaining <= 0}
                  className={`w-full py-3.5 px-4 rounded-xl font-sans text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    submitting || !file || !consent || quotaInfo.isCooldown || quotaInfo.remaining <= 0
                      ? "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg shadow-amber-950/40 hover:scale-[1.01] cursor-pointer"
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> İletiliyor...
                    </>
                  ) : quotaInfo.isCooldown ? (
                    <>
                      <Clock size={15} className="animate-spin" /> Lütfen {quotaInfo.cooldownRemaining}s Bekleyin
                    </>
                  ) : (
                    <>
                      <Send size={15} /> Değerlendirmeye Gönder ({quotaInfo.remaining}/{MAX_DAILY_QUOTA})
                    </>
                  )}
                </button>
              </form>
            )}

            <p className="text-[10px] font-mono text-white/30 text-center pt-4">
              * Kalite ve güvenlik gereği aynı cihazdan günde en fazla 3 talep gönderilebilir (talepler arası 1 dk bekleme süresi vardır).
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
