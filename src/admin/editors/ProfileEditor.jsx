import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Upload, Scissors } from "lucide-react";
import { useProfile } from "../../hooks/useContent";
import { setContent } from "../../lib/firestore";
import { uploadToCloudinary } from "../../lib/cloudinary";
import ImageAdjustModal from "../components/ImageAdjustModal";
import {
  EditorHeader, SectionTitle, Field, TextInput, TextArea, Card, SaveButton, ConfirmModal,
} from "../components/AdminUI";
import DefaultPersonAvatar from "../../components/ui/DefaultPersonAvatar";

export default function ProfileEditor() {
  const { data, loading } = useProfile();
  const [form, setForm] = useState(null);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [openExp, setOpenExp] = useState(null);
  const [uploading, setUploading] = useState({});
  const fileInputRef = useRef();
  const [pendingCardIdx, setPendingCardIdx] = useState(null);

  const avatarInputRef = useRef();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Image adjust modal states
  const [adjustState, setAdjustState] = useState({
    isOpen: false,
    imageUrl: "",
    targetType: "", // "avatar" | "heroCard"
    targetIdx: null,
    aspectRatio: "capsule",
    title: "Profil Fotoğrafı Ayarla & Kırp",
  });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "Evet, Sil",
    variant: "danger",
    onConfirm: () => {},
  });

  const openAdjustModal = (imageUrl, targetType, targetIdx = null, aspectRatio = "capsule", title = "Fotoğrafı Kırp & Hizala") => {
    if (!imageUrl) return;
    setAdjustState({
      isOpen: true,
      imageUrl,
      targetType,
      targetIdx,
      aspectRatio,
      title,
    });
  };

  useEffect(() => {
    if (data && !form) {
      setForm({
        name: data.name || "",
        avatar: data.avatar || "",
        avatarHistory: Array.isArray(data.avatarHistory)
          ? data.avatarHistory
          : data.avatar
          ? [data.avatar]
          : [],
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
        treeConfig: data.treeConfig || {
          enabled: true,
          leafColors: ["#e11d48", "#be123c", "#f43f5e", "#dc2626", "#fda4af"],
          leafCount: 35,
          speed: 1,
        },
      });
    }
  }, [data, form]);

  const updateAvatarWithHistory = (newAvatarUrl) => {
    if (!newAvatarUrl) return;
    setForm((prev) => {
      const existingHistory = Array.isArray(prev?.avatarHistory)
        ? prev.avatarHistory
        : prev?.avatar
        ? [prev.avatar]
        : [];
      const filteredHistory = existingHistory.filter((url) => url !== newAvatarUrl);
      const updatedHistory = [newAvatarUrl, ...filteredHistory].slice(0, 9);
      return {
        ...prev,
        avatar: newAvatarUrl,
        avatarHistory: updatedHistory,
      };
    });
  };

  const save = async () => {
    setSaveStatus("saving");
    try {
      await setContent("profile", form);
      localStorage.setItem("portfolio_cache_profile", JSON.stringify(form));
      window.dispatchEvent(new Event("portfolio_content_updated"));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      console.error(err);
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

  const removeExp = (idx) => {
    setConfirmModal({
      isOpen: true,
      title: "Deneyimi Sil?",
      description: "Bu kariyer deneyimi profilinizden tamamen kaldırılacaktır.",
      confirmText: "Evet, Sil",
      variant: "danger",
      onConfirm: () => {
        setForm((prev) => ({
          ...prev,
          experiences: prev.experiences.filter((_, i) => i !== idx),
        }));
      },
    });
  };

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
    const card = form.heroCards?.[idx];
    setConfirmModal({
      isOpen: true,
      title: "Hero Kartını Sil?",
      description: card?.title
        ? `"${card.title}" adlı 3D kart anasayfa vitrininden kaldırılacaktır.`
        : "Bu 3D kart anasayfa vitrininden kaldırılacaktır.",
      confirmText: "Evet, Sil",
      variant: "danger",
      onConfirm: () => {
        setForm((prev) => ({
          ...prev,
          heroCards: prev.heroCards.filter((_, i) => i !== idx),
        }));
      },
    });
  };

  const updateExtendedBio = (idx, key, value) => {
    setForm((prev) => {
      const extendedBio = [...(prev.extendedBio || [])];
      extendedBio[idx] = { ...extendedBio[idx], [key]: value };
      return { ...prev, extendedBio };
    });
  };

  const addExtendedBio = () => {
    setForm((prev) => ({
      ...prev,
      extendedBio: [
        ...(prev.extendedBio || []),
        { title: "", content: "" },
      ],
    }));
  };

  const removeExtendedBio = (idx) => {
    const item = form.extendedBio?.[idx];
    setConfirmModal({
      isOpen: true,
      title: "Biyografi Başlığını Sil?",
      description: item?.title
        ? `"${item.title}" başlıklı biyografi paragrafı silinecektir.`
        : "Bu biyografi paragrafı silinecektir.",
      confirmText: "Evet, Sil",
      variant: "danger",
      onConfirm: () => {
        setForm((prev) => ({
          ...prev,
          extendedBio: (prev.extendedBio || []).filter((_, i) => i !== idx),
        }));
      },
    });
  };

  const updateRole = (idx, value) => {
    setForm((prev) => {
      const roles = [...prev.roles];
      roles[idx] = value;
      return { ...prev, roles };
    });
  };

  const addRole = () => {
    setForm((prev) => ({
      ...prev,
      roles: [...prev.roles, ""],
    }));
  };

  const removeRole = (idx) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.filter((_, i) => i !== idx),
    }));
  };

  const updateSkill = (idx, value) => {
    setForm((prev) => {
      const skills = [...prev.skills];
      skills[idx] = value;
      return { ...prev, skills };
    });
  };

  const addSkill = () => {
    setForm((prev) => ({
      ...prev,
      skills: [...prev.skills, ""],
    }));
  };

  const removeSkill = (idx) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== idx),
    }));
  };

  const updateTreeConfig = (key, value) => {
    setForm((prev) => ({
      ...prev,
      treeConfig: {
        ...(prev.treeConfig || {}),
        [key]: value,
      },
    }));
  };

  const addLeafColor = (color = "#f43f5e") => {
    setForm((prev) => {
      const leafColors = [...(prev.treeConfig?.leafColors || []), color];
      return {
        ...prev,
        treeConfig: {
          ...(prev.treeConfig || {}),
          leafColors,
        },
      };
    });
  };

  const updateLeafColor = (idx, color) => {
    setForm((prev) => {
      const leafColors = [...(prev.treeConfig?.leafColors || [])];
      leafColors[idx] = color;
      return {
        ...prev,
        treeConfig: {
          ...(prev.treeConfig || {}),
          leafColors,
        },
      };
    });
  };

  const removeLeafColor = (idx) => {
    setForm((prev) => {
      const leafColors = (prev.treeConfig?.leafColors || []).filter((_, i) => i !== idx);
      return {
        ...prev,
        treeConfig: {
          ...(prev.treeConfig || {}),
          leafColors,
        },
      };
    });
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
      updateAvatarWithHistory(url);
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

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((p) => ({ ...p, isOpen: false }))}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
        onConfirm={() => {
          confirmModal.onConfirm();
          setConfirmModal((p) => ({ ...p, isOpen: false }));
        }}
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
            updateAvatarWithHistory(newCroppedUrl);
          } else if (adjustState.targetType === "heroCard" && adjustState.targetIdx !== null) {
            updateHeroCard(adjustState.targetIdx, "imgUrl", newCroppedUrl);
          }
        }}
        onRemove={
          adjustState.targetType === "avatar"
            ? () => {
                setConfirmModal({
                  isOpen: true,
                  title: "Profil Fotoğrafını Kaldır?",
                  description:
                    "Mevcut profil fotoğrafınız kaldırılacak ve sitede varsayılan rozet avatarı gösterilecektir.",
                  confirmText: "Evet, Fotoğrafı Kaldır",
                  variant: "danger",
                  onConfirm: () => {
                    setField("avatar", "");
                    setAdjustState((prev) => ({ ...prev, isOpen: false }));
                  },
                });
              }
            : undefined
        }
        removeLabel="Fotoğrafı Kaldır"
      />

      {/* Temel Bilgiler & Profil Fotoğrafı */}
      <Card>
        <SectionTitle>Temel Bilgiler & Profil Fotoğrafı (Avatar)</SectionTitle>
        <div className="flex flex-col md:flex-row gap-6 items-start mb-6 pb-6 border-b border-white/8">
          {/* Avatar Çerçevesi (Tıklanınca Fotoğraf Ayarlama Modalı Açılır) */}
          <div className="flex flex-col items-center">
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
                    <Scissors size={14} className="text-rose-400" />
                    <span>Hizala & Kırp</span>
                  </div>
                </>
              ) : (
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <DefaultPersonAvatar />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-mono gap-1">
                    <Upload size={18} className="text-rose-400" />
                    <span>Fotoğraf Yükle</span>
                  </div>
                </div>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 flex-1">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white/90">Anasayfa Profil Fotoğrafı (Rozet Avatar)</p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="text-xs bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30 rounded-xl px-4 py-2 transition-colors cursor-pointer inline-flex items-center gap-1.5 font-medium"
                >
                  <Upload size={14} /> Görsel Yükle
                </button>
                {form.avatar && (
                  <button
                    type="button"
                    onClick={() => openAdjustModal(form.avatar, "avatar", null, "capsule", "Profil Fotoğrafı Hizala & Kırp")}
                    className="text-xs bg-white/5 text-white/80 hover:bg-white/10 border border-white/15 rounded-xl px-4 py-2 transition-colors cursor-pointer inline-flex items-center gap-1.5 font-medium"
                  >
                    <Scissors size={14} className="text-rose-400" /> Fotoğrafı Hizala
                  </button>
                )}
              </div>
            </div>

            {/* Son Profil Fotoğrafları Geçmişi (En fazla 9 adet) */}
            {form.avatarHistory && form.avatarHistory.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-xs font-mono font-semibold text-white/80 flex items-center gap-1.5">
                    <span>Son Profil Fotoğrafları (Geçmiş):</span>
                    <span className="text-[10px] text-white/40 font-normal">({form.avatarHistory.length}/9)</span>
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-white/40 hidden sm:inline">
                      Tek tıkla aktif yapabilirsiniz
                    </span>
                    {form.avatarHistory.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmModal({
                            isOpen: true,
                            title: "Fotoğraf Geçmişini Temizle?",
                            description: "Geçmişte kaydedilmiş eski profil fotoğrafları silinecektir.",
                            confirmText: "Geçmişi Temizle",
                            variant: "danger",
                            onConfirm: () => {
                              setForm((prev) => ({
                                ...prev,
                                avatarHistory: prev.avatar ? [prev.avatar] : [],
                              }));
                            },
                          });
                        }}
                        className="text-[11px] font-mono text-red-400/80 hover:text-red-300 transition-colors cursor-pointer flex items-center gap-1"
                        title="Tüm eski profil fotoğrafları geçmişini temizle"
                      >
                        <Trash2 size={11} /> Geçmişi Temizle
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {form.avatarHistory.map((histUrl, hIdx) => {
                    const isCurrent = form.avatar === histUrl;
                    return (
                      <div
                        key={histUrl || hIdx}
                        onClick={() => setField("avatar", histUrl)}
                        className={`group/hist relative w-12 h-18 sm:w-14 sm:h-20 rounded-full cursor-pointer overflow-hidden border-2 transition-all duration-200 shadow-md ${
                          isCurrent
                            ? "border-rose-500 ring-2 ring-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.35)] scale-105"
                            : "border-white/15 hover:border-white/40 opacity-60 hover:opacity-100"
                        }`}
                        title={isCurrent ? "Şu anki aktif profil fotoğrafı" : "Bu fotoğrafı aktif yap"}
                      >
                        <img
                          src={histUrl}
                          alt={`Profil ${hIdx + 1}`}
                          className="w-full h-full object-cover group-hover/hist:scale-105 transition-transform"
                        />
                        {isCurrent && (
                          <div className="absolute inset-0 bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-white text-[11px] font-bold">
                            ✓
                          </div>
                        )}
                        {/* Geçmişten Kaldırma Butonu */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setForm((prev) => {
                              const nextHist = (prev.avatarHistory || []).filter((_, i) => i !== hIdx);
                              return {
                                ...prev,
                                avatar: isCurrent ? (nextHist[0] || "") : prev.avatar,
                                avatarHistory: nextHist,
                              };
                            });
                          }}
                          className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/80 hover:bg-rose-600 text-white flex items-center justify-center text-[9px] opacity-0 group-hover/hist:opacity-100 transition-opacity cursor-pointer shadow-sm"
                          title="Bu fotoğrafı geçmişten sil"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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
              {/* Resim Yükle / Çerçeve Hizalama */}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div
                  className="group/frame relative w-20 h-28 rounded-xl border-2 border-dashed border-white/20 hover:border-rose-500/60 cursor-pointer overflow-hidden flex items-center justify-center bg-white/[0.03] transition-all shadow-md"
                  onClick={() => {
                    if (card.imgUrl) {
                      openAdjustModal(card.imgUrl, "heroCard", idx, "card", "Yelpaze Kartı Hizala & Kırp");
                    } else {
                      setPendingCardIdx(idx);
                      fileInputRef.current?.click();
                    }
                  }}
                  title="Görseli kırpmak ve hizalamak için çerçeveye tıklayın"
                >
                  {card.imgUrl ? (
                    <>
                      <img
                        src={card.imgUrl}
                        alt={card.title || `Card ${idx}`}
                        className="w-full h-full object-cover group-hover/frame:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/55 opacity-0 group-hover/frame:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-mono gap-1">
                        <Scissors size={14} className="text-rose-400" />
                        <span>Hizala</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-white/30">
                      <Upload size={18} />
                      <span className="text-[10px] mt-0.5">Görsel</span>
                    </div>
                  )}
                  {uploading[idx] && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1 items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setPendingCardIdx(idx);
                      fileInputRef.current?.click();
                    }}
                    className="text-[10px] text-rose-300 hover:text-rose-200 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <Upload size={10} /> Görsel Yükle
                  </button>
                  {card.imgUrl && (
                    <button
                      type="button"
                      onClick={() => openAdjustModal(card.imgUrl, "heroCard", idx, "card", "Yelpaze Kartı Hizala & Kırp")}
                      className="text-[9px] text-white/50 hover:text-white transition-colors cursor-pointer"
                    >
                      ✂️ Hizala / Kırp
                    </button>
                  )}
                </div>
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

      {/* Hakkımda 3 Ana Disiplin & Odak Kartları (Extended Bio) */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <SectionTitle>Hakkımda — 3 Ana Disiplin & Odak Kartları</SectionTitle>
            <p className="text-white/40 text-xs mt-0.5">
              Hakkımda sayfasında "İki disiplin, tek bakış açısı" başlığının altında 3 sütun halinde sergilenen odak kartları.
            </p>
          </div>
          <button
            type="button"
            onClick={addExtendedBio}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 border border-rose-500/30 rounded-lg px-3 py-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Plus size={13} /> Yeni Kart Ekle
          </button>
        </div>

        <div className="space-y-4 mt-4">
          {(form.extendedBio || []).map((card, idx) => (
            <div
              key={idx}
              className="bg-white/[0.03] border border-white/8 rounded-xl p-4 space-y-3 relative group hover:border-white/20 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-rose-300 font-semibold flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  Odak Kartı
                </span>
                <button
                  type="button"
                  onClick={() => removeExtendedBio(idx)}
                  className="text-white/30 hover:text-rose-400 transition-colors p-1"
                  title="Kartı Sil"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <Field label="Kart Başlığı">
                <TextInput
                  value={card.title || ""}
                  onChange={(v) => updateExtendedBio(idx, "title", v)}
                  placeholder="Mühendislik & Yapay Zekâ"
                />
              </Field>

              <Field label="Açıklama Metni">
                <TextArea
                  value={card.content || ""}
                  onChange={(v) => updateExtendedBio(idx, "content", v)}
                  rows={3}
                  placeholder="Kartın detaylı açıklama metni..."
                />
              </Field>
            </div>
          ))}
        </div>
      </Card>

      {/* Hero Ağaç & Düşen Yapraklar Yönetimi (Light Mod) */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <SectionTitle>🌸 Hero Ağaç & Düşen Yapraklar (Light Mod)</SectionTitle>
            <p className="text-white/40 text-xs mt-0.5">
              Açık (pembe) modda Hero yelpaze kartlarının arkasından çıkan Rapunzel ağacının yaprak renkleri, yoğunluğu ve düşüş hızı.
            </p>
          </div>
          <label className="flex items-center gap-2 text-xs text-rose-300 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={form.treeConfig?.enabled !== false}
              onChange={(e) => updateTreeConfig("enabled", e.target.checked)}
              className="accent-rose-500 rounded"
            />
            Efekti Etkinleştir
          </label>
        </div>

        <div className="space-y-5 mt-4">
          {/* Yaprak Renk Paleti */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-white/60">
                Yaprak Renk Paleti ({form.treeConfig?.leafColors?.length || 0} Renk)
              </label>
              <button
                type="button"
                onClick={addLeafColor}
                className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 border border-rose-500/30 rounded-lg px-2.5 py-1 transition-colors cursor-pointer"
              >
                <Plus size={12} /> Yeni Renk Ekle
              </button>
            </div>

            <div className="flex flex-wrap gap-2.5 items-center">
              {(form.treeConfig?.leafColors || []).map((color, cIdx) => (
                <div
                  key={cIdx}
                  className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-xl p-2 group hover:border-white/20 transition-all"
                >
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => updateLeafColor(cIdx, e.target.value)}
                    className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                    title="Rengi değiştir"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => updateLeafColor(cIdx, e.target.value)}
                    className="w-20 bg-transparent text-xs font-mono text-white/90 border-0 focus:outline-none"
                    placeholder="#e11d48"
                  />
                  <button
                    type="button"
                    onClick={() => removeLeafColor(cIdx)}
                    className="text-white/30 hover:text-rose-400 p-0.5 transition-colors"
                    title="Rengi Sil"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Yoğunluk, Hız & Spam Kilidi Ayarları */}
          <div className="grid md:grid-cols-3 gap-4 pt-2 border-t border-white/8">
            <Field label={`Yaprak Yoğunluğu (${form.treeConfig?.leafCount || 35} Yaprak)`}>
              <input
                type="range"
                min="15"
                max="75"
                step="5"
                value={form.treeConfig?.leafCount || 35}
                onChange={(e) => updateTreeConfig("leafCount", Number(e.target.value))}
                className="w-full accent-rose-500"
              />
            </Field>

            <Field label={`Süzülme Hızı (${form.treeConfig?.speed || 1}x)`}>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.25"
                value={form.treeConfig?.speed || 1}
                onChange={(e) => updateTreeConfig("speed", Number(e.target.value))}
                className="w-full accent-rose-500"
              />
            </Field>

            <Field label={`Spam Kilidi / Patlama Bekleme (${form.treeConfig?.burstCooldown || 1.8}s)`}>
              <input
                type="range"
                min="0.5"
                max="4.0"
                step="0.1"
                value={form.treeConfig?.burstCooldown || 1.8}
                onChange={(e) => updateTreeConfig("burstCooldown", Number(e.target.value))}
                className="w-full accent-rose-500"
              />
            </Field>
          </div>
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

      {/* Tatlı Silme Onay Modalı */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
      />
    </div>
  );
}
