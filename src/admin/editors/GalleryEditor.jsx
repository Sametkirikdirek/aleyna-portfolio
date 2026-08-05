import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Upload } from "lucide-react";
import { useGallery } from "../../hooks/useContent";
import { setContent } from "../../lib/firestore";
import { uploadToCloudinary } from "../../lib/cloudinary";
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

  useEffect(() => {
    if (data && artworks.length === 0) {
      setArtworks(data.artworks || []);
    }
  }, [data]);

  const save = async () => {
    setSaveStatus("saving");
    try {
      await setContent("gallery", { artworks });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const updateArtwork = (idx, key, value) => {
    setArtworks((prev) => {
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
    };
    setArtworks((prev) => [...prev, newArt]);
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
    <div className="space-y-7 max-w-5xl mx-auto">
      <EditorHeader
        title="Galeri"
        subtitle="Tablolar ve sanat eserleri"
        saveStatus={saveStatus}
        onSave={save}
      />

      <div className="flex justify-end">
        <button
          onClick={addArtwork}
          className="flex items-center gap-2 text-sm text-rose-400 hover:text-rose-300 border border-rose-500/30 rounded-lg px-4 py-2 transition-colors"
        >
          <Plus size={15} /> Yeni Eser Ekle
        </button>
      </div>

      <div className="space-y-4">
        {artworks.map((art, idx) => (
          <Card key={art.id} className="group">
            <div className="flex items-start gap-4">
              {/* Resim önizleme / yükleme */}
              <div className="shrink-0">
                <div
                  className="w-20 h-20 rounded-lg border-2 border-dashed border-white/15 hover:border-rose-500/50 cursor-pointer overflow-hidden flex items-center justify-center bg-white/[0.03] transition-colors relative"
                  onClick={() => { setAddingIdx(idx); fileInputRef.current?.click(); }}
                >
                  {art.image ? (
                    <img
                      src={art.image}
                      alt={art.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  ) : (
                    <Upload size={18} className="text-white/30" />
                  )}
                  {uploading[idx] && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <p className="text-white/30 text-[10px] text-center mt-1">Tıkla & yükle</p>
              </div>

              {/* Bilgiler */}
              <div className="flex-1 grid grid-cols-2 gap-3">
                <Field label="Eser Adı">
                  <TextInput value={art.title} onChange={(v) => updateArtwork(idx, "title", v)} />
                </Field>
                <Field label="Yıl">
                  <TextInput value={art.year} onChange={(v) => updateArtwork(idx, "year", v)} placeholder="2024" />
                </Field>
                <Field label="Teknik">
                  <TextInput value={art.medium} onChange={(v) => updateArtwork(idx, "medium", v)} placeholder="Yağlı Boya" />
                </Field>
              </div>

              {/* Sil */}
              <button
                onClick={() => removeArtwork(idx)}
                className="text-white/20 hover:text-rose-400 transition-colors mt-1"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Not */}
            <div className="mt-3">
              <Field label="Not / Açıklama">
                <TextArea value={art.note} onChange={(v) => updateArtwork(idx, "note", v)} rows={2} />
              </Field>
            </div>
          </Card>
        ))}
      </div>

      {/* Gizli file input */}
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

      <div className="flex justify-end">
        <SaveButton status={saveStatus} onClick={save} />
      </div>
    </div>
  );
}
