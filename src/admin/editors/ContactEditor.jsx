import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Upload, Scissors } from "lucide-react";
import { useContact } from "../../hooks/useContent";
import { setContent } from "../../lib/firestore";
import { uploadToCloudinary } from "../../lib/cloudinary";
import ImageAdjustModal from "../components/ImageAdjustModal";
import {
  EditorHeader, SectionTitle, Field, TextInput, TextArea, Card, SaveButton, ConfirmModal,
} from "../components/AdminUI";

export default function ContactEditor() {
  const { data, loading } = useContact();
  const [form, setForm] = useState(null);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [uploading, setUploading] = useState({});
  const fileInputRef = useRef();
  const [addingIdx, setAddingIdx] = useState(null);
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
    if (data && !form) {
      setForm({
        title: data.title || "Birlikte bir şey",
        titleHighlight: data.titleHighlight || "inşa edelim.",
        subtitle:
          data.subtitle ||
          "İster bir tablo siparişi, ister bir yapay zeka projesi, ister sadece merhaba demek için — kapım açık. Tuval kadar net, kod kadar titiz bir iş birliği için yaz.",
        ctaText: data.ctaText || "E-POSTA GÖNDER",
        address: data.address || "İstanbul, Türkiye",
        artworks: data.artworks || [],
      });
    }
  }, [data, form]);

  const save = async () => {
    setSaveStatus("saving");
    try {
      await setContent("contact", form);
      localStorage.setItem("portfolio_cache_contact", JSON.stringify(form));
      window.dispatchEvent(new Event("portfolio_content_updated"));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const updateArtwork = (idx, key, value) => {
    setForm((prev) => {
      const artworks = [...prev.artworks];
      artworks[idx] = { ...artworks[idx], [key]: value };
      return { ...prev, artworks };
    });
  };

  const addArtwork = () => {
    const newArt = {
      id: `ca-${Date.now()}`,
      title: "",
      year: new Date().getFullYear().toString(),
      medium: "",
      image: "",
    };
    setForm((prev) => ({
      ...prev,
      artworks: [...prev.artworks, newArt],
    }));
  };

  const removeArtwork = (idx) => {
    setConfirmDelete({
      isOpen: true,
      targetIdx: idx,
      title: form.artworks[idx]?.title ? `"${form.artworks[idx].title}"` : "Bu görseli",
    });
  };

  const confirmRemove = () => {
    const idx = confirmDelete.targetIdx;
    setForm((prev) => ({
      ...prev,
      artworks: prev.artworks.filter((_, i) => i !== idx),
    }));
    setConfirmDelete({ isOpen: false, targetIdx: null, title: "" });
  };

  const uploadImage = async (idx, file) => {
    if (!file) return;
    setUploading((prev) => ({ ...prev, [idx]: true }));
    try {
      const url = await uploadToCloudinary(file, "contact");
      updateArtwork(idx, "image", url);
    } catch (err) {
      console.error("Yükleme hatası:", err);
    } finally {
      setUploading((prev) => ({ ...prev, [idx]: false }));
    }
  };

  if (loading || !form) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-7 max-w-5xl mx-auto text-white">
      <EditorHeader
        title="İletişim Sayfası"
        subtitle="Başlıklar, metinler ve arka planda rastgele değişen görseller"
        saveStatus={saveStatus}
        onSave={save}
      />

      {/* Image Adjust Modal */}
      <ImageAdjustModal
        isOpen={adjustState.isOpen}
        onClose={() => setAdjustState((prev) => ({ ...prev, isOpen: false }))}
        imageUrl={adjustState.imageUrl}
        title="İletişim Görseli Kırp & Büyüt"
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

      {/* Sayfa Metinleri */}
      <Card>
        <SectionTitle>Başlık & Metin Düzenleme</SectionTitle>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Sayfa Başlığı (İlk Kısım)">
            <TextInput
              value={form.title}
              onChange={(v) => setField("title", v)}
              placeholder="Birlikte bir şey"
            />
          </Field>
          <Field label="Vurgulu Başlık (Renkli Kısım)">
            <TextInput
              value={form.titleHighlight}
              onChange={(v) => setField("titleHighlight", v)}
              placeholder="inşa edelim."
            />
          </Field>
          <Field label="Buton Metni (CTA)">
            <TextInput
              value={form.ctaText}
              onChange={(v) => setField("ctaText", v)}
              placeholder="E-POSTA GÖNDER"
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Alt Açıklama (Subtitle)">
            <TextArea
              value={form.subtitle}
              onChange={(v) => setField("subtitle", v)}
              rows={3}
            />
          </Field>
        </div>
      </Card>

      {/* Rastgele Arka Plan Görselleri */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>Rastgele Arka Plan Görselleri (Contact Artworks)</SectionTitle>
          <button
            onClick={addArtwork}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 border border-rose-500/30 rounded-lg px-3 py-1.5 transition-colors cursor-pointer"
          >
            <Plus size={13} /> Yeni Görsel Ekle
          </button>
        </div>

        <p className="text-xs text-white/50 mb-4">
          <strong className="text-white/80">"Görsel Yükle"</strong> ile yeni resim ekleyin, <strong className="text-white/80">çerçeveye tıklayarak</strong> görseli kırpın ve yakınlaştırın!
        </p>

        <div className="space-y-4">
          {form.artworks.map((art, idx) => (
            <div
              key={art.id || idx}
              className="bg-white/[0.03] border border-white/8 rounded-lg p-4 flex items-start gap-5"
            >
              {/* Resim Yükle / Önizleme / Kırpma Çerçevesi */}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div
                  className="group/frame relative w-24 h-24 rounded-xl border-2 border-dashed border-white/20 hover:border-rose-500/60 cursor-pointer overflow-hidden flex items-center justify-center bg-white/[0.03] transition-all shadow-md"
                  onClick={() => {
                    if (art.image) {
                      setAdjustState({ isOpen: true, imageUrl: art.image, targetIdx: idx });
                    } else {
                      setAddingIdx(idx);
                      fileInputRef.current?.click();
                    }
                  }}
                  title="Görseli kırpmak ve büyütmek için çerçeveye tıklayın"
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
                        <span>Kırp & Büyüt</span>
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

                {/* Yükle / Kırp Butonları */}
                <div className="flex flex-col gap-1 items-center">
                  <button
                    type="button"
                    onClick={() => { setAddingIdx(idx); fileInputRef.current?.click(); }}
                    className="text-[10px] text-rose-300 hover:text-rose-200 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <Upload size={10} /> Görsel Yükle
                  </button>
                  {art.image && (
                    <button
                      type="button"
                      onClick={() => setAdjustState({ isOpen: true, imageUrl: art.image, targetIdx: idx })}
                      className="text-[9px] text-white/50 hover:text-white transition-colors cursor-pointer"
                    >
                      ✂️ Kırp / Büyüt
                    </button>
                  )}
                </div>
              </div>

              {/* Detaylar */}
              <div className="flex-1 grid grid-cols-2 gap-3">
                <Field label="Eser Başlığı">
                  <TextInput
                    value={art.title}
                    onChange={(v) => updateArtwork(idx, "title", v)}
                    placeholder="Derin Öğrenme Katmanları"
                  />
                </Field>
                <Field label="Yıl">
                  <TextInput
                    value={art.year}
                    onChange={(v) => updateArtwork(idx, "year", v)}
                    placeholder="2026"
                  />
                </Field>
                <div className="col-span-2">
                  <Field label="Teknik / Detay">
                    <TextInput
                      value={art.medium}
                      onChange={(v) => updateArtwork(idx, "medium", v)}
                      placeholder="Tuval üzerine akrilik ve dijital müdahale"
                    />
                  </Field>
                </div>
              </div>

              <button
                onClick={() => removeArtwork(idx)}
                className="text-white/20 hover:text-rose-400 p-2 transition-colors cursor-pointer"
                title="Görseli Sil"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Tatlı Silme Onay Modalı */}
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() =>
          setConfirmDelete({ isOpen: false, targetIdx: null, title: "" })
        }
        onConfirm={confirmRemove}
        title="Bu Görseli Silmek İstiyor musunuz?"
        description={`${confirmDelete.title} iletişim sayfası arka plan vitrininden tamamen kaldırılacaktır.`}
        confirmText="Evet, Sil"
        variant="danger"
      />
    </div>
  );
}
