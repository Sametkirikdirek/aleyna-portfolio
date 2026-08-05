import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Upload } from "lucide-react";
import { useTimeline } from "../../hooks/useContent";
import { setContent } from "../../lib/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../lib/firebase";
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

  useEffect(() => {
    if (data && images.length === 0) {
      setImages(data.images || []);
    }
  }, [data]);

  const save = async () => {
    setSaveStatus("saving");
    try {
      await setContent("timeline", { images });
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
      { id: `tl-${Date.now()}`, url: "", year: "", caption: "" },
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
      const storageRef = ref(storage, `timeline/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
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
    <div className="space-y-7 max-w-3xl">
      <EditorHeader
        title="Zaman Yolculuğu"
        subtitle="Akış şeklinde görüntülenen kişisel fotoğraflar"
        saveStatus={saveStatus}
        onSave={save}
      />

      <div className="flex justify-end">
        <button
          onClick={addSlot}
          className="flex items-center gap-2 text-sm text-rose-400 hover:text-rose-300 border border-rose-500/30 rounded-lg px-4 py-2 transition-colors"
        >
          <Plus size={15} /> Görsel Ekle
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {images.map((img, idx) => (
          <Card key={img.id} className="space-y-3">
            {/* Görsel önizleme */}
            <div
              className="aspect-[4/3] rounded-lg border-2 border-dashed border-white/15 hover:border-rose-500/50 cursor-pointer overflow-hidden flex items-center justify-center bg-white/[0.03] transition-colors relative"
              onClick={() => { setPendingIdx(idx); fileRef.current?.click(); }}
            >
              {img.url ? (
                <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-white/30">
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

            <div className="grid grid-cols-2 gap-2">
              <Field label="Yıl / Dönem">
                <TextInput value={img.year} onChange={(v) => updateImage(idx, "year", v)} placeholder="2020" />
              </Field>
              <Field label="Açıklama">
                <TextInput value={img.caption} onChange={(v) => updateImage(idx, "caption", v)} placeholder="Kısa not…" />
              </Field>
            </div>

            <button
              onClick={() => removeImage(idx)}
              className="flex items-center gap-1.5 text-xs text-white/30 hover:text-rose-400 transition-colors"
            >
              <Trash2 size={12} /> Kaldır
            </button>
          </Card>
        ))}
      </div>

      {images.length === 0 && (
        <div className="border-2 border-dashed border-white/10 rounded-xl p-12 flex flex-col items-center gap-3 text-white/30">
          <Upload size={28} />
          <p className="text-sm">Henüz görsel eklenmedi. "Görsel Ekle" butonuna tıklayın.</p>
        </div>
      )}

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

      <div className="flex justify-end">
        <SaveButton status={saveStatus} onClick={save} />
      </div>
    </div>
  );
}
