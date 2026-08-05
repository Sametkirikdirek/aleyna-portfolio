import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Upload, Scissors } from "lucide-react";
import { useWritings } from "../../hooks/useContent";
import { setContent } from "../../lib/firestore";
import { uploadToCloudinary } from "../../lib/cloudinary";
import ImageAdjustModal from "../components/ImageAdjustModal";
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

  // Image adjust modal state
  const [adjustState, setAdjustState] = useState({
    isOpen: false,
    imageUrl: "",
    targetIdx: null,
  });

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
    <div className="space-y-7 max-w-5xl mx-auto text-white">
      <EditorHeader
        title="Yazılarım & Kütüphane"
        subtitle="Kişisel blog yazıları ve kütüphane kapak fotoğrafları"
        saveStatus={saveStatus}
        onSave={save}
      />

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

      <div className="flex justify-between items-center">
        <p className="text-xs text-white/50">
          <strong className="text-white/80">"Görsel Yükle"</strong> ile kapak yükleyin, <strong className="text-white/80">çerçeveye tıklayarak</strong> görseli kırpıp hizalayın!
        </p>

        <button
          onClick={addWriting}
          className="flex items-center gap-2 text-sm text-rose-400 hover:text-rose-300 border border-rose-500/30 rounded-lg px-4 py-2 transition-colors cursor-pointer"
        >
          <Plus size={15} /> Yeni Yazı Ekle
        </button>
      </div>

      <div className="space-y-4">
        {writings.map((w, idx) => (
          <Card key={w.id || idx} className="overflow-hidden">
            <div
              className="flex items-center justify-between cursor-pointer py-1"
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
            >
              <div className="flex items-center gap-3">
                {w.image && (
                  <img src={w.image} alt={w.title} className="w-10 h-10 rounded object-cover" />
                )}
                <div>
                  <p className="font-semibold text-sm text-white/90">{w.title || "Başlıksız Yazı"}</p>
                  <p className="text-xs text-white/40">{w.tag || "Genel"} · {w.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); remove(idx); }}
                  className="text-white/30 hover:text-rose-400 p-1"
                >
                  <Trash2 size={16} />
                </button>
                {openIdx === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </div>

            {openIdx === idx && (
              <div className="px-4 pb-5 border-t border-white/8 pt-4 space-y-4">
                {/* Kapak Görseli Yükleme & Hizalama */}
                <div className="flex items-center gap-5">
                  <div
                    className="group relative w-24 h-24 rounded-xl border-2 border-dashed border-white/20 hover:border-rose-500/60 cursor-pointer overflow-hidden flex flex-col items-center justify-center bg-white/[0.03] transition-all shadow-md shrink-0"
                    onClick={() => {
                      if (w.image) {
                        setAdjustState({ isOpen: true, imageUrl: w.image, targetIdx: idx });
                      } else {
                        setPendingIdx(idx);
                        fileInputRef.current?.click();
                      }
                    }}
                    title="Görseli kırpmak ve hizalamak için çerçeveye tıklayın"
                  >
                    {w.image ? (
                      <>
                        <img src={w.image} alt={w.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-mono gap-1">
                          <Scissors size={14} className="text-rose-400" />
                          <span>Hizala</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-white/30">
                        <Upload size={18} />
                        <span className="text-[10px] mt-0.5">Kapak Foto</span>
                      </div>
                    )}
                    {uploading[idx] && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-white/90">Kütüphane Kapak Görseli</p>
                    <p className="text-xs text-white/40">Kütüphane sekmesinde kitap kartının üzerinde görünecek kapak resmi.</p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => { setPendingIdx(idx); fileInputRef.current?.click(); }}
                        className="text-xs bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30 rounded-lg px-3 py-1.5 transition-colors cursor-pointer inline-flex items-center gap-1.5 font-medium"
                      >
                        <Upload size={13} /> Görsel Yükle
                      </button>
                      {w.image && (
                        <button
                          type="button"
                          onClick={() => setAdjustState({ isOpen: true, imageUrl: w.image, targetIdx: idx })}
                          className="text-xs bg-white/5 text-white/80 hover:bg-white/10 border border-white/15 rounded-lg px-3 py-1.5 transition-colors cursor-pointer inline-flex items-center gap-1.5 font-medium"
                        >
                          ✂️ Fotoğrafı Hizala / Kırp
                        </button>
                      )}
                    </div>
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

                <Field label="Tam Metin (İçerik)">
                  <TextArea value={w.content || ""} onChange={(v) => update(idx, "content", v)} rows={8} placeholder="Yazının tüm metnini buraya girin..." />
                </Field>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
