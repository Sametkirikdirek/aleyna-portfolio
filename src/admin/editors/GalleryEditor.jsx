import { useState, useEffect, useRef, useMemo } from "react";
import { Plus, Trash2, Upload, Scissors, Heart, Flame, Trophy } from "lucide-react";
import { useGallery } from "../../hooks/useContent";
import { setContent } from "../../lib/firestore";
import { uploadToCloudinary } from "../../lib/cloudinary";
import ImageAdjustModal from "../components/ImageAdjustModal";
import {
  EditorHeader, SectionTitle, Field, TextInput, TextArea, Card, SaveButton,
} from "../components/AdminUI";

export default function GalleryEditor() {
  const { data, loading } = useGallery();
  const [artworks, setArtworks] = useState([]);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [uploading, setUploading] = useState({});
  const fileInputRef = useRef();
  const [addingIdx, setAddingIdx] = useState(null);

  // Image adjust modal state
  const [adjustState, setAdjustState] = useState({
    isOpen: false,
    imageUrl: "",
    targetIdx: null,
  });

  useEffect(() => {
    if (data && artworks.length === 0) {
      setArtworks(data.artworks || []);
    }
  }, [data]);

  // Compute counts for quick status
  const spotlightCount = useMemo(() => artworks.filter((a) => a.featuredInSpotlight).length, [artworks]);
  const monthlyCount = useMemo(() => artworks.filter((a) => a.featuredInMonthly).length, [artworks]);

  // Compute top-liked artworks for quick-select
  const topLiked = useMemo(() => {
    return [...(artworks)]
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 5);
  }, [artworks]);

  const toggleFeatured = (id) => {
    setArtworks((prev) =>
      prev.map((a) => a.id === id ? { ...a, featuredInMonthly: !a.featuredInMonthly } : a)
    );
  };

  const toggleSpotlight = (id) => {
    setArtworks((prev) => {
      const art = prev.find((a) => a.id === id);
      if (art && !art.featuredInSpotlight) {
        const currentCount = prev.filter((a) => a.featuredInSpotlight).length;
        if (currentCount >= 5) {
          alert("Öne Çıkanlar (Spotlight) vitrinine en fazla 5 eser seçilebilir!");
          return prev;
        }
      }
      return prev.map((a) => a.id === id ? { ...a, featuredInSpotlight: !a.featuredInSpotlight } : a);
    });
  };

  const save = async () => {
    setSaveStatus("saving");
    try {
      await setContent("gallery", { artworks });
      // Update cache
      localStorage.setItem("portfolio_cache_gallery", JSON.stringify({ artworks }));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const updateArtwork = (idx, key, value) => {
    setArtworks((prev) => {
      if (key === "featuredInSpotlight" && value === true) {
        const count = prev.filter((a) => a.featuredInSpotlight).length;
        if (count >= 5) {
          alert("Öne Çıkanlar (Spotlight) vitrini için en fazla 5 eser seçebilirsiniz!");
          return prev;
        }
      }
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });
  };

  const removeArtwork = (idx) => {
    setArtworks((prev) => prev.filter((_, i) => i !== idx));
  };

  const addArtwork = () => {
    const newArt = {
      id: `eser-${Date.now()}`,
      title: "",
      year: new Date().getFullYear().toString(),
      medium: "",
      image: "",
      note: "",
      likes: 0,
      featuredInMonthly: false,
    };
    setArtworks((prev) => [newArt, ...prev]);
  };

  const uploadImage = async (idx, file) => {
    if (!file) return;
    setUploading((prev) => ({ ...prev, [idx]: true }));
    try {
      const url = await uploadToCloudinary(file, "gallery");
      updateArtwork(idx, "image", url);
    } catch (err) {
      console.error("Yükleme hatası:", err);
    } finally {
      setUploading((prev) => ({ ...prev, [idx]: false }));
    }
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
        title="Galeri & Ayın Tuvalleri"
        subtitle="Eserlerin yönetimi, kırpılması, beğeni sayıları ve 'Ayın Tuvalinde Göster' ayarları"
        saveStatus={saveStatus}
        onSave={save}
      />

      <ImageAdjustModal
        isOpen={adjustState.isOpen}
        onClose={() => setAdjustState((prev) => ({ ...prev, isOpen: false }))}
        imageUrl={adjustState.imageUrl}
        aspectRatio="square"
        title="Eser Görseli Hizala & Kırp"
        onSave={(newUrl) => {
          if (adjustState.targetIdx !== null) {
            updateArtwork(adjustState.targetIdx, "image", newUrl);
          }
        }}
      />

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (addingIdx !== null && e.target.files[0]) {
            uploadImage(addingIdx, e.target.files[0]);
          }
          e.target.value = "";
        }}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <p className="text-xs text-white/50">
          <strong className="text-white/80">"Yeni Eser Ekle"</strong> ile galerinize resim yükleyin.{" "}
          <strong className="text-rose-400 font-semibold">"Ayın Tuvalinde Göster"</strong> işaretleyerek vitrine taşıyın!
        </p>

        <button
          onClick={addArtwork}
          className="flex items-center gap-2 text-sm text-rose-400 hover:text-rose-300 border border-rose-500/30 rounded-lg px-4 py-2 transition-colors cursor-pointer shrink-0"
        >
          <Plus size={15} /> Yeni Eser Ekle
        </button>
      </div>

      {/* ─── Hızlı Seçim Paneli ─── */}
      <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-amber-500/15 pb-2">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-amber-400" />
            <h4 className="font-mono text-sm font-semibold text-amber-300">Vitrin & Ayın Tuvalleri Yönetimi</h4>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-rose-300 bg-rose-500/15 px-2 py-0.5 rounded border border-rose-500/30">🔥 Ayın Tuvalleri: {monthlyCount}</span>
            <span className={`px-2 py-0.5 rounded border ${spotlightCount >= 5 ? "bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold" : "bg-white/5 text-white/60 border-white/10"}`}>🏆 Öne Çıkanlar: {spotlightCount}/5</span>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-mono text-white/50 mb-2">En çok beğenilen eserler üzerinden hızlı seçim yapabilirsiniz:</p>
          <div className="flex flex-wrap gap-2">
            {topLiked.map((art) => (
              <div
                key={art.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-mono"
              >
                <span className="truncate max-w-[110px] text-white/80 font-medium">{art.title || "İsimsiz"}</span>
                <span className="text-[10px] text-amber-400 font-bold mr-1">{art.likes || 0} ♥</span>
                
                {/* Monthly Toggle */}
                <button
                  type="button"
                  onClick={() => toggleFeatured(art.id)}
                  title="Ayın Tuvalinde Göster"
                  className={`p-1 rounded transition-colors ${
                    art.featuredInMonthly
                      ? "bg-rose-500/25 text-rose-300 border border-rose-500/50"
                      : "bg-white/5 text-white/30 hover:text-white"
                  }`}
                >
                  🔥
                </button>

                {/* Spotlight Toggle */}
                <button
                  type="button"
                  onClick={() => toggleSpotlight(art.id)}
                  title="Öne Çıkanlarda Göster (Maks 5)"
                  className={`p-1 rounded transition-colors ${
                    art.featuredInSpotlight
                      ? "bg-amber-500/25 text-amber-300 border border-amber-500/50"
                      : "bg-white/5 text-white/30 hover:text-white"
                  }`}
                >
                  🏆
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {artworks.map((art, idx) => (
          <Card key={art.id || idx} className="group">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              {/* Resim önizleme / kırpma çerçevesi */}
              <div className="flex flex-col items-center gap-1.5 shrink-0 w-full sm:w-auto">
                <div
                  className="group/frame relative w-28 h-28 rounded-xl border-2 border-dashed border-white/20 hover:border-rose-500/60 cursor-pointer overflow-hidden flex items-center justify-center bg-white/[0.03] transition-all shadow-md"
                  onClick={() => {
                    if (art.image) {
                      setAdjustState({ isOpen: true, imageUrl: art.image, targetIdx: idx });
                    } else {
                      setAddingIdx(idx);
                      fileInputRef.current?.click();
                    }
                  }}
                  title="Görseli kırpmak ve hizalamak için çerçeveye tıklayın"
                >
                  {art.image ? (
                    <>
                      <img
                        src={art.image}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover/frame:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/55 opacity-0 group-hover/frame:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-mono gap-1">
                        <Scissors size={14} className="text-rose-400" />
                        <span>Hizala</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-white/40">
                      <Upload size={20} />
                      <span className="text-[9px] mt-1">Görsel</span>
                    </div>
                  )}
                  {uploading[idx] && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Yükle / Değiştir Butonları */}
                <div className="flex flex-col gap-1 items-center">
                  <button
                    type="button"
                    onClick={() => { setAddingIdx(idx); fileInputRef.current?.click(); }}
                    className="text-[10px] text-rose-300 hover:text-rose-200 bg-rose-500/15 border border-rose-500/30 px-2.5 py-1 rounded transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <Upload size={10} /> Görsel Yükle
                  </button>
                  {art.image && (
                    <button
                      type="button"
                      onClick={() => setAdjustState({ isOpen: true, imageUrl: art.image, targetIdx: idx })}
                      className="text-[9px] text-white/50 hover:text-white transition-colors cursor-pointer"
                    >
                      ✂️ Hizala / Kırp
                    </button>
                  )}
                </div>
              </div>

              {/* Bilgiler */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                <Field label="Eser Adı">
                  <TextInput value={art.title} onChange={(v) => updateArtwork(idx, "title", v)} placeholder="Örn: Tuval Üzerine Akrilik #4" />
                </Field>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Field label="Yıl">
                      <TextInput value={art.year} onChange={(v) => updateArtwork(idx, "year", v)} placeholder="2026" />
                    </Field>
                  </div>
                  {/* Beğeni Rozeti */}
                  <div className="pt-5">
                    <span className="inline-flex items-center gap-1 text-xs font-mono bg-rose-500/10 text-rose-300 border border-rose-500/25 px-2.5 py-2 rounded-xl">
                      <Heart size={13} className="text-rose-400 fill-rose-400" />
                      <strong>{art.likes || 0}</strong> Beğeni
                    </span>
                  </div>
                </div>

                <Field label="Teknik / Materyal">
                  <TextInput value={art.medium} onChange={(v) => updateArtwork(idx, "medium", v)} placeholder="Yağlı Boya & Dijital Karışım" />
                </Field>

                {/* Ayın Tuvalinde Göster + Öne Çıkanlarda Göster Toggle Butonlar */}
                <div className="pt-3 flex flex-wrap gap-2">
                  {/* Ayın Tuvalinde Göster */}
                  <button
                    type="button"
                    onClick={() => updateArtwork(idx, "featuredInMonthly", !art.featuredInMonthly)}
                    className={`inline-flex items-center gap-2 cursor-pointer px-3 py-2 rounded-xl border transition-all text-xs font-mono ${
                      art.featuredInMonthly
                        ? "bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.25)]"
                        : "bg-white/[0.04] border-white/10 hover:border-rose-500/40 text-white/60"
                    }`}
                  >
                    <span className="text-base leading-none">{art.featuredInMonthly ? "✅" : "☐"}</span>
                    🔥 <strong className={art.featuredInMonthly ? "text-rose-300" : "text-white/50"}>Ayın Tuvalinde Göster</strong>
                  </button>

                  {/* Öne Çıkanlarda Göster (Spotlight / Enler) */}
                  <button
                    type="button"
                    onClick={() => updateArtwork(idx, "featuredInSpotlight", !art.featuredInSpotlight)}
                    className={`inline-flex items-center gap-2 cursor-pointer px-3 py-2 rounded-xl border transition-all text-xs font-mono ${
                      art.featuredInSpotlight
                        ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                        : "bg-white/[0.04] border-white/10 hover:border-amber-500/40 text-white/60"
                    }`}
                  >
                    <span className="text-base leading-none">{art.featuredInSpotlight ? "✅" : "☐"}</span>
                    🏆 <strong className={art.featuredInSpotlight ? "text-amber-300" : "text-white/50"}>Öne Çıkanlarda Göster</strong>
                  </button>
                </div>

                <div className="sm:col-span-2">
                  <Field label="Sanatçı Notu / Açıklama">
                    <TextArea value={art.note || ""} onChange={(v) => updateArtwork(idx, "note", v)} placeholder="Eser hakkındaki düşünceleriniz..." rows={2} />
                  </Field>
                </div>
              </div>

              {/* Sil */}
              <button
                onClick={() => removeArtwork(idx)}
                className="text-white/20 hover:text-rose-400 p-2 transition-colors cursor-pointer"
                title="Eseri Sil"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
