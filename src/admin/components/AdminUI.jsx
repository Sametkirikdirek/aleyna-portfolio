import { Loader2, CheckCircle2 } from "lucide-react";

/**
 * Yeniden kullanılabilir kaydet butonu.
 * status: "idle" | "saving" | "saved" | "error"
 */
export function SaveButton({ status, onClick, label = "Kaydet & Yayınla" }) {
  const styles = {
    idle: "bg-rose-600 hover:bg-rose-500 shadow-rose-900/30",
    saving: "bg-rose-800 cursor-not-allowed",
    saved: "bg-emerald-600 hover:bg-emerald-500",
    error: "bg-red-700 hover:bg-red-600",
  };

  const labels = {
    idle: label,
    saving: "Kaydediliyor…",
    saved: "Kaydedildi ✓",
    error: "Hata — Tekrar Dene",
  };

  return (
    <button
      onClick={onClick}
      disabled={status === "saving"}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium text-sm transition-all duration-200 shadow-lg ${styles[status]}`}
    >
      {status === "saving" && <Loader2 size={15} className="animate-spin" />}
      {status === "saved" && <CheckCircle2 size={15} />}
      {labels[status]}
    </button>
  );
}

/** Bölüm başlığı */
export function SectionTitle({ children }) {
  return (
    <h2 className="text-white/90 font-semibold text-base mb-4 pb-3 border-b border-white/8">
      {children}
    </h2>
  );
}

/** Etiket + input sarmalayıcı */
export function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-white/50 text-xs font-medium uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

/** Tek satırlık metin girişi */
export function TextInput({ value, onChange, placeholder = "", disabled = false }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3.5 py-2.5 text-white text-sm placeholder:text-white/20 outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all duration-200 disabled:opacity-50"
    />
  );
}

/** Çok satırlık metin alanı */
export function TextArea({ value, onChange, placeholder = "", rows = 4 }) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3.5 py-2.5 text-white text-sm placeholder:text-white/20 outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all duration-200 resize-y leading-relaxed"
    />
  );
}

/** Kart sarmalayıcı */
export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white/[0.03] border border-white/8 rounded-xl p-5 ${className}`}>
      {children}
    </div>
  );
}

/** Editör sayfası başlık bölümü */
export function EditorHeader({ title, subtitle, saveStatus, onSave }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-7">
      <div>
        <h1 className="text-xl font-semibold text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-white/40 text-sm mt-1">{subtitle}</p>}
      </div>
      {onSave && <SaveButton status={saveStatus} onClick={onSave} />}
    </div>
  );
}
