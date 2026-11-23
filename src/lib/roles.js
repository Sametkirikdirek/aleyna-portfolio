/**
 * Rol Tabanlı Yetkilendirme (Role-Based Access Control)
 * 
 * - ARTIST (Sanatçı - Aleyna):
 *   Yalnızca koordinatör onayından geçmiş steril tuval taleplerini ("Aleyna'nın Masası")
 *   ve kendi portfolyo içeriklerini (Galeri, Yazılar, CV vb.) görür.
 *   Ham ziyaretçi fotoğrafları, IP adresleri ve adli güvenlik kayıtları sanatçıya ASLA gösterilmez.
 * 
 * - MODERATOR (Koordinatör & Güvenlik Yöneticisi - Samet):
 *   Gelen tüm ham fotoğrafları inceler (Ön Eleme), onaylar/reddeder.
 *   Yapay zeka filtresine takılan adli kayıtları (IP, konum, delil tutanağı) yönetir.
 *   Telegram bildirim hattını ve sistem ayarlarını yönetir.
 * 
 * - SUPERADMIN:
 *   Her iki role de tam erişim sağlar.
 */

export const ROLES = {
  ARTIST: "artist",
  MODERATOR: "moderator",
  SUPERADMIN: "superadmin",
};

export const KNOWN_EMAILS = {
  moderators: [
    "sametkirikdirek@gmail.com",
    "samet@gmail.com",
  ],
  artists: [
    "aleynaaltunsu@gmail.com",
    "aleyna@gmail.com",
  ],
};

export function determineUserRole(email, customRoles = {}) {
  if (!email) return null;
  const cleanEmail = email.toLowerCase().trim();

  // 1. Firestore özel rol tanımı varsa öncelikli kullan (settings/roles koleksiyonu)
  if (customRoles && customRoles[cleanEmail]) {
    return customRoles[cleanEmail];
  }

  // 2. Bilinen moderatör e-postaları
  if (KNOWN_EMAILS.moderators.includes(cleanEmail)) {
    return ROLES.MODERATOR;
  }

  // 3. Bilinen sanatçı e-postaları
  if (KNOWN_EMAILS.artists.includes(cleanEmail)) {
    return ROLES.ARTIST;
  }

  // Unrecognized accounts never inherit admin access through email substrings.
  return null;
}

export function getRoleBadgeInfo(role) {
  switch (role) {
    case ROLES.MODERATOR:
      return {
        title: "Moderatör Paneli",
        subtitle: "Güvenlik & Koordinasyon",
        badge: "MODERATÖR",
        badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        panelName: "Atölye Koordinatörü",
      };
    case ROLES.SUPERADMIN:
      return {
        title: "Süper Admin Paneli",
        subtitle: "Tam Yetkili Yönetim",
        badge: "SÜPER ADMİN",
        badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
        panelName: "Sistem Yöneticisi",
      };
    case ROLES.ARTIST:
    default:
      return {
        title: "Sanatçı Paneli",
        subtitle: "Aleyna Altunsu",
        badge: "SANATÇI",
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        panelName: "Sanatçı Masası",
      };
  }
}
