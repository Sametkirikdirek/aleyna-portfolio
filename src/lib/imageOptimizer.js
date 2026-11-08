/**
 * Image Optimization Utilities
 * 
 * Automatically applies Cloudinary smart delivery transformations:
 * - `f_auto`: Delivers modern WebP/AVIF format based on the user's browser.
 * - `q_auto`: Dynamic visual quality compression (reduces 5-10MB images to ~100-200KB).
 * - `w_{width}`: Responsive downscaling to save mobile bandwidth.
 */

export function getOptimizedImageUrl(url, options = {}) {
  if (!url || typeof url !== "string") return url || "";

  // Cloudinary image URL transformation
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    // Avoid double transforming
    if (url.includes("/f_auto") || url.includes("/q_auto")) {
      return url;
    }

    const {
      width,
      height,
      quality = "auto",
      format = "auto",
      crop = "limit",
    } = options;

    const transformParts = [`f_${format}`, `q_${quality}`];
    if (width) transformParts.push(`w_${width}`);
    if (height) transformParts.push(`h_${height}`);
    if (crop) transformParts.push(`c_${crop}`);

    const transformStr = transformParts.join(",");
    return url.replace("/upload/", `/upload/${transformStr}/`);
  }

  // Non-Cloudinary images returned as-is
  return url;
}

/**
 * Generates an optimal `srcset` string for responsive <img> tags
 */
export function getOptimizedSrcSet(url, widths = [480, 768, 1200, 1600]) {
  if (!url || !url.includes("res.cloudinary.com")) return undefined;

  return widths
    .map((w) => `${getOptimizedImageUrl(url, { width: w })} ${w}w`)
    .join(", ");
}

