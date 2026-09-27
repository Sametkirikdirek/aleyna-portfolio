/**
 * Vercel Serverless Function - Güvenli Dosya Yükleme Uç Noktası (/api/upload)
 *
 * Cloudinary imzasız yükleme ön ayarı (upload preset) ve hesap adı yalnızca bu
 * sunucu fonksiyonunda saklanır; istemciye (tarayıcıya) asla sızdırılmaz.
 *
 * Güvenlik Önlemleri:
 * - Yalnızca POST istekleri
 * - İzin verilen MIME türleri (Görseller & PDF)
 * - 10MB dosya boyutu sınırı (DDoS & kota tüketim koruması)
 * - Klasör adı sanitizasyonu (Path traversal koruması)
 */

export const config = {
  // Edge runtime: Akış tabanlı FormData desteği ve sıfır cold-start süresi
  runtime: "edge",
};

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
]);

const ALLOWED_FOLDERS = new Set([
  "gallery",
  "profile",
  "timeline",
  "cv",
  "writings",
  "portfolio",
  "temp",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export default async function handler(request) {
  if (request.method !== "POST") {
    return Response.json(
      { error: "Yalnızca POST istekleri kabul edilir" },
      { status: 405 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const rawFolder = formData.get("folder") || "portfolio";

    if (!file || typeof file === "string") {
      return Response.json(
        { error: "Yüklenecek dosya bulunamadı" },
        { status: 400 }
      );
    }

    // 1. Dosya Türü Kontrolü
    const mimeType = (file.type || "").toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return Response.json(
        {
          error: "Geçersiz dosya türü. Yalnızca JPEG, PNG, WEBP, GIF ve PDF yükleyebilirsiniz.",
        },
        { status: 400 }
      );
    }

    // 2. Dosya Boyutu Kontrolü (10MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return Response.json(
        { error: "Dosya boyutu 10MB sınırını aşıyor." },
        { status: 400 }
      );
    }

    // 3. Klasör Adı Sanitizasyonu
    const sanitizedFolder = String(rawFolder).toLowerCase().replace(/[^a-z0-9_-]/g, "");
    const targetFolder = ALLOWED_FOLDERS.has(sanitizedFolder) ? sanitizedFolder : "portfolio";

    // Sunucu tarafı ortam değişkenlerini oku
    const cloudName =
      process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.VITE_CLOUDINARY_CLOUD_NAME ||
      "mxepbe4r";
    const uploadPreset =
      process.env.CLOUDINARY_UPLOAD_PRESET ||
      process.env.VITE_CLOUDINARY_UPLOAD_PRESET ||
      "aleyna_prod_upload";

    const uploadPayload = new FormData();
    uploadPayload.append("file", file);
    uploadPayload.append("upload_preset", uploadPreset);
    uploadPayload.append("folder", targetFolder);

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      {
        method: "POST",
        body: uploadPayload,
      }
    );

    const result = await cloudinaryResponse.json();

    if (!cloudinaryResponse.ok) {
      return Response.json(
        {
          error: result.error?.message || "Cloudinary sunucusuna yükleme başarısız oldu",
        },
        { status: cloudinaryResponse.status || 500 }
      );
    }

    return Response.json({
      url: result.secure_url || result.url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error("API /api/upload hatası:", error);
    return Response.json(
      {
        error: "Dosya yüklenirken sunucuda bir hata oluştu",
        message: error instanceof Error ? error.message : "Bilinmeyen hata",
      },
      { status: 500 }
    );
  }
}
