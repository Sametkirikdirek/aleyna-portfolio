/**
 * Güvenli Dosya Yükleme Servisi.
 *
 * İstemci tarafında hiçbir gizli upload_preset veya Cloudinary kimliği tutulmaz.
 * Tüm yüklemeler sunucu tarafındaki güvenli /api/upload uç noktası üzerinden gerçekleştirilir.
 *
 * @param {File} file - Yüklenecek dosya (resim veya PDF)
 * @param {string} folder - Hedef klasör (örn: "gallery", "cv", "timeline", "profile", "writings")
 * @returns {Promise<string>} - Yüklenen dosyanın güvenli URL'si
 */
export async function uploadToCloudinary(file, folder = "portfolio") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = "Dosya yüklenemedi";
    try {
      const errData = await response.json();
      errorMessage = errData.error || errData.message || errorMessage;
    } catch {
      // JSON parse edilemezse varsayılan mesajı kullan
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  const fileUrl = data.url || data.secure_url;

  if (!fileUrl) {
    throw new Error("Yükleme tamamlandı ancak dosya URL'si alınamadı");
  }

  return fileUrl;
}
