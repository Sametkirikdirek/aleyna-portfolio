import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
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
