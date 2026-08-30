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
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { Reorder, useDragControls } from "framer-motion";
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

const DRAFT_STORAGE_KEY = "portfolio_writings_local_draft";

/**
 * Canlı Otomatik Taslak Durum Rozeti (Auto-Save Status Badge)
 */
function AutoSaveBadge({ draftInfo }) {
  if (draftInfo?.isSaving) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 animate-pulse select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Taslak kaydediliyor...
      </span>
    );
  }

  if (draftInfo?.hasDraft) {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 select-none"
        title="Yazdığınız her kelime elektrik/internet kesilse bile cihazınızın hafızasında güvende"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Taslak cihazda güvende {draftInfo?.savedAt ? `(${draftInfo.savedAt})` : ""}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/5 text-white/40 border border-white/10 select-none">
      <ShieldCheck size={12} className="text-white/40" />
      Canlı sürümle senkronize
    </span>
  );
}

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
  draftInfo,
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
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-white text-base truncate">
                {writing.title || "Başlıksız Yazı"}
              </h3>
              <AutoSaveBadge draftInfo={draftInfo} />
            </div>
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
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors cursor-pointer border border-white/15"
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
  draftInfo,
}) {
  const dragControls = useDragControls();

  const text = writing.content || "";
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const estimatedReadMinutes = Math.max(1, Math.ceil(wordCount / 180));
  const isHidden = writing.hidden === true || writing.published === false;

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
            title="Sıralamayı değiştirmek için sürükleyin"
          >
            <GripVertical size={18} />
          </div>

          {/* Hızlı Sıralama Okları (Tek Tıkla Yukarı/Aşağı) */}
          <div
            className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5 shrink-0"
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
              title="Bir Yukarı Taşı"
            >
              <ArrowUp size={12} />
            </button>
            <button
              type="button"
              disabled={index === total - 1}
              onClick={() => onMoveDown(index)}
              className="text-white/40 hover:text-white disabled:opacity-20 p-1 transition-colors cursor-pointer"
              title="Bir Aşağı Taşı"
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
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-sm text-white/90 truncate">
                {writing.title || "Başlıksız Yazı"}
              </h4>
              {/* Görünürlük Rozeti */}
              {isHidden ? (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/25">
                  Gizli (Taslak)
                </span>
              ) : (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                  Yayında
                </span>
              )}
            </div>
            <p className="text-xs text-white/40 font-mono truncate mt-0.5">
              {writing.tag || "Genel"} · {writing.date || "Tarihsiz"}{" "}
              {writing.readTime ? `· ${writing.readTime}` : ""}
            </p>
          </div>
        </div>

        {/* Aksiyonlar (Görünürlük Değiştirme + Silme + Aç/Kapat) */}
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {/* Hızlı Görünürlük Butonu */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate(index, "hidden", !isHidden);
              onUpdate(index, "published", isHidden);
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-xs font-mono ${
              isHidden
                ? "bg-white/5 hover:bg-emerald-500/20 text-white/40 hover:text-emerald-300 border-white/10 hover:border-emerald-500/30"
                : "bg-emerald-500/10 hover:bg-amber-500/20 text-emerald-400 hover:text-amber-300 border-emerald-500/20 hover:border-amber-500/30"
            }`}
            title={
              isHidden
                ? "Bu yazı sitede GİZLİ. Ziyaretçilere açmak için tıklayın."
                : "Bu yazı sitede YAYINDA. Ziyaretçilere gizlemek için tıklayın."
            }
          >
            {isHidden ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>

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
          {/* Görünürlük & Yayın Durumu Paneli */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl border ${
                  isHidden
                    ? "bg-amber-500/15 border-amber-500/25 text-amber-300"
                    : "bg-emerald-500/15 border-emerald-500/25 text-emerald-300"
                }`}
              >
                {isHidden ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {isHidden
                    ? "Ziyaretçilere Gizli (Taslak Modu)"
                    : "Sitede Yayında (Ziyaretçilere Açık)"}
                </p>
                <p className="text-xs text-white/50 mt-0.5">
                  {isHidden
                    ? "Bu yazı yalnızca bu admin panelinde görünür; kütüphaneyi gezen ziyaretçilere gösterilmez."
                    : "Kütüphaneyi (/writings) gezen tüm ziyaretçiler bu yazıyı görebilir ve okuyabilir."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onUpdate(index, "hidden", !isHidden);
                onUpdate(index, "published", isHidden);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                isHidden
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/30 shadow-md shadow-emerald-950/30"
                  : "bg-white/10 hover:bg-amber-500/20 text-white/70 hover:text-amber-300 border-white/10 hover:border-amber-500/30"
              }`}
            >
              {isHidden ? "Sitede Yayınla" : "Siteden Gizle"}
            </button>
          </div>

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
                Görsel yüklendikten sonra üzerine tıklayarak odak noktasını ve
                kırpmasını ayarlayabilirsiniz.
              </p>
              <button
                type="button"
                onClick={() => {
                  setPendingIdx(index);
                  fileInputRef.current?.click();
                }}
                className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-mono bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg border border-rose-500/20 transition-colors cursor-pointer mt-1"
              >
                <Upload size={12} />
                <span>{writing.image ? "Görseli Değiştir" : "Görsel Yükle"}</span>
              </button>
            </div>
          </div>

          {/* Form Alanları */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Yazı Başlığı">
                <TextInput
                  value={writing.title}
                  onChange={(v) => onUpdate(index, "title", v)}
                  placeholder="Yazı başlığı..."
                />
              </Field>
            </div>

            <Field label="Kategori / Etiket">
              <TextInput
                value={writing.tag}
                onChange={(v) => onUpdate(index, "tag", v)}
                placeholder="Örn: Sanat & Kod, Deneme, Felsefe"
              />
            </Field>

            <Field label="Yayın Tarihi">
              <TextInput
                value={writing.date}
                onChange={(v) => onUpdate(index, "date", v)}
                placeholder="Örn: Ağustos 2026"
              />
            </Field>

            <Field label="Dış Bağlantı (Medium Linki - İsteğe Bağlı)">
              <TextInput
                value={writing.url}
                onChange={(v) => onUpdate(index, "url", v)}
                placeholder="https://medium.com/@aleyna/..."
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

          {/* ─── Tam Metin / İçerik Alanı ─── */}
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
                <AutoSaveBadge draftInfo={draftInfo} />
              </div>

              <div className="flex items-center gap-2">
                {/* Genişlet / Tam Ekran Yazım Butonu */}
                <button
                  type="button"
                  onClick={() => onOpenZenMode(index)}
                  className="flex items-center gap-1.5 text-xs font-mono text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs"
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
  const [headerSaveStatus, setHeaderSaveStatus] = useState("idle");
  const [openIdx, setOpenIdx] = useState(null);
  const [uploading, setUploading] = useState({});
  const fileInputRef = useRef();
  const [pendingIdx, setPendingIdx] = useState(null);
  const [zenIdx, setZenIdx] = useState(null);

  // Auto-save & Local Draft state
  const [draftInfo, setDraftInfo] = useState({
    hasDraft: false,
    savedAt: null,
    isSaving: false,
  });
  const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false);
  const [showDraftBanner, setShowDraftBanner] = useState(false);

  // Modals state
  const [confirmDelete, setConfirmDelete] = useState({
    isOpen: false,
    targetIdx: null,
    title: "",
  });
  const [confirmRevertModal, setConfirmRevertModal] = useState(false);

  // Image adjust modal state
  const [adjustState, setAdjustState] = useState({
    isOpen: false,
    imageUrl: "",
    targetIdx: null,
  });

  // Check if draft in localStorage has REAL differences compared to server data
  const isDraftDifferentFromServer = (draftPayload, serverData) => {
    if (!draftPayload || !serverData) return false;
    const serverWritings = serverData.personalWritings || [];
    const draftWritings = draftPayload.writings || [];
    if (draftWritings.length !== serverWritings.length) return true;

    // Check header
    if (
      draftPayload.headerTag !== (serverData.tag || "Yazılar") ||
      draftPayload.headerTitle !== (serverData.title || "Kelimelerle şekillenen düşünceler") ||
      draftPayload.headerSubtitle !== (serverData.subtitle || "")
    ) {
      return true;
    }

    // Check each writing content/title/excerpt
    for (let i = 0; i < draftWritings.length; i++) {
      const dw = draftWritings[i];
      const sw = serverWritings[i];
      if (!sw) return true;
      if (
        dw.title !== sw.title ||
        dw.content !== sw.content ||
        dw.excerpt !== sw.excerpt ||
        dw.tag !== sw.tag ||
        dw.date !== sw.date ||
        dw.readTime !== sw.readTime ||
        dw.hidden !== sw.hidden
      ) {
        return true;
      }
    }
    return false;
  };

  // 1. Initial Mount & Data Sync
  useEffect(() => {
    if (!data) return;

    const savedDraftStr = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraftStr) {
      try {
        const savedDraft = JSON.parse(savedDraftStr);
        // Only consider it a draft if it differs from server data!
        if (savedDraft && isDraftDifferentFromServer(savedDraft, data)) {
          setWritings(savedDraft.writings || []);
          if (savedDraft.headerTag !== undefined) setHeaderTag(savedDraft.headerTag);
          if (savedDraft.headerTitle !== undefined) setHeaderTitle(savedDraft.headerTitle);
          if (savedDraft.headerSubtitle !== undefined) setHeaderSubtitle(savedDraft.headerSubtitle);

          const targetIdx =
            savedDraft.targetIdx !== undefined ? savedDraft.targetIdx : 0;
          const targetWriting =
            (savedDraft.writings && savedDraft.writings[targetIdx]) || {};

          let draftTitle =
            savedDraft.draftTitle || targetWriting.title?.trim() || "Yazı";
          let draftSnippet = savedDraft.draftSnippet || "";
          if (!draftSnippet && targetWriting.content?.trim()) {
            const clean = targetWriting.content.replace(/\s+/g, " ").trim();
            draftSnippet = clean.length > 55 ? clean.slice(0, 55) + "..." : clean;
          }

          setDraftInfo({
            hasDraft: true,
            savedAt: savedDraft.savedAt || "Az önce",
            draftTitle: draftTitle,
            draftSnippet: draftSnippet,
            targetIdx: targetIdx,
            isSaving: false,
          });
          setHasUnsavedEdits(true);
          setShowDraftBanner(true);
          setOpenIdx(targetIdx);
          return;
        } else {
          // If draft is identical to server, clean the stale draft key!
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        }
      } catch (e) {
        console.error("Draft parsing error", e);
      }
    }

    // Default clean load from Firestore
    if (data.personalWritings) setWritings(data.personalWritings);
    if (data.tag !== undefined) setHeaderTag(data.tag);
    if (data.title !== undefined) setHeaderTitle(data.title);
    if (data.subtitle !== undefined) setHeaderSubtitle(data.subtitle);
    setHasUnsavedEdits(false);
    setDraftInfo({ hasDraft: false, savedAt: null, isSaving: false });
    setShowDraftBanner(false);
  }, [data]);

  // 2. Persist to LocalStorage whenever user makes edits
  const persistDraftToStorage = (
    newWritings,
    newTag,
    newTitle,
    newSubtitle,
    editedIdx = null
  ) => {
    setHasUnsavedEdits(true);
    setDraftInfo((prev) => ({ ...prev, isSaving: true }));

    const now = new Date();
    const timeStr = now.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const targetIdx =
      editedIdx !== null ? editedIdx : openIdx !== null ? openIdx : 0;
    const targetWriting = newWritings[targetIdx] || newWritings[0] || {};

    let draftTitle = targetWriting.title?.trim() || "";
    let draftSnippet = "";
    if (targetWriting.content?.trim()) {
      const cleanContent = targetWriting.content.replace(/\s+/g, " ").trim();
      draftSnippet =
        cleanContent.length > 55
          ? cleanContent.slice(0, 55) + "..."
          : cleanContent;
    } else if (targetWriting.excerpt?.trim()) {
      const cleanExcerpt = targetWriting.excerpt.replace(/\s+/g, " ").trim();
      draftSnippet =
        cleanExcerpt.length > 55
          ? cleanExcerpt.slice(0, 55) + "..."
          : cleanExcerpt;
    }

    const draftPayload = {
      writings: newWritings,
      headerTag: newTag,
      headerTitle: newTitle,
      headerSubtitle: newSubtitle,
      savedAt: timeStr,
      draftTitle:
        draftTitle ||
        (targetWriting.tag ? `${targetWriting.tag} Yazısı` : "Yazı"),
      draftSnippet: draftSnippet,
      targetIdx: targetIdx,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftPayload));
      setDraftInfo({
        hasDraft: true,
        savedAt: timeStr,
        draftTitle: draftPayload.draftTitle,
        draftSnippet: draftPayload.draftSnippet,
        targetIdx: targetIdx,
        isSaving: false,
      });
    } catch (e) {
      console.error("Auto-save to localStorage failed", e);
      setDraftInfo((prev) => ({ ...prev, isSaving: false }));
    }
  };

  // 3. Tab Close Protection (ONLY active if user has unsaved edits)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedEdits && draftInfo.hasDraft) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedEdits, draftInfo.hasDraft]);

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

      // Clean local draft completely on publish
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setHasUnsavedEdits(false);
      setDraftInfo({
        hasDraft: false,
        savedAt: null,
        isSaving: false,
      });
      setShowDraftBanner(false);

      window.dispatchEvent(new Event("portfolio_content_updated"));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const saveHeader = async () => {
    setHeaderSaveStatus("saving");
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
      setHeaderSaveStatus("saved");
      setTimeout(() => setHeaderSaveStatus("idle"), 3000);
    } catch (err) {
      console.error(err);
      setHeaderSaveStatus("error");
      setTimeout(() => setHeaderSaveStatus("idle"), 3000);
    }
  };

  const revertToPublished = () => {
    if (data?.personalWritings) {
      setWritings(data.personalWritings);
      if (data.tag !== undefined) setHeaderTag(data.tag);
      if (data.title !== undefined) setHeaderTitle(data.title);
      if (data.subtitle !== undefined) setHeaderSubtitle(data.subtitle);
    }
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setHasUnsavedEdits(false);
    setDraftInfo({ hasDraft: false, savedAt: null, isSaving: false });
    setShowDraftBanner(false);
    setOpenIdx(0);
  };

  const update = (idx, key, value) => {
    setWritings((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      persistDraftToStorage(next, headerTag, headerTitle, headerSubtitle, idx);
      return next;
    });
  };

  const handleSetHeaderTag = (val) => {
    setHeaderTag(val);
    persistDraftToStorage(writings, val, headerTitle, headerSubtitle);
  };

  const handleSetHeaderTitle = (val) => {
    setHeaderTitle(val);
    persistDraftToStorage(writings, headerTag, val, headerSubtitle);
  };

  const handleSetHeaderSubtitle = (val) => {
    setHeaderSubtitle(val);
    persistDraftToStorage(writings, headerTag, headerTitle, val);
  };

  const moveToTop = (idx) => {
    if (idx === 0) return;
    setWritings((prev) => {
      const next = [...prev];
      const item = next.splice(idx, 1)[0];
      next.unshift(item);
      persistDraftToStorage(next, headerTag, headerTitle, headerSubtitle, 0);
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
      persistDraftToStorage(next, headerTag, headerTitle, headerSubtitle, idx - 1);
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
      persistDraftToStorage(next, headerTag, headerTitle, headerSubtitle, idx + 1);
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
      persistDraftToStorage(next, headerTag, headerTitle, headerSubtitle, next.length - 1);
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
      hidden: false,
      published: true,
    };
    setWritings((prev) => {
      const next = [w, ...prev];
      persistDraftToStorage(next, headerTag, headerTitle, headerSubtitle, 0);
      return next;
    });
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

  if (loading && writings.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ─── Başlık & Üst Kaydet Butonu ─── */}
      <EditorHeader
        title="Kişisel Notlar & Yazılar"
        subtitle="Düşünceler, denemeler ve teknik yazılar (Yazıları göz ikonuyla ziyaretçilere açıp gizleyebilirsiniz)"
        saveStatus={saveStatus}
        onSave={save}
      />

      {/* ─── Yerel Taslak Kurtarma Bildirim Kartı ─── */}
      {showDraftBanner && draftInfo.hasDraft && (
        <div className="p-4.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-[#161722] to-[#161722] border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn shadow-xl">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0 mt-0.5">
              <ShieldCheck size={20} />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-white">
                  Kaydedilmemiş yerel taslağınız bulundu ve yüklendi
                </p>
                <span className="text-[11px] font-mono text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                  {draftInfo.savedAt || "Az önce"}
                </span>
              </div>

              {/* Kaldığı yazının ismi veya metin kesiti */}
              <p className="text-xs text-white/80 font-medium truncate max-w-xl">
                <span className="text-emerald-400 font-mono font-semibold">Kaldığınız Yazı:</span>{" "}
                <span className="font-semibold text-white bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                  {draftInfo.draftTitle ? `"${draftInfo.draftTitle}"` : "Başlıksız Yazı"}
                </span>
                {draftInfo.draftSnippet ? (
                  <span className="text-white/50 italic ml-2 font-sans">
                    — “{draftInfo.draftSnippet}”
                  </span>
                ) : null}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setShowDraftBanner(false);
                if (
                  draftInfo.targetIdx !== undefined &&
                  draftInfo.targetIdx !== null
                ) {
                  setOpenIdx(draftInfo.targetIdx);
                } else {
                  setOpenIdx(0);
                }
              }}
              className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30 transition-colors cursor-pointer"
            >
              Taslakla Devam Et ✓
            </button>
            <button
              type="button"
              onClick={() => setConfirmRevertModal(true)}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-rose-500/20 text-white/70 hover:text-rose-300 text-xs font-mono border border-white/10 hover:border-rose-500/30 transition-colors cursor-pointer"
            >
              Yayındaki Haline Dön
            </button>
          </div>
        </div>
      )}

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
            status={headerSaveStatus}
            onClick={saveHeader}
            label="Başlığı Kaydet"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Field label="Üst Kategori / Etiket">
              <TextInput
                value={headerTag}
                onChange={handleSetHeaderTag}
                placeholder="Yazılar"
              />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Ana Başlık (H2)">
              <TextInput
                value={headerTitle}
                onChange={handleSetHeaderTitle}
                placeholder="Kelimelerle şekillenen düşünceler"
              />
            </Field>
          </div>
        </div>

        <Field label="Alt Açıklama Metni">
          <TextArea
            value={headerSubtitle}
            onChange={handleSetHeaderSubtitle}
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
          yazıları sürükleyebilir, <strong className="text-emerald-400">Göz ikonuyla</strong> yazıları
          ziyaretçilere açıp gizleyebilirsiniz.
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
        onReorder={(newOrder) => {
          setWritings(newOrder);
          persistDraftToStorage(newOrder, headerTag, headerTitle, headerSubtitle);
        }}
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
            draftInfo={draftInfo}
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
        draftInfo={draftInfo}
      />

      {/* Tatlı Silme Onay Modalı */}
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() =>
          setConfirmDelete({ isOpen: false, targetIdx: null, title: "" })
        }
        onConfirm={() => {
          if (confirmDelete.targetIdx !== null) {
            setWritings((prev) => {
              const next = prev.filter((_, i) => i !== confirmDelete.targetIdx);
              persistDraftToStorage(next, headerTag, headerTitle, headerSubtitle);
              return next;
            });
            setOpenIdx(null);
          }
        }}
        title="Bu Yazıyı Silmek İstiyor musunuz?"
        description={`${confirmDelete.title} başlıklı yazı listenizden ve kütüphanenizden tamamen silinecektir.`}
        confirmText="Evet, Sil"
        cancelText="Vazgeç"
        variant="danger"
      />

      {/* Yayındaki Haline Dönme Onay Modalı */}
      <ConfirmModal
        isOpen={confirmRevertModal}
        onClose={() => setConfirmRevertModal(false)}
        onConfirm={revertToPublished}
        title="Yayındaki Orijinal Sürüme Dön?"
        description="Cihazınızdaki kaydedilmemiş tüm yerel taslaklar silinecek ve sitede en son yayınlanmış olan resmi sürüme geri dönülecektir."
        confirmText="Evet, Yayındakine Dön"
        cancelText="Vazgeç"
        variant="warning"
      />
    </div>
  );
}
