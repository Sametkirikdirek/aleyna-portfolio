import { useState } from "react";
import {
  Loader2,
  CheckCircle2,
  Check,
  AlertTriangle,
  Trash2,
  Info,
  X,
  Heart,
  HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Tatlı, Şık & Animasyonlu Onay Modalı (Sweet Confirmation Dialog)
 */
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Emin misiniz?",
  description = "Bu işlemi gerçekleştirmek istediğinize emin misiniz?",
  confirmText = "Evet, Sil",
  cancelText = "Vazgeç",
  variant = "danger", // "danger" | "warning" | "info" | "heart"
}) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      iconBg: "bg-rose-500/15 border-rose-500/30 text-rose-400 shadow-rose-950/30",
      icon: <Trash2 size={24} />,
      confirmBtn:
        "bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-950/40",
      glow: "bg-rose-500/20",
    },
    warning: {
      iconBg: "bg-amber-500/15 border-amber-500/30 text-amber-400 shadow-amber-950/30",
      icon: <AlertTriangle size={24} />,
      confirmBtn:
        "bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-amber-950/40",
      glow: "bg-amber-500/20",
    },
    info: {
      iconBg: "bg-cyan-500/15 border-cyan-500/30 text-cyan-400 shadow-cyan-950/30",
      icon: <Info size={24} />,
      confirmBtn:
        "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-950/40",
      glow: "bg-cyan-500/20",
    },
    heart: {
      iconBg: "bg-pink-500/15 border-pink-500/30 text-pink-400 shadow-pink-950/30",
      icon: <Heart size={24} className="fill-pink-500/30" />,
      confirmBtn:
        "bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-pink-950/40",
      glow: "bg-pink-500/20",
    },
  };

  const v = variantStyles[variant] || variantStyles.danger;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className="relative w-full max-w-md bg-[#161722] border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden text-center select-none"
      >
        {/* Arka plan tatlı renk ışıltısı */}
        <div
          className={`pointer-events-none absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl ${v.glow}`}
        />
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />

        {/* Kapat butonu */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Tatlı Yuvarlak İkon */}
        <div className="mx-auto mb-4 w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg relative">
          <div
            className={`w-full h-full rounded-2xl border flex items-center justify-center ${v.iconBg}`}
          >
            {v.icon}
          </div>
        </div>

        {/* Başlık ve Açıklama */}
        <h3 className="text-lg font-bold text-white tracking-tight">
          {title}
        </h3>
        <p className="mt-2 text-sm text-white/65 leading-relaxed font-sans">
          {description}
        </p>

        {/* Tatlı Butonlar */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white font-medium text-sm border border-white/10 transition-all cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-5 py-2.5 rounded-xl font-medium text-sm shadow-lg transition-all cursor-pointer ${v.confirmBtn}`}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Yeniden kullanılabilir & Tatlı animasyonlu Kaydet Butonu.
 * status: "idle" | "saving" | "saved" | "error"
 */
export function SaveButton({ status, onClick, label = "Kaydet & Yayınla" }) {
  const styles = {
    idle: "bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 shadow-rose-950/40 hover:shadow-rose-900/50 hover:scale-[1.02]",
    saving: "bg-rose-900/80 border border-rose-500/30 text-rose-200 cursor-not-allowed",
    saved: "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-950/40 scale-[1.02]",
    error: "bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-600 hover:to-rose-600 text-white shadow-red-950/40",
  };

  const labels = {
    idle: label,
    saving: "Kaydediliyor…",
    saved: "Kaydedildi",
    error: "Hata — Tekrar Dene",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={status === "saving"}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-all duration-200 shadow-lg cursor-pointer active:scale-95 shrink-0 ${styles[status]}`}
    >
      {status === "saving" && <Loader2 size={15} className="animate-spin" />}
      {status === "saved" && <Check size={16} className="text-white" strokeWidth={2.5} />}
      {status === "idle" && <CheckCircle2 size={15} className="opacity-80" />}
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
      <label className="text-white/50 text-xs font-medium uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

/** Tek satırlık metin girişi */
export function TextInput({
  value,
  onChange,
  placeholder = "",
  disabled = false,
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm placeholder:text-white/20 outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all duration-200 disabled:opacity-50"
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
      className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm placeholder:text-white/20 outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all duration-200 resize-y leading-relaxed"
    />
  );
}

/** Kart sarmalayıcı */
export function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white/[0.03] border border-white/8 rounded-2xl p-5 ${className}`}
    >
      {children}
    </div>
  );
}

/** Editör sayfası başlık bölümü */
export function EditorHeader({ title, subtitle, saveStatus, onSave }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
      <div>
        <h1 className="text-xl font-semibold text-white tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="text-white/40 text-sm mt-1">{subtitle}</p>}
      </div>
      {onSave && <SaveButton status={saveStatus} onClick={onSave} />}
    </div>
  );
}
