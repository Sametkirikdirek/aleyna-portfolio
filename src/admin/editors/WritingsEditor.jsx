import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Upload } from "lucide-react";
import { useWritings } from "../../hooks/useContent";
import { setContent } from "../../lib/firestore";
import { uploadToCloudinary } from "../../lib/cloudinary";
import {
  EditorHeader, Field, TextInput, TextArea, Card, SaveButton,
} from "../components/AdminUI";

export default function WritingsEditor() {
  const { data, loading } = useWritings();
  const [writings, setWritings] = useState([]);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [openIdx, setOpenIdx] = useState(null);
  const [uploading, setUploading] = useState({});
  const fileInputRef = useRef();
  const [pendingIdx, setPendingIdx] = useState(null);

  useEffect(() => {
    if (data && writings.length === 0) {
      setWritings(data.personalWritings || []);
    }
  }, [data]);

  const save = async () => {
    setSaveStatus("saving");
    try {
      await setContent("writings", { personalWritings: writings });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
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
    setWritings((prev) => prev.filter((_, i) => i !== idx));
    setOpenIdx(null);
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
        title="Yazılarım & Kütüphane"
        subtitle="Kişisel yazılar, kapak görselleri ve okuma detayları"
        saveStatus={saveStatus}
        onSave={save}
      />

      <div className="flex justify-end">
        <button
          onClick={addWriting}
          className="flex items-center gap-2 text-sm text-rose-400 hover:text-rose-300 border border-rose-500/30 rounded-lg px-4 py-2 transition-colors cursor-pointer"
        >
          <Plus size={15} /> Yeni Yazı Ekle
        </button>
      </div>

      <div className="space-y-3">
        {writings.map((w, idx) => (
          <div key={w.id} className="bg-white/[0.03] border border-white/8 rounded-xl overflow-hidden">
            <div
              className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-white/[0.03] transition-colors"
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
            >
              <div className="flex items-center gap-3">
                {w.tag && (
                  <span className="text-[10px] bg-rose-500/15 text-rose-400 border border-rose-500/25 px-2 py-0.5 rounded-full">
                    {w.tag}
                  </span>
                )}
                <span className="text-sm font-medium text-white/80">{w.title || "Yeni Yazı"}</span>
                {w.date && <span className="text-white/30 text-xs">{w.date}</span>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); remove(idx); }}
                  className="text-white/20 hover:text-rose-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
                {openIdx === idx ? <ChevronUp size={15} className="text-white/40" /> : <ChevronDown size={15} className="text-white/40" />}
              </div>
            </div>

            {openIdx === idx && (
              <div className="px-4 pb-5 border-t border-white/8 pt-4 space-y-4">
                {/* Kapak Görseli Yükleme */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-24 h-16 rounded-lg border-2 border-dashed border-white/15 hover:border-rose-500/50 cursor-pointer overflow-hidden flex items-center justify-center bg-white/[0.03] transition-colors relative shrink-0"
                    onClick={() => {
                      setPendingIdx(idx);
                      fileInputRef.current?.click();
                    }}
                  >
                    {w.image ? (
                      <img src={w.image} alt={w.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-white/30">
                        <Upload size={16} />
                        <span className="text-[10px] mt-0.5">Kapak Foto</span>
                      </div>
                    )}
                    {uploading[idx] && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/80">Kütüphane Kapak Görseli</p>
                    <p className="text-xs text-white/40">Kütüphane sekmesinde kartın üzerinde görünecek resim.</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <Field label="Başlık">
                    <TextInput value={w.title} onChange={(v) => update(idx, "title", v)} />
                  </Field>
                  <Field label="Etiket">
                    <TextInput value={w.tag} onChange={(v) => update(idx, "tag", v)} placeholder="Atölye / Sanat / Düşünce" />
                  </Field>
                  <Field label="Tarih">
                    <TextInput value={w.date} onChange={(v) => update(idx, "date", v)} placeholder="Haz 2026" />
                  </Field>
                  <Field label="Okuma Süresi">
                    <TextInput value={w.readTime} onChange={(v) => update(idx, "readTime", v)} placeholder="4 dk" />
                  </Field>
                </div>

                <Field label="Özet / Liste Görünümü (Konusu)">
                  <TextArea value={w.excerpt} onChange={(v) => update(idx, "excerpt", v)} rows={2} />
                </Field>

                <Field label="Tam Yazı İçeriği (Pop-up Detayı ve Okuma Sayfası)">
                  <TextArea
                    value={w.content || ""}
                    onChange={(v) => update(idx, "content", v)}
                    rows={6}
                    placeholder="Pop-up penceresinde ve okuma sayfasında görünecek tam metin…"
                  />
                </Field>

                <Field label="Harici Link (opsiyonel - doldurulursa harici sekmeye yönlendirir)">
                  <TextInput value={w.url || ""} onChange={(v) => update(idx, "url", v)} placeholder="https://medium.com/..." />
                </Field>
              </div>
            )}
          </div>
        ))}
      </div>

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

      <div className="flex justify-end">
        <SaveButton status={saveStatus} onClick={save} />
      </div>
    </div>
  );
}
