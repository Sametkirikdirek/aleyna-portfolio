import { useState, useEffect, useRef, useMemo } from "react";
import {
  Plus,
  Trash2,
  Upload,
  Scissors,
  Heart,
  Flame,
  Trophy,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit3,
  Layers,
  Sparkles,
  Palette,
  Check,
} from "lucide-react";
import { useGallery } from "../../hooks/useContent";
import { setContent } from "../../lib/firestore";
import { uploadToCloudinary } from "../../lib/cloudinary";
import ImageAdjustModal from "../components/ImageAdjustModal";
import {
  EditorHeader,
  SectionTitle,
  Field,
  TextInput,
  TextArea,
  Card,
  SaveButton,
} from "../components/AdminUI";

export default function GalleryEditor() {
  const { data, loading } = useGallery();
  const [artworks, setArtworks] = useState([]);
  const [headerTitle, setHeaderTitle] = useState("");
  const [headerSubtitle, setHeaderSubtitle] = useState("");
  const [saveStatus, setSaveStatus] = useState("idle");
  const [uploading, setUploading] = useState({});
  const fileInputRef = useRef();
  const [addingIdx, setAddingIdx] = useState(null);

  // Search & Filter state in Admin
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all' | 'monthly' | 'spotlight'

  // Artwork being edited in popup modal (original index in `artworks` array)
  const [editingIdx, setEditingIdx] = useState(null);

  // Image adjust modal state
  const [adjustState, setAdjustState] = useState({
    isOpen: false,
    imageUrl: "",
    targetIdx: null,
  });

  useEffect(() => {
    if (data) {
      if (artworks.length === 0 && data.artworks) {
        setArtworks(data.artworks);
      }
      if (headerTitle === "") {
        setHeaderTitle(data.title || "Tuval ve Kodun Kesişimi");
      }
      if (headerSubtitle === "") {
        setHeaderSubtitle(
          data.subtitle ||
            "Esere dokunarak hikâyesini inceleyin. Kalp ikonuna dokunarak beğeninizi iletin."
        );
      }
    }
  }, [data]);

  // Compute counts for quick status
  const spotlightCount = useMemo(
    () => artworks.filter((a) => a.featuredInSpotlight).length,
    [artworks]
  );
  const monthlyCount = useMemo(
    () => artworks.filter((a) => a.featuredInMonthly).length,
    [artworks]
  );

  // Filtered artworks for the visual grid
  const filteredArtworks = useMemo(() => {
    return artworks
      .map((art, originalIndex) => ({ ...art, originalIndex }))
      .filter((art) => {
        if (filterType === "monthly" && !art.featuredInMonthly) return false;
        if (filterType === "spotlight" && !art.featuredInSpotlight) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = art.title && art.title.toLowerCase().includes(q);
          const matchMedium = art.medium && art.medium.toLowerCase().includes(q);
          const matchYear = art.year && art.year.toString().includes(q);
          const matchNote = art.note && art.note.toLowerCase().includes(q);
          if (!matchTitle && !matchMedium && !matchYear && !matchNote) return false;
        }
        return true;
      });
  }, [artworks, searchQuery, filterType]);

  const toggleFeatured = (id) => {
    setArtworks((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, featuredInMonthly: !a.featuredInMonthly } : a
      )
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
      return prev.map((a) =>
        a.id === id ? { ...a, featuredInSpotlight: !a.featuredInSpotlight } : a
      );
    });
  };

  // Move artwork by index (Reordering)
  const moveItem = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= artworks.length || fromIdx === toIdx) return;
    setArtworks((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(fromIdx, 1);
      copy.splice(toIdx, 0, item);
      return copy;
    });
    // If currently editing this item, update editingIdx to track it
    if (editingIdx === fromIdx) {
      setEditingIdx(toIdx);
    }
  };

  const save = async () => {
    setSaveStatus("saving");
    try {
      const payload = {
        title: headerTitle || "Tuval ve Kodun Kesişimi",
        subtitle:
          headerSubtitle ||
          "Esere dokunarak hikâyesini inceleyin. Kalp ikonuna dokunarak beğeninizi iletin.",
        artworks,
      };
      await setContent("gallery", payload);
      localStorage.setItem("portfolio_cache_gallery", JSON.stringify(payload));
      window.dispatchEvent(new Event("portfolio_content_updated"));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const resetAllLikes = async () => {
    if (
      !window.confirm(
        "Tüm eserlerin beğeni sayılarını 0 yapmak istediğinize emin misiniz?"
      )
    ) {
      return;
    }
    const zeroed = artworks.map((art) => ({ ...art, likes: 0 }));
    setArtworks(zeroed);
    try {
      localStorage.removeItem("user_liked_artworks");
      const payload = {
        title: headerTitle,
        subtitle: headerSubtitle,
        artworks: zeroed,
      };
      localStorage.setItem("portfolio_cache_gallery", JSON.stringify(payload));
      await setContent("gallery", payload);
      window.dispatchEvent(new Event("portfolio_content_updated"));
      alert("Tüm beğeni sayıları 0'a sıfırlandı!");
    } catch (err) {
      console.error("Sıfırlama hatası:", err);
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
    if (!window.confirm("Bu eseri galeriden silmek istediğinize emin misiniz?")) return;
    setArtworks((prev) => prev.filter((_, i) => i !== idx));
    if (editingIdx === idx) {
      setEditingIdx(null);
    }
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
      featuredInSpotlight: false,
    };
    setArtworks((prev) => [newArt, ...prev]);
    // Automatically open the editor for this new artwork (which is now index 0)
    setEditingIdx(0);
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

  const currentEditingArt = editingIdx !== null ? artworks[editingIdx] : null;

  return (
    <div className="space-y-7 max-w-6xl mx-auto text-white">
      <EditorHeader
        title="Galeri & Vitrin Yönetimi"
        subtitle="Galeri başlığı, eser sıralaması, vitrinler ve eser detayları"
        saveStatus={saveStatus}
        onSave={save}
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

      {/* ─── 1. GALERİ BAŞLIK VE AÇIKLAMA AYARLARI ─── */}
      <Card className="border border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
          <Palette size={16} className="text-rose-400" />
          <h3 className="font-mono text-sm font-semibold text-white/90">
            Galeri Sayfası Başlık & Açıklama Metinleri
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Galeri Ana Başlığı">
            <TextInput
              value={headerTitle}
              onChange={setHeaderTitle}
              placeholder="Tuval ve Kodun Kesişimi"
            />
          </Field>
          <Field label="Galeri Alt Açıklaması">
            <TextInput
              value={headerSubtitle}
              onChange={setHeaderSubtitle}
              placeholder="Esere dokunarak hikâyesini inceleyin. Kalp ikonuna dokunarak beğeninizi iletin."
            />
          </Field>
        </div>
      </Card>

      {/* ─── 2. HIZLI ARAMA, FİLTRELEME VE YENİ ESER BUTONLARI ─── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Eser adı, teknik veya yılda ara..."
            className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-rose-500 rounded-xl pl-10 pr-9 py-2.5 text-xs font-mono text-white placeholder:text-white/30 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterType("all")}
            className={`font-mono text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              filterType === "all"
                ? "bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold"
                : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
            }`}
          >
            Tümü ({artworks.length})
          </button>
          <button
            onClick={() => setFilterType("monthly")}
            className={`font-mono text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
              filterType === "monthly"
                ? "bg-rose-500/25 text-rose-300 border-rose-500/60 font-bold"
                : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
            }`}
          >
            🔥 Ayın Tuvalleri ({monthlyCount})
          </button>
          <button
            onClick={() => setFilterType("spotlight")}
            className={`font-mono text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
              filterType === "spotlight"
                ? "bg-amber-500/25 text-amber-300 border-amber-500/60 font-bold"
                : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
            }`}
          >
            🏆 Öne Çıkanlar ({spotlightCount}/5)
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={resetAllLikes}
            className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2 transition-colors cursor-pointer"
            title="Tüm eserlerin beğeni sayılarını 0 yap"
          >
            <Heart size={13} className="text-amber-400" /> Beğenileri Sıfırla
          </button>

          <button
            onClick={addArtwork}
            className="flex items-center gap-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl px-4 py-2.5 transition-all shadow-md cursor-pointer shrink-0"
          >
            <Plus size={15} /> Yeni Eser Ekle
          </button>
        </div>
      </div>

      {/* ─── 3. ESERLERİN GÖRSEL GRID'İ (Sitedeki Sırayla Birebir Eşleşen Grid Görünümü) ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-white/50 px-1">
          <span>
            💡 <strong>İpucu:</strong> Bir esere tıklayarak detaylarını düzenleyin. ⬅️ ➡️ butonlarıyla eserlerin galerideki sırasını anında değiştirin.
          </span>
          <span>{filteredArtworks.length} eser listeleniyor</span>
        </div>

        {filteredArtworks.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-white/15 rounded-2xl bg-white/[0.01]">
            <p className="font-mono text-sm text-white/40">Aradığınız kriterde eser bulunamadı.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredArtworks.map((art) => {
              const origIdx = art.originalIndex;
              const isFirst = origIdx === 0;
              const isLast = origIdx === artworks.length - 1;

              return (
                <div
                  key={art.id || origIdx}
                  className={`group relative rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden bg-[#181920] ${
                    editingIdx === origIdx
                      ? "border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.35)] ring-2 ring-rose-500/40"
                      : "border-white/10 hover:border-white/30 hover:shadow-lg"
                  }`}
                >
                  {/* Card Header Info & Rank Badge */}
                  <div className="p-2.5 pb-1.5 flex items-center justify-between gap-1 z-10">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-white/90">
                      #{origIdx + 1}
                    </span>

                    <div className="flex items-center gap-1">
                      {art.featuredInMonthly && (
                        <span className="text-[11px]" title="Ayın Tuvali">
                          🔥
                        </span>
                      )}
                      {art.featuredInSpotlight && (
                        <span className="text-[11px]" title="Öne Çıkan Vitrin">
                          🏆
                        </span>
                      )}
                      {art.likes > 0 && (
                        <span className="font-mono text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                          <Heart size={10} className="fill-amber-400" /> {art.likes}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail Image — Click to Edit */}
                  <div
                    onClick={() => setEditingIdx(origIdx)}
                    className="relative aspect-[3/4] mx-2.5 rounded-xl overflow-hidden bg-black/40 border border-white/5 cursor-pointer group/thumb"
                    title="Düzenlemek için tıklayın"
                  >
                    {art.image ? (
                      <img
                        src={art.image}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white/30 gap-1 text-[11px] font-mono">
                        <Upload size={18} />
                        <span>Görselsiz</span>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 text-xs font-mono">
                      <Edit3 size={16} className="text-rose-400" />
                      <span className="font-semibold text-[11px]">Düzenle</span>
                    </div>
                  </div>

                  {/* Title & Medium */}
                  <div
                    onClick={() => setEditingIdx(origIdx)}
                    className="p-2.5 pt-2 cursor-pointer"
                  >
                    <h4 className="font-sans font-medium text-xs text-white/90 truncate group-hover:text-rose-300 transition-colors">
                      {art.title || "İsimsiz Eser"}
                    </h4>
                    <p className="font-mono text-[10px] text-white/50 truncate mt-0.5">
                      {art.year || "2026"} {art.medium ? `· ${art.medium}` : ""}
                    </p>
                  </div>

                  {/* Reorder Buttons (Sıralama Kontrolleri) */}
                  <div className="p-2 pt-1 border-t border-white/5 bg-black/20 flex items-center justify-between gap-1">
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={() => moveItem(origIdx, 0)}
                      title="En Başa Al"
                      className="p-1 rounded text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
                    >
                      <ChevronsLeft size={13} />
                    </button>
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={() => moveItem(origIdx, origIdx - 1)}
                      title="1 Sıra Öne Al (Sola Kaydır)"
                      className="flex-1 py-1 px-1.5 rounded text-[10px] font-mono font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/15 disabled:opacity-20 disabled:hover:bg-transparent flex items-center justify-center gap-0.5 cursor-pointer"
                    >
                      <ChevronLeft size={12} /> Öne
                    </button>
                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => moveItem(origIdx, origIdx + 1)}
                      title="1 Sıra Arkaya Al (Sağa Kaydır)"
                      className="flex-1 py-1 px-1.5 rounded text-[10px] font-mono font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/15 disabled:opacity-20 disabled:hover:bg-transparent flex items-center justify-center gap-0.5 cursor-pointer"
                    >
                      Sonra <ChevronRight size={12} />
                    </button>
                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => moveItem(origIdx, artworks.length - 1)}
                      title="En Sona Al"
                      className="p-1 rounded text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
                    >
                      <ChevronsRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── 4. ESER DETAYLI DÜZENLEME MODALI (POPUP EDITOR) ─── */}
      {currentEditingArt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#181922] border border-white/15 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  #{editingIdx + 1}
                </span>
                <h3 className="font-display text-lg sm:text-xl text-white font-bold">
                  {currentEditingArt.title || "Yeni Eser"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setEditingIdx(null)}
                className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Kapat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-5">
              {/* Image and Upload Controls */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
                <div
                  onClick={() => {
                    if (currentEditingArt.image) {
                      setAdjustState({
                        isOpen: true,
                        imageUrl: currentEditingArt.image,
                        targetIdx: editingIdx,
                      });
                    } else {
                      setAddingIdx(editingIdx);
                      fileInputRef.current?.click();
                    }
                  }}
                  className="group/frame relative w-32 h-32 rounded-2xl border-2 border-dashed border-white/20 hover:border-rose-500/60 cursor-pointer overflow-hidden flex items-center justify-center bg-black/40 transition-all shadow-md shrink-0"
                >
                  {currentEditingArt.image ? (
                    <>
                      <img
                        src={currentEditingArt.image}
                        alt={currentEditingArt.title}
                        className="w-full h-full object-cover group-hover/frame:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/55 opacity-0 group-hover/frame:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-mono gap-1">
                        <Scissors size={15} className="text-rose-400" />
                        <span>Kırp / Hizala</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-white/40 gap-1">
                      <Upload size={22} />
                      <span className="text-[10px]">Görsel Seç</span>
                    </div>
                  )}

                  {uploading[editingIdx] && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-center sm:text-left flex-1">
                  <h4 className="font-mono text-xs font-semibold text-white/90">
                    Eser Fotoğrafı
                  </h4>
                  <p className="text-[11px] text-white/50">
                    Yüksek çözünürlüklü dikey veya kare görsel yükleyebilirsiniz.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAddingIdx(editingIdx);
                        fileInputRef.current?.click();
                      }}
                      className="text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-500/20 border border-rose-500/40 px-3 py-1.5 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Upload size={12} /> Görsel Yükle
                    </button>
                    {currentEditingArt.image && (
                      <button
                        type="button"
                        onClick={() =>
                          setAdjustState({
                            isOpen: true,
                            imageUrl: currentEditingArt.image,
                            targetIdx: editingIdx,
                          })
                        }
                        className="text-xs text-white/70 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Scissors size={12} /> Kırp / Hizala
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Eser Adı">
                  <TextInput
                    value={currentEditingArt.title}
                    onChange={(v) => updateArtwork(editingIdx, "title", v)}
                    placeholder="Örn: Ağustos Rüzgarı"
                  />
                </Field>

                <Field label="Yıl">
                  <TextInput
                    value={currentEditingArt.year}
                    onChange={(v) => updateArtwork(editingIdx, "year", v)}
                    placeholder="2026"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Teknik / Materyal">
                  <TextInput
                    value={currentEditingArt.medium}
                    onChange={(v) => updateArtwork(editingIdx, "medium", v)}
                    placeholder="Örn: Yağlı Boya & Altın Varak"
                  />
                </Field>

                <Field label="Beğeni Sayısı">
                  <TextInput
                    type="number"
                    value={currentEditingArt.likes || 0}
                    onChange={(v) =>
                      updateArtwork(editingIdx, "likes", parseInt(v, 10) || 0)
                    }
                    placeholder="0"
                  />
                </Field>
              </div>

              {/* Showcase Toggles (Ayın Tuvali & Spotlight) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={!!currentEditingArt.featuredInMonthly}
                    onChange={(e) =>
                      updateArtwork(editingIdx, "featuredInMonthly", e.target.checked)
                    }
                    className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500 bg-white/10 border-white/20 cursor-pointer"
                  />
                  <div>
                    <span className="font-mono text-xs font-semibold text-white/90 flex items-center gap-1.5">
                      🔥 Ayın Tuvalinde Göster
                    </span>
                    <span className="font-sans text-[10px] text-white/50 block">
                      Üstteki yatay kaydırma şeridinde yer alır
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={!!currentEditingArt.featuredInSpotlight}
                    onChange={(e) =>
                      updateArtwork(editingIdx, "featuredInSpotlight", e.target.checked)
                    }
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-white/10 border-white/20 cursor-pointer"
                  />
                  <div>
                    <span className="font-mono text-xs font-semibold text-white/90 flex items-center gap-1.5">
                      🏆 Öne Çıkanlarda Göster
                    </span>
                    <span className="font-sans text-[10px] text-white/50 block">
                      En üstteki Spotlight vitrininde gösterilir (Maks 5)
                    </span>
                  </div>
                </label>
              </div>

              {/* Artist Note */}
              <Field label="Sanatçı Notu / Eser Hikâyesi">
                <TextArea
                  rows={3}
                  value={currentEditingArt.note || ""}
                  onChange={(v) => updateArtwork(editingIdx, "note", v)}
                  placeholder="Bu eser hakkında duygu, düşünce veya teknik arka plan..."
                />
              </Field>

              {/* Sequence Reordering in Modal */}
              <div className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between gap-3">
                <span className="font-mono text-xs text-white/60">
                  Sırayı Değiştir:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={editingIdx === 0}
                    onClick={() => moveItem(editingIdx, 0)}
                    className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-30 cursor-pointer"
                  >
                    En Başa
                  </button>
                  <button
                    type="button"
                    disabled={editingIdx === 0}
                    onClick={() => moveItem(editingIdx, editingIdx - 1)}
                    className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-30 flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft size={12} /> 1 Öne
                  </button>
                  <button
                    type="button"
                    disabled={editingIdx === artworks.length - 1}
                    onClick={() => moveItem(editingIdx, editingIdx + 1)}
                    className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-30 flex items-center gap-1 cursor-pointer"
                  >
                    1 Arkaya <ChevronRight size={12} />
                  </button>
                  <button
                    type="button"
                    disabled={editingIdx === artworks.length - 1}
                    onClick={() => moveItem(editingIdx, artworks.length - 1)}
                    className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-30 cursor-pointer"
                  >
                    En Sona
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => removeArtwork(editingIdx)}
                className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 size={14} /> Bu Eseri Sil
              </button>

              <button
                type="button"
                onClick={() => setEditingIdx(null)}
                className="text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check size={14} /> Tamamla & Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Görsel Kırpma & Hizalama Modalı (z-[100] ile tüm pencerelerin en üstünde açılır) */}
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
    </div>
  );
}
