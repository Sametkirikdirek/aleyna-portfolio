/**
 * Eser Fiyatlandırma & Durum Rozeti Renk ve Tema Yapılandırması
 * Hem Light hem Dark modda kusursuz kontrast (WCAG AAA uyumlu)
 */

export const PRICE_PRESETS = [
  {
    label: "Özel Koleksiyon",
    dot: "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]",
    adminBtn:
      "text-amber-300 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50",
    adminActive:
      "bg-amber-500/25 text-amber-100 font-bold border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_14px_rgba(245,158,11,0.35)]",
  },
  {
    label: "Teklif Üzerine",
    dot: "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]",
    adminBtn:
      "text-emerald-300 bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50",
    adminActive:
      "bg-emerald-500/25 text-emerald-100 font-bold border-emerald-400 ring-2 ring-emerald-400/50 shadow-[0_0_14px_rgba(16,185,129,0.35)]",
  },
  {
    label: "Satıldı",
    dot: "bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.8)]",
    adminBtn:
      "text-rose-300 bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20 hover:border-rose-500/50",
    adminActive:
      "bg-rose-500/25 text-rose-100 font-bold border-rose-400 ring-2 ring-rose-400/50 shadow-[0_0_14px_rgba(244,63,94,0.35)]",
  },
  {
    label: "Koleksiyonda",
    dot: "bg-purple-400 shadow-[0_0_6px_rgba(192,132,252,0.8)]",
    adminBtn:
      "text-purple-300 bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-500/50",
    adminActive:
      "bg-purple-500/25 text-purple-100 font-bold border-purple-400 ring-2 ring-purple-400/50 shadow-[0_0_14px_rgba(168,85,247,0.35)]",
  },
];

/**
 * Verilen fiyat metnine göre uygun renk, rozet ve kontrast sınıflarını döner
 */
export function getArtworkPriceInfo(rawPrice) {
  const text = rawPrice?.trim() || "Özel Koleksiyon";
  const lower = text.toLowerCase();

  // 1. Satıldı / Sold
  if (lower.includes("satıldı") || lower.includes("sold")) {
    return {
      text,
      type: "sold",
      dot: "bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.8)]",
      // Görsel üzeri rozet (siyah buzlu cam taban — her fotoğrafta ve temada kusursuz netlik)
      cardBadge:
        "backdrop-blur-md bg-black/80 border border-rose-500/35 text-rose-200 shadow-md",
      // Lightbox modalı (Light modda koyu kırmızı, Dark modda canlı pastel kırmızı)
      lightboxBadge:
        "bg-rose-500/15 border border-rose-500/30 text-rose-800 dark:text-rose-200",
      lightboxText: "text-rose-700 dark:text-rose-300",
      adminBadge: "bg-rose-500/15 border-rose-500/30 text-rose-300",
    };
  }

  // 2. Teklif Üzerine / Offer
  if (lower.includes("teklif") || lower.includes("offer")) {
    return {
      text,
      type: "offer",
      dot: "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]",
      cardBadge:
        "backdrop-blur-md bg-black/80 border border-emerald-500/35 text-emerald-200 shadow-md",
      lightboxBadge:
        "bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200",
      lightboxText: "text-emerald-700 dark:text-emerald-300",
      adminBadge: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
    };
  }

  // 3. Koleksiyonda
  if (lower.includes("koleksiyonda")) {
    return {
      text,
      type: "collected",
      dot: "bg-purple-400 shadow-[0_0_6px_rgba(192,132,252,0.8)]",
      cardBadge:
        "backdrop-blur-md bg-black/80 border border-purple-500/35 text-purple-200 shadow-md",
      lightboxBadge:
        "bg-purple-500/15 border border-purple-500/30 text-purple-900 dark:text-purple-200",
      lightboxText: "text-purple-700 dark:text-purple-300",
      adminBadge: "bg-purple-500/15 border-purple-500/30 text-purple-300",
    };
  }

  // 4. Standart: "Özel Koleksiyon" veya Spesifik Fiyat (örn. 25.000 ₺, $1,500)
  return {
    text,
    type: "default",
    dot: "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]",
    cardBadge:
      "backdrop-blur-md bg-black/80 border border-amber-500/35 text-amber-200 shadow-md",
    lightboxBadge:
      "bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200",
    lightboxText: "text-amber-800 dark:text-amber-200",
    adminBadge: "bg-amber-500/15 border-amber-500/30 text-amber-300",
  };
}
