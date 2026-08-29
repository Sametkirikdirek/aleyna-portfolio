import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { useAiProjects } from "../../hooks/useContent";
import { setContent } from "../../lib/firestore";
import {
  EditorHeader, SectionTitle, Field, TextInput, TextArea, Card, SaveButton,
} from "../components/AdminUI";

export default function AIProjectEditor() {
  const { data, loading } = useAiProjects();
  const [projects, setProjects] = useState([]);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [openIdx, setOpenIdx] = useState(null);

  useEffect(() => {
    if (data && projects.length === 0) {
      setProjects(data.projects || []);
    }
  }, [data]);

  const save = async () => {
    setSaveStatus("saving");
    try {
      const payload = { projects };
      await setContent("aiProjects", payload);
      localStorage.setItem("portfolio_cache_aiProjects", JSON.stringify(payload));
      window.dispatchEvent(new Event("portfolio_content_updated"));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const updateProject = (idx, key, value) => {
    setProjects((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });
  };

  const addProject = () => {
    setProjects((prev) => [
      ...prev,
      {
        id: `ai-${Date.now()}`,
        title: "",
        summary: "",
        category: "",
        pinned: false,
        pinnedTag: "",
        metric: "",
        stack: [],
        year: new Date().getFullYear().toString(),
        role: "",
        company: "",
        link: "",
      },
    ]);
    setOpenIdx(projects.length);
  };

  const removeProject = (idx) => {
    setProjects((prev) => prev.filter((_, i) => i !== idx));
    setOpenIdx(null);
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
        title="Yapay Zeka Projeleri"
        subtitle="GitHub projeleri ve öne çıkarılan çalışmalar"
        saveStatus={saveStatus}
        onSave={save}
      />

      <div className="flex justify-end">
        <button
          onClick={addProject}
          className="flex items-center gap-2 text-sm text-rose-400 hover:text-rose-300 border border-rose-500/30 rounded-lg px-4 py-2 transition-colors"
        >
          <Plus size={15} /> Yeni Proje Ekle
        </button>
      </div>

      <div className="space-y-3">
        {projects.map((proj, idx) => (
          <div key={proj.id} className="bg-white/[0.03] border border-white/8 rounded-xl overflow-hidden">
            {/* Başlık satırı */}
            <div
              className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-white/[0.03] transition-colors"
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
            >
              <div className="flex items-center gap-3">
                {proj.pinned && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    Öne Çıkarılan
                  </span>
                )}
                <span className="text-sm font-medium text-white/80">
                  {proj.title || "Yeni Proje"}
                </span>
                {proj.year && (
                  <span className="text-white/30 text-xs">{proj.year}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); removeProject(idx); }}
                  className="text-white/20 hover:text-rose-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
                {openIdx === idx
                  ? <ChevronUp size={15} className="text-white/40" />
                  : <ChevronDown size={15} className="text-white/40" />}
              </div>
            </div>

            {/* Detay alanları */}
            {openIdx === idx && (
              <div className="px-4 pb-5 border-t border-white/8 pt-4 space-y-4">
                <div className="grid md:grid-cols-2 gap-3">
                  <Field label="Proje Başlığı">
                    <TextInput value={proj.title} onChange={(v) => updateProject(idx, "title", v)} />
                  </Field>
                  <Field label="Kategori">
                    <TextInput value={proj.category} onChange={(v) => updateProject(idx, "category", v)} placeholder="Bilgisayarlı Görü" />
                  </Field>
                  <Field label="Yıl">
                    <TextInput value={proj.year} onChange={(v) => updateProject(idx, "year", v)} placeholder="2024" />
                  </Field>
                  <Field label="Rol">
                    <TextInput value={proj.role} onChange={(v) => updateProject(idx, "role", v)} />
                  </Field>
                  <Field label="Şirket / Kurum">
                    <TextInput value={proj.company} onChange={(v) => updateProject(idx, "company", v)} />
                  </Field>
                  <Field label="Performans Metriği">
                    <TextInput value={proj.metric} onChange={(v) => updateProject(idx, "metric", v)} placeholder="YOLOv8 Real-Time" />
                  </Field>
                </div>
                <Field label="Özet">
                  <TextArea value={proj.summary} onChange={(v) => updateProject(idx, "summary", v)} rows={3} />
                </Field>
                <Field label="Teknoloji Stack (virgülle ayırın)">
                  <TextInput
                    value={(proj.stack || []).join(", ")}
                    onChange={(v) => updateProject(idx, "stack", v.split(",").map((s) => s.trim()))}
                  />
                </Field>
                <Field label="GitHub / Kaynak Linki">
                  <TextInput value={proj.link} onChange={(v) => updateProject(idx, "link", v)} placeholder="https://github.com/..." />
                </Field>
                {/* Öne çıkarılan toggle */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateProject(idx, "pinned", !proj.pinned)}
                    className={`w-10 h-5 rounded-full transition-colors ${proj.pinned ? "bg-rose-600" : "bg-white/15"} relative`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${proj.pinned ? "translate-x-5" : "translate-x-0.5"}`}
                    />
                  </button>
                  <span className="text-sm text-white/60">Öne Çıkarılan Proje</span>
                </div>
                {proj.pinned && (
                  <Field label="Öne Çıkarılan Etiket">
                    <TextInput
                      value={proj.pinnedTag}
                      onChange={(v) => updateProject(idx, "pinnedTag", v)}
                      placeholder="📌 Pinned / Öne Çıkarılan Proje"
                    />
                  </Field>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <SaveButton status={saveStatus} onClick={save} />
      </div>
    </div>
  );
}
