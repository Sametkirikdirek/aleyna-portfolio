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

export const MAX_DAILY_QUOTA = 3;
export const COOLDOWN_SECONDS = 60;

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
 * 3. Günlük Kota & 1 Dakikalık Cooldown Kontrolü
 * Günde en fazla 3 talep, her talep arası 1 dakika bekleme süresi
 */
export async function checkDailyQuota(fingerprint) {
  const todayKey = new Date().toISOString().slice(0, 10);
  const storageKey = `comm_quota_${fingerprint}_${todayKey}`;
  const legacyRecord = localStorage.getItem(`comm_${fingerprint}_${todayKey}`);

  let record = null;
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      record = JSON.parse(raw);
    } else if (legacyRecord) {
      record = { count: 1, lastTime: Date.now() - 65000, ids: [legacyRecord] };
    }
  } catch {
    record = null;
  }

  // Firestore'dan da yedek kontrol
  if (!record) {
    try {
      const q = query(
        collection(db, "commission_requests"),
        where("deviceHash", "==", fingerprint),
        where("submissionDate", "==", todayKey)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const ids = snap.docs.map((d) => d.id);
        const latestDoc = snap.docs[0].data();
        const latestTime = latestDoc.createdAt?.toMillis?.() || Date.now() - 65000;
        record = { count: snap.docs.length, lastTime: latestTime, ids };
        localStorage.setItem(storageKey, JSON.stringify(record));
      }
    } catch (err) {
      console.warn("Quota check fallback:", err.message);
    }
  }

  const count = record?.count || 0;
  const lastTime = record?.lastTime || 0;
  const remaining = Math.max(0, MAX_DAILY_QUOTA - count);
  const timeElapsed = (Date.now() - lastTime) / 1000;
  const cooldownRemaining = Math.max(0, Math.ceil(COOLDOWN_SECONDS - timeElapsed));

  // 1. Günlük kota (3 talep) doldu mu?
  if (count >= MAX_DAILY_QUOTA) {
    return {
      allowed: false,
      isCooldown: false,
      count,
      remaining: 0,
      reason: `Bugün için ${MAX_DAILY_QUOTA} tuval değerlendirme hakkınızı kullandınız. İlginiz için teşekkürler, yarın yeni bir görsel yükleyebilirsiniz!`,
      lastRequestId: record?.ids?.[record.ids.length - 1],
    };
  }

  // 2. Cooldown (1 dakika) süresi doldu mu?
  if (count > 0 && cooldownRemaining > 0) {
    return {
      allowed: false,
      isCooldown: true,
      cooldownRemaining,
      count,
      remaining,
      reason: `Yeni bir görsel yüklemek için lütfen ${cooldownRemaining} saniye bekleyin. (Kalan hakkınız: ${remaining}/${MAX_DAILY_QUOTA})`,
      lastRequestId: record?.ids?.[record.ids.length - 1],
    };
  }

  return {
    allowed: true,
    count,
    remaining,
    lastRequestId: record?.ids?.[record.ids.length - 1],
  };
}

export function recordQuotaSubmission(fingerprint, requestId) {
  const todayKey = new Date().toISOString().slice(0, 10);
  const storageKey = `comm_quota_${fingerprint}_${todayKey}`;
  let record = { count: 0, lastTime: 0, ids: [] };
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) record = JSON.parse(raw);
  } catch {}

  record.count = (record.count || 0) + 1;
  record.lastTime = Date.now();
  if (!record.ids) record.ids = [];
  record.ids.push(requestId);

  localStorage.setItem(storageKey, JSON.stringify(record));
  localStorage.setItem(`comm_${fingerprint}_${todayKey}`, requestId);
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
