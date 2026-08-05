import { useState, useEffect, useRef } from "react";
import { FileText, Upload, Loader2, CheckCircle2, ExternalLink } from "lucide-react";
import { useCv } from "../../hooks/useContent";
import { setContent } from "../../lib/firestore";
import { uploadToCloudinary } from "../../lib/cloudinary";
import { EditorHeader, SectionTitle, Card } from "../components/AdminUI";

function CVUploader({ language, label, currentUrl, onUpload }) {
  const fileRef = useRef();
  const [status, setStatus] = useState("idle"); // idle | uploading | done | error

  const handleFile = async (file) => {
    if (!file) return;
    setStatus("uploading");
    try {
      const url = await uploadToCloudinary(file, "cv");
      await onUpload(url);
      setStatus("done");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      console.error(err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <Card>
      <SectionTitle>{label}</SectionTitle>

      {/* Mevcut CV linki */}
      {currentUrl && (
        <a
          href={currentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-rose-400 hover:text-rose-300 mb-4 transition-colors"
        >
          <ExternalLink size={14} />
          Mevcut CV'yi görüntüle
        </a>
      )}

      {/* Yükleme alanı */}
      <div
        className="border-2 border-dashed border-white/15 hover:border-rose-500/50 rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200 group"
        onClick={() => fileRef.current?.click()}
      >
        {status === "uploading" ? (
          <Loader2 size={28} className="text-rose-400 animate-spin" />
        ) : status === "done" ? (
          <CheckCircle2 size={28} className="text-emerald-400" />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center group-hover:bg-rose-500/20 transition-colors">
            <FileText size={22} className="text-rose-400" />
          </div>
        )}

        <div className="text-center">
          <p className="text-white/70 text-sm font-medium">
            {status === "uploading"
              ? "Yükleniyor…"
              : status === "done"
              ? "Başarıyla yüklendi!"
              : "PDF dosyasını seçin veya buraya sürükleyin"}
          </p>
          <p className="text-white/30 text-xs mt-1">Sadece PDF formatı kabul edilir</p>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files[0]) handleFile(e.target.files[0]);
            e.target.value = "";
          }}
        />
      </div>
    </Card>
  );
}

export default function CVEditor() {
  const { data, loading, refresh } = useCv();
  const [cv, setCv] = useState({ tr: "", en: "" });

  useEffect(() => {
    if (data) {
      setCv({ tr: data.tr || "", en: data.en || "" });
    }
  }, [data]);

  const handleUpload = async (lang, url) => {
    const updated = { ...cv, [lang]: url };
    setCv(updated);
    await setContent("cv", updated);
    refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-7 max-w-4xl mx-auto">
      <EditorHeader
        title="CV Yönetimi"
        subtitle="Türkçe ve İngilizce CV dosyalarını güncelleyin"
      />

      <CVUploader
        language="TR"
        label="Türkçe CV"
        currentUrl={cv.tr}
        onUpload={(url) => handleUpload("tr", url)}
      />

      <CVUploader
        language="EN"
        label="İngilizce CV"
        currentUrl={cv.en}
        onUpload={(url) => handleUpload("en", url)}
      />
    </div>
  );
}
