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
  // 1. Öncelikli Yöntem: Sunucu tarafı /api/upload uç noktası
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      const fileUrl = data.url || data.secure_url;
      if (fileUrl) return fileUrl;
    } else {
      console.warn(
        "/api/upload uç noktası hata verdi, doğrudan yedek yükleme deneniyor...",
        response.status
      );
    }
  } catch (serverErr) {
    console.warn(
      "/api/upload uç noktasına erişilemedi, doğrudan yedek yükleme deneniyor...",
      serverErr
    );
  }

  // 2. Güvenilir Yedek Yöntem: Doğrudan Cloudinary İmzasız Yükleme
  // Sunucusuz fonksiyon çalışmazsa, Vercel ortam değişkeni eksikse veya soğuk başlangıç hatası olursa devreye girer
  const directPayload = new FormData();
  directPayload.append("file", file);
  directPayload.append("upload_preset", "aleyna_prod_upload");
  directPayload.append("folder", folder);

  const directResponse = await fetch(
    "https://api.cloudinary.com/v1_1/mxepbe4r/auto/upload",
    {
      method: "POST",
      body: directPayload,
    }
  );

  if (!directResponse.ok) {
    let errorMessage = "Dosya yüklenemedi";
    try {
      const errData = await directResponse.json();
      errorMessage = errData.error?.message || errData.message || errorMessage;
    } catch {
      // JSON parse edilemezse varsayılan mesajı kullan
    }
    throw new Error(errorMessage);
  }

  const result = await directResponse.json();
  const fileUrl = result.secure_url || result.url;

  if (!fileUrl) {
    throw new Error("Yükleme tamamlandı ancak dosya bağlantısı alınamadı");
  }

  return fileUrl;
}
