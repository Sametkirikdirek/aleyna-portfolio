/**
 * Cloudinary üzerinden dosya yükleme yardımcısı.
 * Firebase Storage yerine kullanılır (ücretsiz, kredi kartı gerektirmez).
 *
 * @param {File} file - Yüklenecek dosya (resim veya PDF)
 * @param {string} folder - Cloudinary klasörü (örn: "gallery", "cv", "timeline")
 * @returns {Promise<string>} - Yüklenen dosyanın URL'si
 */
export async function uploadToCloudinary(file, folder = "portfolio") {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "REMOVED_CLOUD_NAME";
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "REMOVED_UPLOAD_PRESET";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Yükleme başarısız");
  }

  const data = await response.json();
  return data.secure_url; // https://res.cloudinary.com/...
}
