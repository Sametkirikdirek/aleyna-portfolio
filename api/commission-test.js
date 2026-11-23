/**
 * Vercel Serverless Function - Telegram Bildirim Hattı Test Endpoint'i
 * /api/commission-test
 */

import { requirePortfolioAdmin } from "./_auth.js";

export const config = {
  runtime: "edge",
};

export default async function handler(request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Yalnızca POST istekleri kabul edilir." }, { status: 405 });
  }

  const authorization = await requirePortfolioAdmin(request);
  if (authorization.error) {
    return Response.json({ error: authorization.error }, { status: authorization.status });
  }

  try {
    const { botToken, chatId } = await request.json();

    if (!botToken || !chatId) {
      return Response.json(
        { error: "Lütfen hem Telegram Bot Token'ını hem de Chat ID'nizi girin." },
        { status: 400 }
      );
    }

    const testMessage =
      "🎨 *Aleyna Altunsu Sanat Portfolyosu*\n\n" +
      "🚀 *Tebrikler Samet! Telegram bildirim hattınız başarıyla bağlandı.*\n\n" +
      "Artık web sitesinden bir ziyaretçi özel tuval talebi gönderdiğinde veya bir güvenlik ihlali algılandığında, fotoğrafıyla birlikte anında bu Telegram sohbetine bildirim düşecektir!";

    const res = await fetch(`https://api.telegram.org/bot${botToken.trim()}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId.trim(),
        text: testMessage,
        parse_mode: "Markdown",
      }),
    });

    const resData = await res.json();
    if (!res.ok || !resData.ok) {
      throw new Error(
        resData.description || "Telegram mesajı gönderilemedi. Lütfen Bot Token ve Chat ID'nizi kontrol edin."
      );
    }

    return Response.json({
      success: true,
      message: "🎉 Test mesajı Telegram hesabınıza başarıyla iletildi!",
    });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 400 });
  }
}
