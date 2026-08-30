import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Upload,
  Scissors,
  GripVertical,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Maximize2,
  Minimize2,
  FileText,
  BookOpen,
  Type,
} from "lucide-react";
import { motion, Reorder, useDragControls } from "framer-motion";
import { useWritings } from "../../hooks/useContent";
import { setContent } from "../../lib/firestore";
import { uploadToCloudinary } from "../../lib/cloudinary";
import ImageAdjustModal from "../components/ImageAdjustModal";
import {
  EditorHeader,
  Field,
  TextInput,
  TextArea,
  SaveButton,
  ConfirmModal,
} from "../components/AdminUI";

/**
 * Tam Ekran Odaklanma & Yazım Modalı (Zen Mode)
 */
function ZenWritingModal({
  isOpen,
  onClose,
  writing,
  onUpdate,
  saveStatus,
  onSave,
}) {
  if (!isOpen || !writing) return null;

  const text = writing.content || "";
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const estimatedReadMinutes = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-2xl flex flex-col p-4 md:p-8 animate-fadeIn">
      {/* Üst Araç Çubuğu */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between pb-4 border-b border-white/10 shrink-0 gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 shrink-0">
            <BookOpen size={18} />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-white text-base truncate">
              {writing.title || "Başlıksız Yazı"}
            </h3>
            <p className="text-xs text-white/40 font-mono mt-0.5">
              Tam Ekran Yazım Modu · {wordCount} kelime · {charCount} karakter · ~{estimatedReadMinutes} dk okuma
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <SaveButton
            status={saveStatus}
            onClick={onSave}
            label="Kaydet & Yayınla"
          />
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors cursor-pointer border border-white/15"
          >
            <Minimize2 size={15} /> Kapat
          </button>
        </div>
      </div>

      {/* Geniş Yazma Alanı */}
      <div className="max-w-5xl w-full mx-auto flex-1 py-5 flex flex-col min-h-0">
        <textarea
          value={writing.content || ""}
          onChange={(e) => onUpdate("content", e.target.value)}
          placeholder="Düşüncelerinizi, hikayenizi veya makalenizi buraya yazın..."
          className="w-full flex-1 bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8 text-white/90 text-base md:text-lg leading-relaxed font-sans placeholder:text-white/20 outline-none focus:border-rose-500/40 transition-all resize-none shadow-2xl"
          autoFocus
        />
      </div>
    </div>
  );
}

/**
 * Tekil Yazı Kartı (Framer Motion Physics-based Reorder Item)
 */
