import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  Upload,
  Scissors,
  Maximize2,
  CheckSquare,
  Square,
  X,
  Sliders,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { useTimeline } from "../../hooks/useContent";
import { setContent } from "../../lib/firestore";
import { uploadToCloudinary } from "../../lib/cloudinary";
import ImageAdjustModal from "../components/ImageAdjustModal";
import { EditorHeader, ConfirmModal } from "../components/AdminUI";

export default function TimelineEditor() {
  const { data, loading } = useTimeline();
  const [images, setImages] = useState([]);
  const [saveStatus, setSaveStatus] = useState("idle");

  // Zaman Yolculuğu Animation Settings
  const [idleDelay, setIdleDelay] = useState(3);
  const [autoPlaySpeed, setAutoPlaySpeed] = useState(0.3);

  // Selection for Batch Deletion
  const [selectedIds, setSelectedIds] = useState([]);

  // Uploading state with progress
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  // Lightbox Preview Modal State
  const [previewImage, setPreviewImage] = useState(null);
  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "Evet, Sil",
    variant: "danger",
    onConfirm: () => {},
  });

  const fileInputRef = useRef();

  // Image adjust / crop modal state
  const [adjustState, setAdjustState] = useState({
    isOpen: false,
    imageUrl: "",
    targetIdx: null,
  });

  useEffect(() => {
    if (data && images.length === 0) {
      setImages(data.images || []);
      // Load persisted animation settings from Firestore
      if (typeof data.idleDelay === "number") setIdleDelay(data.idleDelay / 1000);
      if (typeof data.autoPlaySpeed === "number") setAutoPlaySpeed(data.autoPlaySpeed);
    }
  }, [data]);

  const save = async () => {
    setSaveStatus("saving");
    try {
      const payload = {
        images,
        idleDelay: Math.round(Number(idleDelay) * 1000),   // store as ms
        autoPlaySpeed: Number(autoPlaySpeed),
      };
      await setContent("timeline", payload);
      localStorage.setItem("portfolio_cache_timeline", JSON.stringify(payload));
      window.dispatchEvent(new Event("portfolio_content_updated"));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  // Toplu Dosya Yükleme (Batch Upload)
  const handleBatchUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress({ current: 0, total: files.length });

    const newUploaded = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const url = await uploadToCloudinary(files[i], "timeline");
        if (url) {
          newUploaded.push({
            id: `tl-${Date.now()}-${i}`,
            url,
          });
        }
      } catch (err) {
        console.error("Yükleme hatası:", err);
      }
      setUploadProgress({ current: i + 1, total: files.length });
    }

    if (newUploaded.length > 0) {
      setImages((prev) => [...prev, ...newUploaded]);
    }

    setIsUploading(false);
    e.target.value = "";
  };

  // Tekil Görsel Sil
  const executeRemoveImage = (idx) => {
    const target = images[idx];
    setImages((prev) => prev.filter((_, i) => i !== idx));
    if (target?.id) {
      setSelectedIds((prev) => prev.filter((id) => id !== target.id));
    }
  };

  const removeImage = (idx) => {
    setConfirmModal({
      isOpen: true,
      title: "Görseli Silmek İstiyor musunuz?",
      description: "Bu fotoğraf Zaman Yolculuğu galerisinden tamamen kaldırılacaktır.",
      confirmText: "Evet, Sil",
      variant: "danger",
      onConfirm: () => executeRemoveImage(idx),
    });
  };

  // Seçilenleri Toplu Sil
  const executeRemoveSelected = () => {
    const toDelete = new Set(selectedIds);
    setImages((prev) => prev.filter((img) => !toDelete.has(img.id)));
    setSelectedIds([]);
  };

  const removeSelected = () => {
    if (selectedIds.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: "Seçilen Görselleri Sil?",
      description: `Seçtiğiniz ${selectedIds.length} adet görsel Zaman Yolculuğu galerisinden silinecektir.`,
      confirmText: "Seçilenleri Sil",
      variant: "danger",
      onConfirm: executeRemoveSelected,
    });
  };

  // Tümünü Temizle
  const executeRemoveAll = () => {
    setImages([]);
    setSelectedIds([]);
  };

  const removeAll = () => {
    if (images.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: "Tüm Görselleri Sil?",
      description: "Zaman Yolculuğundaki tüm fotoğraflar listeden silinecektir.",
      confirmText: "Tümünü Sil",
      variant: "danger",
      onConfirm: executeRemoveAll,
    });
  };

  // Seçim Toggle
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Tümünü Seç / Kaldır
  const toggleSelectAll = () => {
    if (selectedIds.length === images.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(images.map((img, i) => img.id || `tl-${i}`));
    }
  };

  const updateImageUrl = (idx, newUrl) => {
    setImages((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], url: newUrl };
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const allSelected = images.length > 0 && selectedIds.length === images.length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-white">
      <EditorHeader
        title="Zaman Yolculuğu Yönetimi"
        subtitle="Fotoğraf arşivi, toplu görsel yükleme, kırpma ve yönetim"
        saveStatus={saveStatus}
        onSave={save}
      />

      {/* Gizli Çoklu Dosya Seçici (Multiple Upload) */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleBatchUpload}
      />

      {/* ─── ANİMASYON AYARLARI PANELİ ─── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md space-y-4">
        <p className="text-xs font-bold text-white/70 uppercase tracking-widest flex items-center gap-2">
          <Sliders size={13} className="text-rose-400" />
          Zaman Yolculuğu Animasyon Ayarları
        </p>
        <div className="grid sm:grid-cols-2 gap-5">
          {/* Hareketsizlik Süresi */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-white/60">
                ⏸ Hareketsizlik Başlangıç Süresi
              </label>
              <span className="text-xs font-bold text-rose-300 font-mono bg-rose-500/15 px-2 py-0.5 rounded-md border border-rose-500/25">
                {idleDelay} sn
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="0.5"
              value={idleDelay}
              onChange={(e) => setIdleDelay(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-rose-500"
            />
            <p className="text-[10px] text-white/35 font-mono">
              Kullanıcı etkileşiminin bitmesinden kaç saniye sonra otomatik hareket başlasın?
            </p>
          </div>

          {/* Otomatik Hareket Hızı */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-white/60">
                ▶ Otomatik Hareket Hızı
              </label>
              <span className="text-xs font-bold text-rose-300 font-mono bg-rose-500/15 px-2 py-0.5 rounded-md border border-rose-500/25">
                {autoPlaySpeed.toFixed(1)}×
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="2"
              step="0.05"
              value={autoPlaySpeed}
              onChange={(e) => setAutoPlaySpeed(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-rose-500"
            />
            <p className="text-[10px] text-white/35 font-mono">
              Fotoğrafların otomatik hareket etme hızı (0.05× yavaş — 2.0× hızlı)
            </p>
          </div>
        </div>
      </div>

      {/* ─── ÜST ARAÇ ÇUBUĞU / YÜKLEME & TOPLU İŞLEMLER ─── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Toplu Fotoğraf Ekle Butonu */}
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>
                  Yükleniyor ({uploadProgress.current} / {uploadProgress.total})
                </span>
              </>
            ) : (
              <>
                <Upload size={16} />
                <span>Fotoğraf Ekle</span>
              </>
            )}
          </button>

          {/* Eser Sayısı Rozeti */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white/80">
            <ImageIcon size={14} className="text-rose-400" />
            <span>{images.length} Fotoğraf</span>
          </div>
        </div>

        {/* Toplu Seçim & Silme Aksiyonları */}
        {images.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-xs font-mono text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              {allSelected ? <CheckSquare size={14} className="text-rose-400" /> : <Square size={14} />}
              <span>{allSelected ? "Seçimi Kaldır" : "Tümünü Seç"}</span>
            </button>

            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={removeSelected}
                className="text-xs font-mono text-red-300 hover:text-red-200 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 px-3.5 py-2 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 size={14} />
                <span>Seçilenleri Sil ({selectedIds.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={removeAll}
              className="text-xs font-mono text-white/40 hover:text-red-400 p-2 rounded-xl transition-colors cursor-pointer"
              title="Tüm görselleri temizle"
            >
              Tümünü Temizle
            </button>
          </div>
        )}
      </div>

      {/* Yükleme İlerleme Çubuğu */}
      {isUploading && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono text-rose-300">
            <span>Fotoğraflar Cloudinary'e yükleniyor...</span>
            <span>
              {uploadProgress.current} / {uploadProgress.total} (
              {Math.round((uploadProgress.current / uploadProgress.total) * 100)}%)
            </span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 transition-all duration-300 rounded-full"
              style={{
                width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* ─── MİNİMALİST KOMPAKT GÖRSEL GRID'İ ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {images.map((img, idx) => {
          const imgId = img.id || `tl-${idx}`;
          const isSelected = selectedIds.includes(imgId);

          return (
            <div
              key={imgId}
              className={`group relative rounded-2xl border transition-all duration-200 overflow-hidden bg-[#161720] shadow-md flex flex-col ${
                isSelected
                  ? "border-rose-500 ring-2 ring-rose-500/50 shadow-rose-950/30"
                  : "border-white/10 hover:border-white/25 hover:shadow-xl"
              }`}
            >
              {/* Üst Çubuk Rozetler & Checkbox */}
              <div className="absolute top-2.5 inset-x-2.5 z-20 flex items-center justify-between pointer-events-none">
                {/* Çoklu Seçim Checkbox */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelect(imgId);
                  }}
                  className="pointer-events-auto p-1.5 rounded-lg bg-black/65 hover:bg-black/85 backdrop-blur-md border border-white/20 text-white cursor-pointer transition-transform hover:scale-105 shadow"
                  title="Seç"
                >
                  {isSelected ? (
                    <CheckSquare size={15} className="text-rose-400 fill-rose-500/20" />
                  ) : (
                    <Square size={15} className="text-white/60" />
                  )}
                </button>

                {/* Sıra Numarası Rozeti */}
                <span className="pointer-events-auto font-mono text-[10px] font-bold text-white/80 bg-black/65 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/15">
                  #{idx + 1}
                </span>

                {/* Tekil Silme Butonu */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(idx);
                  }}
                  className="pointer-events-auto p-1.5 rounded-lg bg-black/65 hover:bg-red-600 backdrop-blur-md border border-white/20 text-white/70 hover:text-white cursor-pointer transition-all hover:scale-105 shadow"
                  title="Bu görseli sil"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Görsel Önizleme / Tıklayınca Büyüt */}
              <div
                className="relative aspect-square w-full bg-black/50 overflow-hidden cursor-pointer"
                onClick={() => setPreviewImage(img.url)}
                title="Görseli büyütmek için tıklayın"
              >
                {img.url ? (
                  <img
                    src={img.url}
                    alt={`Zaman Yolculuğu ${idx + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30">
                    <ImageIcon size={24} />
                  </div>
                )}

                {/* Büyüt Hover İkonu */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="p-2 rounded-full bg-black/70 text-white backdrop-blur-md border border-white/20">
                    <Maximize2 size={15} />
                  </span>
                </div>
              </div>

              {/* Kart Altı: Kırp & Hizala Aksiyon Butonu */}
              <div className="p-2 border-t border-white/10 bg-white/[0.02]">
                <button
                  type="button"
                  onClick={() =>
                    setAdjustState({
                      isOpen: true,
                      imageUrl: img.url,
                      targetIdx: idx,
                    })
                  }
                  className="w-full text-center text-xs font-mono text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Scissors size={12} />
                  <span>Kırp & Hizala</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Boş Durum */}
      {images.length === 0 && !isUploading && (
        <div className="border-2 border-dashed border-white/15 rounded-3xl p-12 md:p-16 flex flex-col items-center justify-center text-center gap-4 bg-white/[0.01]">
          <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ImageIcon size={32} />
          </div>
          <div>
            <h4 className="text-base font-semibold text-white/90">
              Henüz Zaman Yolculuğu Görseli Eklenmedi
            </h4>
            <p className="text-xs text-white/50 max-w-md mt-1">
              "Fotoğraf Ekle" butonuna tıklayarak cihazınızdan tek seferde onlarca
              fotoğrafı topluca seçip yükleyebilirsiniz.
            </p>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
          >
            <Upload size={14} /> Cihazdan Toplu Fotoğraf Seç
          </button>
        </div>
      )}

      {/* ─── LIGHTBOX TAM BOYUT ÖNİZLEME MODALI ─── */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[90] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 z-[95] p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md transition-all cursor-pointer"
            title="Kapat"
          >
            <X size={20} />
          </button>

          <div
            className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewImage}
              alt="Önizleme"
              className="w-full h-auto max-h-[82vh] object-contain block"
            />
          </div>
        </div>
      )}

      {/* ─── GÖRSEL KIRPMA & HİZALAMA MODALI (z-[100]) ─── */}
      <ImageAdjustModal
        isOpen={adjustState.isOpen}
        onClose={() => setAdjustState((prev) => ({ ...prev, isOpen: false }))}
        imageUrl={adjustState.imageUrl}
        title="Zaman Yolculuğu Görseli Kırp & Hizala"
        onSave={(newUrl) => {
          if (adjustState.targetIdx !== null) {
            updateImageUrl(adjustState.targetIdx, newUrl);
          }
        }}
      />

      {/* ─── TATLI SİLME ONAY MODALI ─── */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
      />
    </div>
  );
}
