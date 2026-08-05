import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useProfile } from "../../hooks/useContent";
import { setContent } from "../../lib/firestore";
import {
  EditorHeader, SectionTitle, Field, TextInput, TextArea, Card, SaveButton,
} from "../components/AdminUI";

export default function ProfileEditor() {
  const { data, loading } = useProfile();
  const [form, setForm] = useState(null);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [openExp, setOpenExp] = useState(null);

  useEffect(() => {
    if (data && !form) {
      setForm({
        name: data.name || "",
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

  if (loading || !form) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-7 max-w-3xl">
      <EditorHeader
        title="Anasayfa & Hakkımda"
        subtitle="Profil bilgileri, biyografi ve deneyimler"
        saveStatus={saveStatus}
        onSave={save}
      />

      {/* Temel Bilgiler */}
      <Card>
        <SectionTitle>Temel Bilgiler</SectionTitle>
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

      {/* Biyografi */}
      <Card>
        <SectionTitle>Biyografi</SectionTitle>
        <div className="space-y-4">
          <Field label="Kısa Biyografi">
            <TextArea value={form.bio} onChange={(v) => setField("bio", v)} rows={4} />
          </Field>
          <Field label="Felsefe / Alıntı">
            <TextArea value={form.philosophy} onChange={(v) => setField("philosophy", v)} rows={3} />
          </Field>
        </div>
        {form.extendedBio.map((section, idx) => (
          <div key={idx} className="mt-4 space-y-2">
            <Field label={`Genişletilmiş Biyografi — ${idx + 1}. Başlık`}>
              <TextInput
                value={section.title}
                onChange={(v) => {
                  const eb = [...form.extendedBio];
                  eb[idx] = { ...eb[idx], title: v };
                  setField("extendedBio", eb);
                }}
              />
            </Field>
            <Field label={`Genişletilmiş Biyografi — ${idx + 1}. İçerik`}>
              <TextArea
                value={section.content}
                onChange={(v) => {
                  const eb = [...form.extendedBio];
                  eb[idx] = { ...eb[idx], content: v };
                  setField("extendedBio", eb);
                }}
                rows={3}
              />
            </Field>
          </div>
        ))}
      </Card>

      {/* Sosyal Medya */}
      <Card>
        <SectionTitle>Sosyal Medya Linkleri</SectionTitle>
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(form.social).map(([key, val]) => (
            <Field key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}>
              <TextInput value={val} onChange={(v) => setSocial(key, v)} placeholder={`https://...`} />
            </Field>
          ))}
        </div>
      </Card>

      {/* Deneyimler */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>İş Deneyimleri</SectionTitle>
          <button
            onClick={addExp}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 border border-rose-500/30 rounded-lg px-3 py-1.5 transition-colors"
          >
            <Plus size={13} /> Yeni Ekle
          </button>
        </div>
        <div className="space-y-3">
          {form.experiences.map((exp, idx) => (
            <div key={exp.id} className="bg-white/[0.03] border border-white/8 rounded-lg overflow-hidden">
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.03]"
                onClick={() => setOpenExp(openExp === idx ? null : idx)}
              >
                <span className="text-sm font-medium text-white/80">
                  {exp.role || "Yeni Deneyim"} {exp.company ? `— ${exp.company}` : ""}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); removeExp(idx); }}
                    className="text-white/30 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                  {openExp === idx ? <ChevronUp size={15} className="text-white/40" /> : <ChevronDown size={15} className="text-white/40" />}
                </div>
              </div>
              {openExp === idx && (
                <div className="px-4 pb-4 space-y-3 border-t border-white/8 pt-4">
                  <div className="grid md:grid-cols-2 gap-3">
                    <Field label="Rol"><TextInput value={exp.role} onChange={(v) => updateExp(idx, "role", v)} /></Field>
                    <Field label="Şirket"><TextInput value={exp.company} onChange={(v) => updateExp(idx, "company", v)} /></Field>
                    <Field label="Konum"><TextInput value={exp.location} onChange={(v) => updateExp(idx, "location", v)} /></Field>
                    <Field label="Dönem"><TextInput value={exp.period} onChange={(v) => updateExp(idx, "period", v)} placeholder="2024 — 2025" /></Field>
                    <Field label="Tür"><TextInput value={exp.type} onChange={(v) => updateExp(idx, "type", v)} placeholder="Tam Zamanlı / Staj" /></Field>
                  </div>
                  <Field label="Açıklama">
                    <TextArea value={exp.description} onChange={(v) => updateExp(idx, "description", v)} rows={4} />
                  </Field>
                  <Field label="Öne Çıkanlar (her satıra bir madde)">
                    <TextArea
                      value={(exp.highlights || []).join("\n")}
                      onChange={(v) => updateExp(idx, "highlights", v.split("\n").filter(Boolean))}
                      rows={3}
                    />
                  </Field>
                  <Field label="Teknolojiler (virgülle ayırın)">
                    <TextInput
                      value={(exp.technologies || []).join(", ")}
                      onChange={(v) => updateExp(idx, "technologies", v.split(",").map((t) => t.trim()))}
                    />
                  </Field>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Alt Kaydet */}
      <div className="flex justify-end">
        <SaveButton status={saveStatus} onClick={save} />
      </div>
    </div>
  );
}