function WritingItem({
  writing,
  index,
  total,
  isOpen,
  onToggleOpen,
  onUpdate,
  onRemove,
  onMoveToTop,
  onMoveUp,
  onMoveDown,
  onMoveToBottom,
  onAdjustImage,
  uploading,
  fileInputRef,
  setPendingIdx,
  onSave,
  saveStatus,
  onOpenZenMode,
}) {
  const dragControls = useDragControls();

  const text = writing.content || "";
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const estimatedReadMinutes = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <Reorder.Item
      value={writing}
      id={writing.id || String(index)}
      dragListener={false}
      dragControls={dragControls}
      className={`rounded-2xl border transition-all duration-200 bg-[#161722] overflow-hidden select-none mb-3 ${
        isOpen
          ? "border-rose-500/50 shadow-xl shadow-rose-950/20"
          : "border-white/10 hover:border-white/20"
      }`}
      whileDrag={{
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(244,63,94,0.4)",
        borderColor: "rgba(244,63,94,0.9)",
        zIndex: 50,
      }}
    >
      {/* Kart Başlığı / Drag Handle Alanı */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={onToggleOpen}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Fiziksel Sürükleme Tutamacı (Grip Handle) */}
          <div
            onPointerDown={(e) => {
              e.stopPropagation();
              dragControls.start(e);
            }}
            className="p-2 -m-1 text-white/40 hover:text-rose-400 hover:bg-white/5 rounded-xl cursor-grab active:cursor-grabbing touch-none transition-colors shrink-0 flex items-center justify-center"
            title="Tutup sürükleyerek sırayı değiştirin"
          >
            <GripVertical size={18} />
          </div>

          {/* Sıra Numarası Rozeti */}
          <span className="font-mono text-xs font-bold text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 rounded-lg shrink-0">
            #{index + 1}
          </span>

          {/* Hızlı Yukarı / Aşağı Butonları */}
          <div
            className="flex items-center gap-0.5 shrink-0 bg-white/5 p-1 rounded-lg border border-white/5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              disabled={index === 0}
              onClick={() => onMoveToTop(index)}
              className="text-white/40 hover:text-white disabled:opacity-20 p-1 transition-colors cursor-pointer"
              title="En Başa Taşı"
            >
              <ChevronsUp size={12} />
            </button>
            <button
              type="button"
              disabled={index === 0}
              onClick={() => onMoveUp(index)}
              className="text-white/40 hover:text-white disabled:opacity-20 p-1 transition-colors cursor-pointer"
              title="1 Yukarı Taşı"
            >
              <ArrowUp size={12} />
            </button>
            <button
              type="button"
              disabled={index === total - 1}
              onClick={() => onMoveDown(index)}
              className="text-white/40 hover:text-white disabled:opacity-20 p-1 transition-colors cursor-pointer"
              title="1 Aşağı Taşı"
            >
              <ArrowDown size={12} />
            </button>
            <button
              type="button"
              disabled={index === total - 1}
              onClick={() => onMoveToBottom(index)}
              className="text-white/40 hover:text-white disabled:opacity-20 p-1 transition-colors cursor-pointer"
              title="En Sona Taşı"
            >
              <ChevronsDown size={12} />
            </button>
          </div>

          {/* Kapak Önizleme Thumbnail */}
          {writing.image && (
            <img
              src={writing.image}
              alt={writing.title}
              className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0"
            />
          )}

          {/* Başlık ve Bilgiler */}
          <div className="min-w-0 flex-1 pr-2">
            <h4 className="font-semibold text-sm text-white/90 truncate">
              {writing.title || "Başlıksız Yazı"}
            </h4>
            <p className="text-xs text-white/40 font-mono truncate mt-0.5">
              {writing.tag || "Genel"} · {writing.date || "Tarihsiz"}{" "}
              {writing.readTime ? `· ${writing.readTime}` : ""}
            </p>
          </div>
        </div>

        {/* Aksiyonlar (Silme + Aç/Kapat İkonu) */}
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(index);
            }}
            className="text-white/30 hover:text-rose-400 hover:bg-rose-500/10 p-2 rounded-xl transition-colors cursor-pointer"
            title="Yazıyı Sil"
          >
            <Trash2 size={16} />
          </button>
          <div className="text-white/40 p-1">
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </div>

      {/* Açılır Düzenleme Formu */}
      {isOpen && (
        <div className="px-5 pb-6 border-t border-white/10 pt-5 space-y-5">
          {/* Kapak Görseli Yükleme & Hizalama */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
            <div
              className="group/thumb relative w-28 h-28 rounded-2xl border-2 border-dashed border-white/20 hover:border-rose-500/60 cursor-pointer overflow-hidden flex flex-col items-center justify-center bg-black/40 transition-all shadow-md shrink-0"
              onClick={() => {
                if (writing.image) {
                  onAdjustImage(writing.image, index);
                } else {
                  setPendingIdx(index);
                  fileInputRef.current?.click();
                }
              }}
              title="Görseli kırpmak ve hizalamak için çerçeveye tıklayın"
            >
              {writing.image ? (
                <>
                  <img
                    src={writing.image}
                    alt={writing.title}
                    className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-mono gap-1">
                    <Scissors size={14} className="text-rose-400" />
                    <span>Hizala</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-white/30 gap-1">
                  <Upload size={20} />
                  <span className="text-[10px]">Kapak Foto</span>
                </div>
              )}
              {uploading[index] && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            <div className="space-y-1.5 text-center sm:text-left flex-1">
              <p className="text-sm font-semibold text-white/90">
                Kütüphane Kapak Görseli
              </p>
              <p className="text-xs text-white/50">
                Kütüphane sekmesinde kitap kartının üzerinde görünecek kapak
                resmi.
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setPendingIdx(index);
                    fileInputRef.current?.click();
                  }}
                  className="text-xs bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/40 rounded-xl px-3.5 py-1.5 transition-colors cursor-pointer inline-flex items-center gap-1.5 font-semibold"
                >
                  <Upload size={13} /> Görsel Yükle
                </button>
                {writing.image && (
                  <button
                    type="button"
                    onClick={() => onAdjustImage(writing.image, index)}
                    className="text-xs bg-white/10 text-white/90 hover:bg-white/15 border border-white/20 rounded-xl px-3.5 py-1.5 transition-colors cursor-pointer inline-flex items-center gap-1.5 font-semibold"
                  >
                    <Scissors size={13} /> Kırp / Hizala
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Başlık">
              <TextInput
                value={writing.title}
                onChange={(v) => onUpdate(index, "title", v)}
                placeholder="Örn: Sanat ve Kodun Diyaloğu"
              />
            </Field>
            <Field label="Etiket / Kategori">
              <TextInput
                value={writing.tag}
                onChange={(v) => onUpdate(index, "tag", v)}
                placeholder="Atölye / Sanat / Düşünce"
              />
            </Field>
            <Field label="Tarih">
              <TextInput
                value={writing.date}
                onChange={(v) => onUpdate(index, "date", v)}
                placeholder="Ağu 2026"
              />
            </Field>
            <Field label="Okuma Süresi">
              <TextInput
                value={writing.readTime}
                onChange={(v) => onUpdate(index, "readTime", v)}
                placeholder="4 dk"
              />
            </Field>
          </div>

          <Field label="Özet / Liste Görünümü (Konusu)">
            <TextArea
              value={writing.excerpt}
              onChange={(v) => onUpdate(index, "excerpt", v)}
              rows={2}
              placeholder="Yazının kısa özeti veya dikkat çeken alıntısı..."
            />
          </Field>

          {/* ─── Tam Metin / İçerik Alanı (Genişletilmiş & Hızlı Kaydet Butonlu) ─── */}
          <div className="space-y-2.5 pt-3 border-t border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <label className="text-white/70 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={14} className="text-rose-400" />
                  Tam Metin (İçerik)
                </label>
                <span className="font-mono text-[11px] text-white/40 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                  {wordCount} kelime · {charCount} karakter · ~{estimatedReadMinutes} dk okuma
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Genişlet / Tam Ekran Yazım Butonu */}
                <button
                  type="button"
                  onClick={() => onOpenZenMode(index)}
                  className="flex items-center gap-1.5 text-xs font-mono text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/15 px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs"
                  title="Geniş Ekran / Odaklanma Modu (Dikkatsiz Yazım)"
                >
                  <Maximize2 size={13} className="text-rose-400" />
                  <span>Tam Ekran Yaz</span>
                </button>

                {/* Yanında Hızlı Kaydet & Yayınla Butonu */}
                <SaveButton
                  status={saveStatus}
                  onClick={onSave}
                  label="Kaydet & Yayınla"
                />
              </div>
            </div>

            {/* Geniş, Rahat ve Yüksek Kontrastlı Metin Editörü */}
            <div className="relative">
              <textarea
                value={writing.content || ""}
                onChange={(e) => onUpdate(index, "content", e.target.value)}
                rows={14}
                placeholder="Yazının tüm metnini buraya girin... (Denemeler, düşünceler, atölye notları)"
                className="w-full bg-black/40 border border-white/15 focus:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 rounded-2xl p-4 md:p-5 text-white/95 text-sm md:text-base placeholder:text-white/20 outline-none transition-all duration-200 resize-y leading-relaxed font-sans min-h-[300px] md:min-h-[380px] shadow-inner"
              />
            </div>
          </div>
        </div>
      )}
    </Reorder.Item>
  );
}

