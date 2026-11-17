import { db } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";

/**
 * 1. Gizli Sekme Dahil Sabit Kalan Donanımsal Cihaz Parmak İzi (Fingerprint)
 * WebGL GPU motoru + Canvas çizim izi + Ekran çözünürlüğü + Sistem dili
 */
export async function getDeviceFingerprint() {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial', sans-serif";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.fillText("Aleyna-Studio-Auth", 2, 15);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText("Art-Fingerprint", 4, 17);
    }
    const canvasHash = canvas.toDataURL();

    // WebGL Renderer Bilgisi (Grafik Kartı Modeli)
    let glInfo = "gl-generic";
    try {
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (gl) {
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
          glInfo = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "";
        }
      }
    } catch {
      // ignore
    }

    const rawId = [
      screen.width,
      screen.height,
      screen.colorDepth,
      navigator.language || "",
      navigator.hardwareConcurrency || 4,
      glInfo,
      canvasHash.slice(-50),
    ].join("###");

    // Basit ve hızlı 32-bit hash
    let hash = 0;
    for (let i = 0; i < rawId.length; i++) {
      hash = (hash << 5) - hash + rawId.charCodeAt(i);
      hash |= 0;
    }
    return `dev_${Math.abs(hash).toString(36)}`;
  } catch (err) {
    return `dev_${Date.now().toString(36)}`;
  }
}

/**
 * 2. EXIF / GPS Konum Verilerini Tamamen Kazıma (Canvas Redraw)
 * Fotoğrafı HTML5 Canvas'a yeniden çizerek tüm gömülü GPS ve EXIF etiketlerini sıfırlar.
 */
export async function stripExifAndOptimize(file, maxDimension = 1800) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(file);

        // Çizim işlemi tüm EXIF/GPS meta verilerini doğal olarak yok eder
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);
            const cleanFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(cleanFile);
          },
          "image/jpeg",
          0.9
        );
      };
      img.onerror = reject;
      img.src = e.target?.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 3. Günlük Kota Kontrolü (Aynı cihazdan günde yalnızca 1 talep)
 */
export async function checkDailyQuota(fingerprint) {
  const todayKey = new Date().toISOString().slice(0, 10);
  const localRecord = localStorage.getItem(`comm_${fingerprint}_${todayKey}`);
  if (localRecord) {
    return {
      allowed: false,
      reason: "Bugün için 1 tuval değerlendirme hakkınızı kullandınız. Sanatçının incelemesi tamamlanana kadar yeni talep gönderilemez.",
      existingId: localRecord,
    };
  }

  try {
    const q = query(
      collection(db, "commission_requests"),
      where("deviceHash", "==", fingerprint),
      where("submissionDate", "==", todayKey)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docData = snap.docs[0].data();
      localStorage.setItem(`comm_${fingerprint}_${todayKey}`, snap.docs[0].id);
      return {
        allowed: false,
        reason: "Bugün için 1 tuval değerlendirme hakkınızı kullandınız. Mevcut talebinizin durumunu aşağıdan takip edebilirsiniz.",
        existingId: snap.docs[0].id,
        existingData: docData,
      };
    }
  } catch (err) {
    console.warn("Quota check fallback:", err.message);
  }

  return { allowed: true };
}

/**
 * 4. Mevcut Talebin Durumunu Canlı Dinleme
 */
export function subscribeToRequestStatus(requestId, callback) {
  if (!requestId) return () => {};
  const docRef = doc(db, "commission_requests", requestId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    }
  });
}
