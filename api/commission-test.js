/**
 * Telegram notification smoke test.
 * Only authenticated moderators can invoke this endpoint.
 * Secrets are read exclusively from Vercel server-side environment variables.
 */
import { requirePortfolioAdmin } from "./_auth.js";

export const config = { runtime: "edge" };

export default async function handler(request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Yalnızca POST istekleri kabul edilir." }, { status: 405 });
  }

  const authorization = await requirePortfolioAdmin(request, { moderatorOnly: true });
  if (authorization.error) {
    return Response.json({ error: authorization.error }, { status: authorization.status });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) {
    return Response.json(
      { error: "Vercel ortam değişkenlerinde TELEGRAM_BOT_TOKEN ve TELEGRAM_CHAT_ID tanımlanmalıdır." },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "🎨 Aleyna Altunsu Portfolyo\n\n✅ Güvenli Telegram test bildirimi başarıyla gönderildi.",
        disable_web_page_preview: true,
      }),
    });

    const result = await response.json();
    if (!response.ok || !result.ok) {
      return Response.json({ error: "Telegram gönderimi başarısız. Vercel ayarlarını kontrol edin." }, { status: 502 });
    }
    return Response.json({ success: true, message: "Test bildirimi Telegram'a iletildi." });
  } catch {
    return Response.json({ error: "Telegram servisine bağlanılamıyor." }, { status: 502 });
  }
}
