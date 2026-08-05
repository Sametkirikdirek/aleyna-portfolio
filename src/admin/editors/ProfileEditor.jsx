import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Upload } from "lucide-react";
import { useProfile } from "../../hooks/useContent";
import { setContent } from "../../lib/firestore";
import { uploadToCloudinary } from "../../lib/cloudinary";
import {
  EditorHeader, SectionTitle, Field, TextInput, TextArea, Card, SaveButton,
} from "../components/AdminUI";

export default function ProfileEditor() {
  const { data, loading } = useProfile();
  const [form, setForm] = useState(null);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [openExp, setOpenExp] = useState(null);
  const [uploading, setUploading] = useState({});
  const fileInputRef = useRef();
  const [pendingCardIdx, setPendingCardIdx] = useState(null);

  useEffect(() => {
    if (data && !form) {
      setForm({
        name: data.name || "",
        avatar: data.avatar || "",
        tagline: data.tagline || "",
        bio: data.bio || "",
        location: data.location || "",
        email: data.email || "",
        philosophy: data.philosophy || "",
        social: {
          medium: data.social?.medium || "",
          github: data.social?.github || "",
          linkedin: data.social?.linkedin || "",
          instagram: data.social?.instagram || "",
        },
        heroCards: data.heroCards || [],
        extendedBio: data.extendedBio || [],
        roles: data.roles || [],
        experiences: data.experiences || [],
        skills: data.skills || [],
      });
    }
  }, [data, form]);

  const save = async () => {
    setSaveStatus("saving");
    try {
      await setContent("profile", form);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const setSocial = (key, value) =>
    setForm((prev) => ({ ...prev, social: { ...prev.social, [key]: value } }));

  const updateExp = (idx, key, value) =>
    setForm((prev) => {
      const experiences = [...prev.experiences];
      experiences[idx] = { ...experiences[idx], [key]: value };
      return { ...prev, experiences };
    });

  const addExp = () =>
    setForm((prev) => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        { id: `exp-${Date.now()}`, role: "", company: "", location: "", period: "", type: "", description: "", highlights: [], technologies: [] },
      ],
    }));

  const removeExp = (idx) =>
    setForm((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== idx),
    }));

  const updateHeroCard = (idx, key, value) => {
    setForm((prev) => {
      const heroCards = [...prev.heroCards];
      heroCards[idx] = { ...heroCards[idx], [key]: value };
      return { ...prev, heroCards };
    });
  };

  const addHeroCard = () => {
    setForm((prev) => ({
      ...prev,
      heroCards: [
        ...prev.heroCards,
        { imgUrl: "", title: "", linkUrl: "/gallery" },
      ],
    }));
  };

  const removeHeroCard = (idx) => {
    setForm((prev) => ({
      ...prev,
      heroCards: prev.heroCards.filter((_, i) => i !== idx),
    }));
  };

  const uploadHeroImage = async (idx, file) => {
    if (!file) return;
    setUploading((prev) => ({ ...prev, [idx]: true }));
    try {
      const url = await uploadToCloudinary(file, "hero");
      updateHeroCard(idx, "imgUrl", url);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading((prev) => ({ ...prev, [idx]: false }));
    }
  };

  const uploadAvatar = async (file) => {
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const url = await uploadToCloudinary(file, "profile");
      setField("avatar", url);
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingAvatar(false);
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
    <div className="space-y-7 max-w-5xl mx-auto">
      <EditorHeader
        title="Anasayfa & Hakkımda"
        subtitle="Profil bilgileri, profil fotoğrafı, yelpaze görselleri, biyografi ve deneyimler"
        saveStatus={saveStatus}
        onSave={save}
      />

      {/* Image Adjust Modal */}
      <ImageAdjustModal
        isOpen={adjustState.isOpen}
        onClose={() => setAdjustState((prev) => ({ ...prev, isOpen: false }))}
        imageUrl={adjustState.imageUrl}
        aspectRatio={adjustState.aspectRatio}
        title={adjustState.title}
        onSave={(newCroppedUrl) => {
          if (adjustState.targetType === "avatar") {
            setField("avatar", newCroppedUrl);
          } else if (adjustState.targetType === "heroCard" && adjustState.targetIdx !== null) {
            updateHeroCard(adjustState.targetIdx, "imgUrl", newCroppedUrl);
          }
        }}
      />

      {/* Temel Bilgiler & Profil Fotoğrafı */}
      <Card>
        <SectionTitle>Temel Bilgiler & Profil Fotoğrafı (Avatar)</SectionTitle>
        <div className="flex flex-col md:flex-row gap-6 items-start mb-6 pb-6 border-b border-white/8">
          {/* Avatar Çerçevesi (Tıklanınca Fotoğraf Ayarlama Modalı Açılır) */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="group relative w-28 h-44 rounded-full border-2 border-rose-500/40 hover:border-rose-400 cursor-pointer overflow-hidden flex flex-col items-center justify-center bg-white/[0.03] transition-all shadow-xl hover:shadow-[0_0_25px_rgba(244,63,94,0.35)]"
              onClick={() => {
                if (form.avatar) {
                  openAdjustModal(form.avatar, "avatar", null, "capsule", "Profil Fotoğrafı Hizala & Kırp");
                } else {
                  avatarInputRef.current?.click();
                }
              }}
              title="Kırpmak ve hizalamak için çerçeveye tıklayın"
            >
              {form.avatar ? (
                <>
                  <img src={form.avatar} alt={form.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-mono gap-1">
                    <span>✂️ Hizala & Kırp</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-white/40 text-center p-2">
                  <Upload size={20} />
                  <span className="text-[10px] mt-1">Yükle</span>
                </div>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <span className="text-[10px] text-rose-300/80 font-mono">Çerçeveye Tıkla: Hizala ✂️</span>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-white/90">Anasayfa Profil Fotoğrafı (Rozet Avatar)</p>
            <p className="text-xs text-white/40 leading-relaxed max-w-md">
              <strong className="text-white/80">"Görsel Yükle"</strong> butonuna basarak yeni bir fotoğraf seçebilir, yüklenen <strong className="text-white/80">fotoğraf çerçevesine tıklayarak</strong> fotoğrafı dilediğiniz gibi kırpıp dikey/yatay odak noktalarını ayarlayabilirsiniz!
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="text-xs bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30 rounded-lg px-4 py-2 transition-colors cursor-pointer inline-flex items-center gap-1.5 font-medium"
              >
                <Upload size={14} /> Görsel Yükle
              </button>
              {form.avatar && (
                <button
                  type="button"
                  onClick={() => openAdjustModal(form.avatar, "avatar", null, "capsule", "Profil Fotoğrafı Hizala & Kırp")}
                  className="text-xs bg-white/5 text-white/80 hover:bg-white/10 border border-white/15 rounded-lg px-4 py-2 transition-colors cursor-pointer inline-flex items-center gap-1.5 font-medium"
                >
                  ✂️ Fotoğrafı Hizala
                </button>
              )}
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files[0]) uploadAvatar(e.target.files[0]);
                e.target.value = "";
              }}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Field label="İsim">
            <TextInput value={form.name} onChange={(v) => setField("name", v)} />
          </Field>
          <Field label="Konum">
            <TextInput value={form.location} onChange={(v) => setField("location", v)} />
          </Field>
          <Field label="E-posta">
            <TextInput value={form.email} onChange={(v) => setField("email", v)} />
          </Field>
          <Field label="Slogan (Tagline)">
            <TextInput value={form.tagline} onChange={(v) => setField("tagline", v)} />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Roller (virgülle ayırın)">
            <TextInput
              value={form.roles.join(", ")}
              onChange={(v) => setField("roles", v.split(",").map((r) => r.trim()))}
              placeholder="Yapay Zeka Mühendisi, Ressam, Yazar"
            />
          </Field>
        </div>
      </Card>

      {/* Anasayfa Yelpaze Görsel Kartları (Card Fan Carousel) */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>Anasayfa Yelpaze Kartları (Hero Fan Carousel)</SectionTitle>
          <button
            onClick={addHeroCard}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 border border-rose-500/30 rounded-lg px-3 py-1.5 transition-colors cursor-pointer"
          >
            <Plus size={13} /> Yeni Kart Ekle
          </button>
        </div>

        <p className="text-white/40 text-xs mb-4">
          Anasayfanın sağ tarafında 3D yelpaze animasyonuyla sergilenen kartlar.
        </p>

        <div className="space-y-4">
          {form.heroCards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white/[0.03] border border-white/8 rounded-lg p-4 flex items-start gap-4"
            >
              {/* Resim Yükle / Önizleme */}
              <div className="shrink-0">
                <div
                  className="w-20 h-24 rounded-lg border-2 border-dashed border-white/15 hover:border-rose-500/50 cursor-pointer overflow-hidden flex items-center justify-center bg-white/[0.03] transition-colors relative"
                  onClick={() => {
                    setPendingCardIdx(idx);
                    fileInputRef.current?.click();
                  }}
                >
                  {card.imgUrl ? (
                    <img
                      src={card.imgUrl}
                      alt={card.title || `Card ${idx}`}
                      className="w-full h-full object-cover"
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
                <p className="text-white/30 text-[10px] text-center mt-1">Görsel Yükle</p>
              </div>

              {/* Detaylar */}
              <div className="flex-1 grid grid-cols-2 gap-3">
                <Field label="Kart Başlığı / Alt">
                  <TextInput
                    value={card.title || ""}
                    onChange={(v) => updateHeroCard(idx, "title", v)}
                    placeholder="Atölye Günlüğü"
                  />
                </Field>
                <Field label="Yönlendirme Linki">
                  <TextInput
                    value={card.linkUrl || ""}
                    onChange={(v) => updateHeroCard(idx, "linkUrl", v)}
                    placeholder="/gallery veya /ai-work"
                  />
                </Field>
              </div>

              {/* Sil */}
              <button
                onClick={() => removeHeroCard(idx)}
                className="text-white/20 hover:text-rose-400 transition-colors mt-1"
                title="Sil"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Sosyal Medya */}
      <Card>
        <SectionTitle>Sosyal Medya Bağlantıları</SectionTitle>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Medium">
            <TextInput value={form.social.medium} onChange={(v) => setSocial("medium", v)} />
          </Field>
          <Field label="GitHub">
            <TextInput value={form.social.github} onChange={(v) => setSocial("github", v)} />
          </Field>
          <Field label="LinkedIn">
            <TextInput value={form.social.linkedin} onChange={(v) => setSocial("linkedin", v)} />
          </Field>
          <Field label="Instagram">
            <TextInput value={form.social.instagram} onChange={(v) => setSocial("instagram", v)} />
          </Field>
        </div>
      </Card>

      {/* Biyografi */}
      <Card>
        <SectionTitle>Biyografi & Felsefe</SectionTitle>
        <div className="space-y-4">
          <Field label="Kısa Biyografi (Özet)">
            <TextArea value={form.bio} onChange={(v) => setField("bio", v)} rows={3} />
          </Field>
          <Field label="Felsefe (Cümle)">
            <TextInput value={form.philosophy} onChange={(v) => setField("philosophy", v)} />
          </Field>
        </div>
      </Card>

      {/* Gizli file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (pendingCardIdx !== null && e.target.files[0]) {
            uploadHeroImage(pendingCardIdx, e.target.files[0]);
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
