/**
 * Vercel Serverless Function - Telegram Sihirli Onay / Red Linki İşleyicisi
 * /api/commission-mod
 */

export const config = {
  runtime: "edge",
};

function generateSecureToken(id) {
  let hash = 0;
  const str = `${id}#AleynaArtCommission2026`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export default async function handler(request) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");
  const id = url.searchParams.get("id");
  const token = url.searchParams.get("token");

  // Güvenlik doğrulaması
  if (!id || !token || token !== generateSecureToken(id)) {
    return new Response(
      `<!DOCTYPE html>
      <html lang="tr">
        <head>
          <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Geçersiz İstek</title>
          <style>
            body { background: #0d0d12; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
            .box { padding: 30px; border-radius: 20px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); max-width: 400px; }
            h2 { color: #f43f5e; }
          </style>
        </head>
        <body>
          <div class="box">
            <h2>⛔ Geçersiz veya Süresi Dolmuş Link</h2>
            <p style="color: #aaa; font-size: 14px;">Bu onay linkinin güvenlik anahtarı doğrulanamadı.</p>
          </div>
        </body>
      </html>`,
      { status: 403, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  const isApprove = action === "approve";
  const newStatus = isApprove ? "artist_review" : "rejected";

  // Firestore REST API ile durumu güncelle
  try {
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/aleyna-portfolio/databases/(default)/documents/commission_requests/${id}?updateMask.fieldPaths=status&updateMask.fieldPaths=modActionDate`;
    await fetch(firestoreUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          status: { stringValue: newStatus },
          modActionDate: { stringValue: new Date().toISOString() },
        },
      }),
    });
  } catch (err) {
    console.warn("Firestore update error:", err.message);
  }

  const statusTitle = isApprove ? "✅ Talep Onaylandı!" : "❌ Talep Reddedildi";
  const statusDesc = isApprove
    ? "Görsel güvenlik süzgecinden başarıyla geçti ve <strong>Aleyna'nın çalışma masasına (Admin Paneli)</strong> aktarıldı."
    : "Görsel reddedildi ve arşive kaldırıldı. Aleyna'nın paneline asla iletilmeyecektir.";
  const badgeColor = isApprove ? "#10b981" : "#f43f5e";

  return new Response(
    `<!DOCTYPE html>
    <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${statusTitle} - Aleyna Altunsu Atölye</title>
        <style>
          body {
            background: #0f1015;
            color: #f1ece1;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
          }
          .card {
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 36px 28px;
            max-width: 420px;
            text-align: center;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          }
          .icon-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: ${badgeColor}22;
            border: 1px solid ${badgeColor}55;
            font-size: 28px;
            margin-bottom: 20px;
          }
          h2 { margin: 0 0 12px; font-size: 22px; color: #fff; font-weight: 700; }
          p { margin: 0 0 24px; font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.6; }
          .meta {
            background: rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.06);
            border-radius: 12px;
            padding: 12px;
            font-family: monospace;
            font-size: 11px;
            color: rgba(255,255,255,0.5);
            margin-bottom: 20px;
          }
          .btn {
            display: inline-block;
            background: rgba(255,255,255,0.1);
            color: #fff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 600;
            transition: all 0.2s;
          }
          .btn:hover { background: rgba(255,255,255,0.2); }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon-badge">${isApprove ? "🎨" : "🗑️"}</div>
          <h2>${statusTitle}</h2>
          <p>${statusDesc}</p>
          <div class="meta">
            Talep No: ${id}<br>
            Tarih: ${new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}
          </div>
          <a href="/admin" class="btn">Admin Paneline Git →</a>
        </div>
      </body>
    </html>`,
    {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }
  );
}
