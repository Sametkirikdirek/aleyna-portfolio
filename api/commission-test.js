/**
 * Vercel Serverless Function - WhatsApp Bildirim Hattı Test Endpoint'i
 * /api/commission-test
 */

export const config = {
  runtime: "edge",
};

function formatCallMeBotPhone(phone) {
  if (!phone) return "";
  let clean = phone.replace(/[^\d]/g, "");
  if (clean.startsWith("0")) {
    clean = "90" + clean.slice(1);
  } else if (!clean.startsWith("90") && clean.length === 10) {
    clean = "90" + clean;
  }
  return clean;
}

export default async function handler(request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Yalnızca POST istekleri kabul edilir." }, { status: 405 });
  }

  try {
    const { phone, apiKey } = await request.json();

    if (!phone || !apiKey) {
      return Response.json(
        { error: "Lütfen hem telefon numarasını hem de API anahtarını doldurun." },
        { status: 400 }
      );
    }

    const cleanPhone = formatCallMeBotPhone(phone);
    const testMessage =
      "🎨 *Aleyna Altunsu Portfolyo*\n\n" +
      "✅ *Tebrikler!* WhatsApp bilgi hattınız başarıyla bağlandı.\n\n" +
      "Artık ziyaretçilerden gelen yeni tuval siparişleri ve güvenlik alarmları anında bu hatta iletilecektir.";

    const callMeBotUrl = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(
      cleanPhone
    )}&text=${encodeURIComponent(testMessage)}&apikey=${encodeURIComponent(apiKey.trim())}`;

    const res = await fetch(callMeBotUrl);
    const text = await res.text();

    if (!res.ok || text.toLowerCase().includes("error") || text.toLowerCase().includes("invalid")) {
      return Response.json({
        success: false,
        error:
          "CallMeBot Yanıtı: " +
          (text || "Mesaj iletilemedi. Lütfen numaranızdan bota aktivasyon mesajı gönderdiğinizden emin olun."),
      });
    }

    return Response.json({
      success: true,
      message: "Test mesajı WhatsApp numaranıza başarıyla iletildi!",
      response: text,
    });
  } catch (err) {
    return Response.json(
      { success: false, error: "Sunucu hatası: " + err.message },
      { status: 500 }
    );
  }
}
