import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Upload, Scissors } from "lucide-react";
import { useTimeline } from "../../hooks/useContent";
import { setContent } from "../../lib/firestore";
import { uploadToCloudinary } from "../../lib/cloudinary";
import ImageAdjustModal from "../components/ImageAdjustModal";
import {
  EditorHeader, Field, TextInput, Card, SaveButton,
} from "../components/AdminUI";

export default function TimelineEditor() {
  const { data, loading } = useTimeline();
  const [images, setImages] = useState([]);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [uploading, setUploading] = useState({});
  const fileRef = useRef();
  const [pendingIdx, setPendingIdx] = useState(null);

  // Image adjust modal state
  const [adjustState, setAdjustState] = useState({
    isOpen: false,
    imageUrl: "",
    targetIdx: null,
  });

  useEffect(() => {
    if (data && images.length === 0) {
      setImages(data.images || []);
    }
  }, [data]);

  const save = async () => {
    setSaveStatus("saving");
    try {
      const payload = { images };
      await setContent("timeline", payload);
      localStorage.setItem("portfolio_cache_timeline", JSON.stringify(payload));
      window.dispatchEvent(new Event("portfolio_content_updated"));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const addSlot = () => {
    setImages((prev) => [
      ...prev,
      { id: `tl-${Date.now()}`, url: "", year: new Date().getFullYear().toString(), caption: "" },
    ]);
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateImage = (idx, key, value) => {
    setImages((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });
  };

  const uploadImage = async (idx, file) => {
    if (!file) return;
    setUploading((prev) => ({ ...prev, [idx]: true }));
    try {
      const url = await uploadToCloudinary(file, "timeline");
      updateImage(idx, "url", url);
    } catch (err) {
      console.error(err);
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
        title="Zaman Yolculuğu"
        subtitle="Akış şeklinde görüntülenen kişisel ve sanatsal fotoğraflar"
        saveStatus={saveStatus}
        onSave={save}
      />

      <input
        ref={fileRef}
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

      <div className="flex justify-between items-center">
        <p className="text-xs text-white/50">
          <strong className="text-white/80">"Görsel Yükle"</strong> ile yeni fotoğraf ekleyin, <strong className="text-white/80">çerçeveye tıklayarak</strong> kırpın!
        </p>

        <button
          onClick={addSlot}
          className="flex items-center gap-2 text-sm text-rose-400 hover:text-rose-300 border border-rose-500/30 rounded-lg px-4 py-2 transition-colors cursor-pointer"
        >
          <Plus size={15} /> Görsel Ekle
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {images.map((img, idx) => (
          <Card key={img.id || idx} className="space-y-3">
            {/* Görsel önizleme / kırpma çerçevesi */}
            <div
              className="group/frame relative aspect-[4/3] rounded-xl border-2 border-dashed border-white/20 hover:border-rose-500/60 cursor-pointer overflow-hidden flex items-center justify-center bg-white/[0.03] transition-all shadow-md"
              onClick={() => {
                if (img.url) {
                  setAdjustState({ isOpen: true, imageUrl: img.url, targetIdx: idx });
                } else {
                  setPendingIdx(idx);
                  fileRef.current?.click();
                }
              }}
              title="Görseli kırpmak için çerçeveye tıklayın"
            >
              {img.url ? (
                <>
                  <img src={img.url} alt={img.caption} className="w-full h-full object-cover group-hover/frame:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/55 opacity-0 group-hover/frame:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-mono gap-1">
                    <Scissors size={16} className="text-rose-400" />
                    <span>Hizala & Kırp</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-white/30">
                  <Upload size={22} />
                  <span className="text-xs">Tıkla & yükle</span>
                </div>
              )}
              {uploading[idx] && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => { setPendingIdx(idx); fileRef.current?.click(); }}
                className="text-[10px] text-rose-300 hover:text-rose-200 bg-rose-500/15 border border-rose-500/30 px-2.5 py-1 rounded transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                <Upload size={10} /> Görsel Yükle
              </button>
              {img.url && (
                <button
                  type="button"
                  onClick={() => setAdjustState({ isOpen: true, imageUrl: img.url, targetIdx: idx })}
                  className="text-[10px] text-white/50 hover:text-white transition-colors cursor-pointer"
                >
                  ✂️ Kırp & Hizala
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Field label="Yıl / Dönem">
                <TextInput value={img.year} onChange={(v) => updateImage(idx, "year", v)} placeholder="2026" />
              </Field>
              <Field label="Açıklama">
                <TextInput value={img.caption} onChange={(v) => updateImage(idx, "caption", v)} placeholder="Kısa not…" />
              </Field>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => removeImage(idx)}
                className="flex items-center gap-1.5 text-xs text-white/30 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <Trash2 size={12} /> Kaldır
              </button>
            </div>
          </Card>
        ))}
      </div>

      {images.length === 0 && (
        <div className="border-2 border-dashed border-white/10 rounded-xl p-12 flex flex-col items-center gap-3 text-white/30">
          <Upload size={28} />
          <p className="text-sm">Henüz görsel eklenmedi. "Görsel Ekle" butonuna tıklayın.</p>
        </div>
      )}

      {/* Görsel Kırpma & Hizalama Modalı */}
      <ImageAdjustModal
        isOpen={adjustState.isOpen}
        onClose={() => setAdjustState((prev) => ({ ...prev, isOpen: false }))}
        imageUrl={adjustState.imageUrl}
        title="Zaman Yolculuğu Görseli Kırp & Hizala"
        onSave={(newUrl) => {
          if (adjustState.targetIdx !== null) {
            updateImage(adjustState.targetIdx, "url", newUrl);
          }
        }}
      />
    </div>
  );
}
