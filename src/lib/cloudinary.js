import { getIdToken } from "firebase/auth";
import { auth } from "./firebase";

/**
 * Uploads admin-managed media only via the authenticated server endpoint.
 * Never retries with an unsigned client-side Cloudinary upload preset.
 */
export async function uploadToCloudinary(file, folder = "portfolio") {
  const user = auth.currentUser;
  if (!user) throw new Error("Dosya yüklemek için yönetim panelinde oturum açmalısınız.");

  const idToken = await getIdToken(user);
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await fetch("/api/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${idToken}` },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Dosya yüklenemedi. Sunucu ayarlarını kontrol edin.");
  }

  const fileUrl = data.url || data.secure_url;
  if (!fileUrl) throw new Error("Yükleme tamamlandı ancak dosya bağlantısı alınamadı.");
  return fileUrl;
}
