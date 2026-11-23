/**
 * Authenticate a Firebase ID token with Google's Identity Toolkit.
 * This is server-side authorization; client-side role flags are never trusted.
 * Requires FIREBASE_API_KEY (or VITE_FIREBASE_API_KEY) and ADMIN_UPLOAD_EMAILS
 * to be configured in Vercel. No hidden fallback credentials.
 */
export async function requirePortfolioAdmin(request, { moderatorOnly = false } = {}) {
  const header = request.headers.get("authorization") || "";
  const match = /^Bearer\s+([^\s]+)$/i.exec(header);
  if (!match) return { error: "Oturum gerekli.", status: 401 };

  const apiKey = process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY;
  const allowlistName = moderatorOnly ? "ADMIN_MODERATOR_EMAILS" : "ADMIN_UPLOAD_EMAILS";
  const allowed = (process.env[allowlistName] || "")
    .split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
  if (!apiKey || allowed.length === 0) {
    return { error: "Sunucu yetkilendirme ayarları eksik.", status: 503 };
  }

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: match[1] }),
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!response.ok) return { error: "Geçersiz veya süresi dolmuş oturum.", status: 401 };
    const payload = await response.json();
    const account = payload.users?.[0];
    const email = account?.email?.toLowerCase();
    if (!account?.localId || !email || !allowed.includes(email)) {
      return { error: "Bu işlem için yetkiniz bulunmuyor.", status: 403 };
    }
    return { account };
  } catch {
    return { error: "Kimlik doğrulama servisine erişilemiyor.", status: 503 };
  }
}