export default function WritingsEditor() {
  const { data, loading } = useWritings();
  const [writings, setWritings] = useState([]);
  const [headerTag, setHeaderTag] = useState("Yazılar");
  const [headerTitle, setHeaderTitle] = useState("Kelimelerle şekillenen düşünceler");
  const [headerSubtitle, setHeaderSubtitle] = useState(
    "Medium'daki teknik yazılar ve atölyeden kişisel notlar — iki ayrı çizgi, aynı elden."
  );
  const [saveStatus, setSaveStatus] = useState("idle");
  const [openIdx, setOpenIdx] = useState(null);
  const [uploading, setUploading] = useState({});
  const fileInputRef = useRef();
  const [pendingIdx, setPendingIdx] = useState(null);
  const [zenIdx, setZenIdx] = useState(null);

  const [confirmDelete, setConfirmDelete] = useState({
    isOpen: false,
    targetIdx: null,
    title: "",
  });

  // Image adjust modal state
  const [adjustState, setAdjustState] = useState({
    isOpen: false,
    imageUrl: "",
    targetIdx: null,
  });

  useEffect(() => {
    if (data) {
      if (writings.length === 0 && data.personalWritings) {
        setWritings(data.personalWritings);
      }
      if (data.tag !== undefined) setHeaderTag(data.tag);
      if (data.title !== undefined) setHeaderTitle(data.title);
      if (data.subtitle !== undefined) setHeaderSubtitle(data.subtitle);
    }
  }, [data]);

  const save = async () => {
    setSaveStatus("saving");
    try {
      const payload = {
        tag: headerTag,
        title: headerTitle,
        subtitle: headerSubtitle,
        personalWritings: writings,
      };
      await setContent("writings", payload);
      localStorage.setItem(
        "portfolio_cache_writings",
        JSON.stringify(payload)
      );
      window.dispatchEvent(new Event("portfolio_content_updated"));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const update = (idx, key, value) => {
    setWritings((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });
  };

  const moveToTop = (idx) => {
    if (idx === 0) return;
    setWritings((prev) => {
      const next = [...prev];
      const item = next.splice(idx, 1)[0];
      next.unshift(item);
      return next;
    });
    setOpenIdx(0);
  };

  const moveUp = (idx) => {
    if (idx === 0) return;
    setWritings((prev) => {
      const next = [...prev];
      const temp = next[idx - 1];
      next[idx - 1] = next[idx];
      next[idx] = temp;
      return next;
    });
    if (openIdx === idx) setOpenIdx(idx - 1);
    else if (openIdx === idx - 1) setOpenIdx(idx);
  };

  const moveDown = (idx) => {
    if (idx === writings.length - 1) return;
    setWritings((prev) => {
      const next = [...prev];
      const temp = next[idx + 1];
      next[idx + 1] = next[idx];
      next[idx] = temp;
      return next;
    });
    if (openIdx === idx) setOpenIdx(idx + 1);
    else if (openIdx === idx + 1) setOpenIdx(idx);
  };

  const moveToBottom = (idx) => {
    if (idx === writings.length - 1) return;
    setWritings((prev) => {
      const next = [...prev];
      const item = next.splice(idx, 1)[0];
      next.push(item);
      return next;
    });
    setOpenIdx(writings.length - 1);
  };

  const addWriting = () => {
    const w = {
      id: `p-${Date.now()}`,
      title: "",
      excerpt: "",
      content: "",
      image: "",
      date: "",
      readTime: "",
      tag: "",
      url: "",
    };
    setWritings((prev) => [w, ...prev]);
    setOpenIdx(0);
  };

  const remove = (idx) => {
    setConfirmDelete({
      isOpen: true,
      targetIdx: idx,
      title: writings[idx]?.title ? `"${writings[idx].title}"` : "Bu yazıyı",
    });
  };

  const uploadImage = async (idx, file) => {
    if (!file) return;
    setUploading((prev) => ({ ...prev, [idx]: true }));
    try {
      const url = await uploadToCloudinary(file, "writings");
      update(idx, "image", url);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading((prev) => ({ ...prev, [idx]: false }));
    }
  };

  const handleAdjustImage = (imageUrl, targetIdx) => {
    setAdjustState({
      isOpen: true,
      imageUrl,
      targetIdx,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-7 max-w-5xl mx-auto text-white">
      <EditorHeader
        title="Yazılarım & Kütüphane"
        subtitle="Kişisel blog yazıları, sayfa başlığı/açıklaması ve kütüphane kapak fotoğrafları"
        saveStatus={saveStatus}
        onSave={save}
      />

      {/* ─── Sayfa Başlık & Açıklama Ayarları (Header) ─── */}
      <div className="rounded-2xl border border-white/10 bg-[#161722] p-5 space-y-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Type size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Yazılar Sayfası Başlık & Açıklama
              </h3>
              <p className="text-xs text-white/50">
                Sitedeki /writings sayfasının en üstünde yer alan başlık ve açıklama metinleri
              </p>
            </div>
          </div>
          <SaveButton
            status={saveStatus}
            onClick={save}
            label="Başlığı Kaydet"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Field label="Üst Kategori / Etiket">
              <TextInput
                value={headerTag}
                onChange={setHeaderTag}
                placeholder="Yazılar"
              />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Ana Başlık (H2)">
              <TextInput
                value={headerTitle}
                onChange={setHeaderTitle}
                placeholder="Kelimelerle şekillenen düşünceler"
              />
            </Field>
          </div>
        </div>

        <Field label="Alt Açıklama Metni">
          <TextArea
            value={headerSubtitle}
            onChange={setHeaderSubtitle}
            rows={2}
            placeholder="Medium'daki teknik yazılar ve atölyeden kişisel notlar — iki ayrı çizgi, aynı elden."
          />
        </Field>
      </div>

      {/* Gizli Dosya Seçici */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (pendingIdx !== null && e.target.files[0]) {
            uploadImage(pendingIdx, e.target.files[0]);
          }
          e.target.value = "";
        }}
      />

      {/* Bilgilendirme ve Yeni Yazı Ekle Butonu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-white/50">
          <strong className="text-rose-300">Grip ikonunu</strong> tutarak
          yazıları fiziksel olarak sürükleyebilir veya{" "}
          <strong className="text-white/80">ok butonlarıyla</strong> sıralamayı
          değiştirebilirsiniz.
        </p>

        <button
          onClick={addWriting}
          className="flex items-center gap-2 text-sm text-rose-400 hover:text-rose-300 border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl px-4 py-2 transition-all cursor-pointer shrink-0 font-semibold shadow-sm"
        >
          <Plus size={16} /> Yeni Yazı Ekle
        </button>
      </div>

      {/* Framer Motion Physics-based Reorder Group */}
      <Reorder.Group
        axis="y"
        values={writings}
        onReorder={setWritings}
        className="space-y-3"
      >
        {writings.map((w, idx) => (
          <WritingItem
            key={w.id || `writing-${idx}`}
            writing={w}
            index={idx}
            total={writings.length}
            isOpen={openIdx === idx}
            onToggleOpen={() => setOpenIdx(openIdx === idx ? null : idx)}
            onUpdate={update}
            onRemove={remove}
            onMoveToTop={moveToTop}
            onMoveUp={moveUp}
            onMoveDown={moveDown}
            onMoveToBottom={moveToBottom}
            onAdjustImage={handleAdjustImage}
            uploading={uploading}
            fileInputRef={fileInputRef}
            setPendingIdx={setPendingIdx}
            onSave={save}
            saveStatus={saveStatus}
            onOpenZenMode={(i) => setZenIdx(i)}
          />
        ))}
      </Reorder.Group>

      {writings.length === 0 && (
        <div className="text-center py-16 bg-white/[0.02] border border-white/10 rounded-2xl">
          <p className="text-white/40 text-sm">Henüz yazı eklenmemiş.</p>
          <button
            onClick={addWriting}
            className="mt-3 text-xs text-rose-400 hover:underline cursor-pointer"
          >
            İlk yazınızı ekleyin
          </button>
        </div>
      )}

      {/* Kapak Görseli Kırpma & Hizalama Modalı (z-[100]) */}
      <ImageAdjustModal
        isOpen={adjustState.isOpen}
        onClose={() => setAdjustState((prev) => ({ ...prev, isOpen: false }))}
        imageUrl={adjustState.imageUrl}
        aspectRatio="card"
        title="Kütüphane Kapak Görseli Kırp & Hizala"
        onSave={(newUrl) => {
          if (adjustState.targetIdx !== null) {
            update(adjustState.targetIdx, "image", newUrl);
          }
        }}
      />

      {/* Tam Ekran Odaklanma / Zen Yazım Modalı */}
      <ZenWritingModal
        isOpen={zenIdx !== null}
        onClose={() => setZenIdx(null)}
        writing={zenIdx !== null ? writings[zenIdx] : null}
        onUpdate={(key, value) => {
          if (zenIdx !== null) update(zenIdx, key, value);
        }}
        saveStatus={saveStatus}
        onSave={save}
      />

      {/* Tatlı Silme Onay Modalı */}
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() =>
          setConfirmDelete({ isOpen: false, targetIdx: null, title: "" })
        }
        onConfirm={() => {
          if (confirmDelete.targetIdx !== null) {
            setWritings((prev) =>
              prev.filter((_, i) => i !== confirmDelete.targetIdx)
            );
            setOpenIdx(null);
          }
        }}
        title="Bu Yazıyı Silmek İstiyor musunuz?"
        description={`${confirmDelete.title} başlıklı yazı listenizden ve kütüphanenizden tamamen silinecektir.`}
        confirmText="Evet, Sil"
        cancelText="Vazgeç"
        variant="danger"
      />
    </div>
  );
}
