import { doc, getDoc, setDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

// Firestore collection isimleri
export const COLLECTIONS = {
  PROFILE: "content",         // doc: "profile"
  GALLERY: "content",         // doc: "gallery"
  AI_PROJECTS: "content",     // doc: "aiProjects"
  WRITINGS: "content",        // doc: "writings"
  TIMELINE: "content",        // doc: "timeline"
  CV: "content",              // doc: "cv"
};

/**
 * Firestore'dan bir içerik dokümanı okur.
 * @param {string} docId - Doküman kimliği (örn: "profile")
 * @returns {Promise<object|null>}
 */
export async function getContent(docId) {
  try {
    const ref = doc(db, "content", docId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    console.warn(`Firestore okuma hatası (${docId}):`, err.message);
    return null;
  }
}

/**
 * Firestore'a bir içerik dokümanı yazar / günceller.
 * @param {string} docId - Doküman kimliği (örn: "profile")
 * @param {object} data - Kaydedilecek veri
 */
export async function setContent(docId, data) {
  const ref = doc(db, "content", docId);
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

/**
 * Gerçek Ziyaretçi & Sayfa Görüntülenme Sayacı
 */
export async function trackPageView(path = "home") {
  // Sayfa yenilemelerinde tekil oturum koruması (5 dakikalık oturum bazlı)
  try {
    const timeSlot = new Date().toISOString().slice(0, 14); // Saatlik dilim
    const cleanPath = path === "/" || !path ? "home" : path.replace(/[\/\.]/g, "_");
    const sessionKey = `view_${cleanPath}_${timeSlot}`;
    
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, "1");

    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    const ref = doc(db, "analytics", "traffic");

    await setDoc(
      ref,
      {
        totalViews: increment(1),
        [`daily.${today}`]: increment(1),
        [`pages.${cleanPath}`]: increment(1),
        lastVisit: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.debug("Analytics track ignored:", err);
  }
}

/**
 * Firestore'dan gerçek analitik verilerini okur
 */
export async function getAnalyticsData() {
  try {
    const ref = doc(db, "analytics", "traffic");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch {
    return null;
  }
}
