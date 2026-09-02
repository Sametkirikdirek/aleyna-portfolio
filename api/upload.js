/**
 * Vercel Serverless Function - Güvenli Dosya Yükleme Uç Noktası (/api/upload)
 *
 * Cloudinary imzasız yükleme ön ayarı (upload preset) ve hesap adı yalnızca bu
 * sunucu fonksiyonunda saklanır; istemciye (tarayıcıya) asla sızdırılmaz.
 */

export const config = {
  // Edge runtime: Akış tabanlı FormData desteği ve sıfır cold-start süresi
  runtime: "edge",
};

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
    const folder = formData.get("folder") || "portfolio";

    if (!file) {
      return Response.json(
        { error: "Yüklenecek dosya bulunamadı" },
        { status: 400 }
      );
    }

    // Sunucu tarafı ortam değişkenlerini oku
    const cloudName =
      process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.VITE_CLOUDINARY_CLOUD_NAME ||
      "REMOVED_CLOUD_NAME";
    const uploadPreset =
      process.env.CLOUDINARY_UPLOAD_PRESET ||
      process.env.VITE_CLOUDINARY_UPLOAD_PRESET ||
      "aleyna_prod_upload";

    const uploadPayload = new FormData();
    uploadPayload.append("file", file);
    uploadPayload.append("upload_preset", uploadPreset);
    uploadPayload.append("folder", folder);

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
