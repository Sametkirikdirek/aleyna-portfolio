/**
 * Vercel Serverless Function - Özel Tuval Talebi & Güvenlik/Adli Bilişim Kaydı
 * /api/commission
 */

export const config = {
  runtime: "edge",
};

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

// Varsayılan Telegram Yapılandırması (Canlı Yedek)
const DEFAULT_TELEGRAM_BOT_TOKEN = "9289109254:AAFOEGK0gpFFMsoNZTODU9g3HHYIFmRGQdA";
const DEFAULT_TELEGRAM_CHAT_ID = "8965152099";

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Basit token üretici (Sihirli onay linkleri için)
function generateSecureToken(id) {
  const salt = process.env.MOD_SECRET_SALT || process.env.TELEGRAM_BOT_TOKEN || "AleynaArtCommission2026";
  let hash = 0;
  const str = `${id}#${salt}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

// Telegram Bildirim Gönderici (HTML Parse Mode - Kesintisiz & Güvenli)
async function sendTelegramAlert({ title, city, country, clientIp, formattedDate, contact, note, imageUrl, approveLink, rejectLink, isAlert = false }) {
  let botToken = process.env.TELEGRAM_BOT_TOKEN || DEFAULT_TELEGRAM_BOT_TOKEN;
  let chatId = process.env.TELEGRAM_CHAT_ID || DEFAULT_TELEGRAM_CHAT_ID;

  // 1. Önce Firestore'daki dinamik ayardan oku (content/telegram veya settings/telegram)
  try {
    const endpoints = [
      "https://firestore.googleapis.com/v1/projects/aleyna-portfolio/databases/(default)/documents/content/telegram",
      "https://firestore.googleapis.com/v1/projects/aleyna-portfolio/databases/(default)/documents/settings/telegram",
    ];

    for (const ep of endpoints) {
      try {
        const res = await fetch(ep);
        if (res.ok) {
          const data = await res.json();
          const dbEnabled = data.fields?.enabled?.booleanValue;
          if (dbEnabled === false) return; // Bildirimler kapalıysa çık

          const dbToken = data.fields?.botToken?.stringValue;
          const dbChatId = data.fields?.chatId?.stringValue;
          if (dbToken) botToken = dbToken;
          if (dbChatId) chatId = dbChatId;
          break;
        }
      } catch {}
    }
  } catch (e) {
    // Fallback değerlerle devam et
  }

  if (!botToken || !chatId) {
    return;
  }

  const cleanTitle = escapeHtml(title);
  const cleanCity = escapeHtml(city);
  const cleanCountry = escapeHtml(country);
  const cleanIp = escapeHtml(clientIp);
  const cleanDate = escapeHtml(formattedDate);
  const cleanContact = escapeHtml(contact || "Girilmedi");
  const cleanNote = escapeHtml(note || "Not eklenmedi.");

  let messageHtml = `<b>${cleanTitle}</b>\n\n` +
    `📍 <b>Konum:</b> ${cleanCity}, ${cleanCountry} (<code>${cleanIp}</code>)\n` +
    `⏰ <b>Tarih:</b> ${cleanDate}\n` +
    `👤 <b>İletişim:</b> ${cleanContact}\n` +
    `📝 <b>Not:</b> "${cleanNote}"`;

  if (approveLink && rejectLink) {
    messageHtml += `\n\n👇 <b>Karar Ver (Tek Dokunuş):</b>\n🟢 <a href="${approveLink}">Aleyna'nın Masasına Onayla</a>\n🔴 <a href="${rejectLink}">Talebi Reddet</a>`;
  }

  // Telegram API'ye ilet
  try {
    let sent = false;

    // 1. Eğer görsel varsa doğrudan sendPhoto ile fotoğraf olarak ilet
    if (imageUrl) {
      const photoPayload = {
        chat_id: chatId.trim(),
        photo: imageUrl,
        caption: messageHtml.slice(0, 1024),
        parse_mode: "HTML",
      };
      const photoRes = await fetch(`https://api.telegram.org/bot${botToken.trim()}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(photoPayload),
      });

      if (photoRes.ok) {
        sent = true;
      } else {
        const errDetail = await photoRes.text();
        console.warn("Telegram sendPhoto uyarısı:", errDetail);
      }
    }

    // 2. Fotoğraf gönderilemediyse veya yoksa düz metin mesajı ilet
    if (!sent) {
      const msgRes = await fetch(`https://api.telegram.org/bot${botToken.trim()}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId.trim(),
          text: messageHtml,
          parse_mode: "HTML",
          disable_web_page_preview: false,
        }),
      });

      if (!msgRes.ok) {
        const msgErr = await msgRes.text();
        console.warn("Telegram sendMessage hatası:", msgErr);
      }
    }
  } catch (err) {
    console.warn("Telegram API bağlantı hatası:", err.message);
  }
}

// Bellek içi IP hız sınırlayıcı (Rate Limiter: Bot & DoS saldırı engeli)
const rateLimitMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000; // 5 dakika
  const maxRequests = 10; // 5 dakikada en fazla 10 yükleme

  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }

  record.count += 1;
  return record.count > maxRequests;
}

export default async function handler(request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Yalnızca POST istekleri kabul edilir" }, { status: 405 });
  }

  try {
    // 1. Ziyaretçinin Adli Ağ & Konum Bilgilerini Yakala
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    // Hız Sınırı Kontrolü (DDoS / Flood Koruması)
    if (isRateLimited(clientIp)) {
      return Response.json(
        { error: "Güvenlik uyarısı: Çok fazla istek gönderildi. Lütfen 5 dakika sonra tekrar deneyin." },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const note = formData.get("note") || "";
    const contact = formData.get("contact") || "";
    const deviceHash = formData.get("deviceHash") || "unknown";
    const consent = formData.get("consent") === "true";

    const country =
      request.headers.get("cf-ipcountry") ||
      request.headers.get("x-vercel-ip-country") ||
      "TR";
    const city =
      request.headers.get("cf-ipcity") ||
      request.headers.get("x-vercel-ip-city") ||
      "Bilinmiyor";
    const userAgent = request.headers.get("user-agent") || "Bilinmiyor";
    const timestamp = new Date().toISOString();
    const formattedDate = new Date().toLocaleDateString("tr-TR", {
      timeZone: "Europe/Istanbul",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    if (!file || typeof file === "string") {
      return Response.json({ error: "Lütfen bir referans görseli seçin." }, { status: 400 });
    }

    // 2. MIME & Boyut Kontrolü
    const mimeType = (file.type || "").toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return Response.json(
        { error: "Yalnızca JPG, PNG ve WEBP formatında görseller kabul edilir." },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return Response.json(
        { error: "Görsel boyutu 10MB sınırını aşamaz." },
        { status: 400 }
      );
    }

    // 3. Cloudinary'ye Güvenli Yükleme
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
    uploadPayload.append("folder", "commissions");

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      {
        method: "POST",
        body: uploadPayload,
      }
    );
    const cloudResult = await cloudRes.json();

    if (!cloudRes.ok) {
      return Response.json(
        { error: "Görsel sunucuya aktarılamadı: " + (cloudResult.error?.message || "") },
        { status: 500 }
      );
    }

    const imageUrl = cloudResult.secure_url || cloudResult.url;
    const requestId = `comm_${Date.now()}`;
    const token = generateSecureToken(requestId);

    // 4. Şüpheli İçerik / AI Taraması Kontrolü
    const noteLower = note.toLowerCase();
    const isSuspicious =
      cloudResult.moderation?.some((m) => m.status === "rejected") ||
      /(porn|nude|nsfw|sex|bahis|kumar|hack|saldırı)/i.test(noteLower);

    // Eğer şüpheli veya kural ihlali varsa: ADLİ BİLİŞİM RAPORU OLUŞTUR VE BİLDİR
    if (isSuspicious) {
      await sendTelegramAlert({
        title: "🚨 GÜVENLİK İHLALİ & ŞÜPHELİ İÇERİK ENGELLENDİ!",
        city,
        country,
        clientIp,
        formattedDate,
        contact,
        note: `AI Filtresi Engelledi. Not: ${note}`,
        imageUrl,
        isAlert: true,
      });

      return Response.json(
        {
          error: "Yüklediğiniz içerik genel ahlak ve güvenlik filtrelerimize uymadığı için engellendi. Güvenlik amacıyla IP adresiniz ve işlem kayıt altına alınmıştır.",
          flagged: true,
          incidentId: requestId,
        },
        { status: 403 }
      );
    }

    // 5. Temiz Başvuru: Onay Linklerini Oluştur ve Telegram Bildirimi Gönder
    const host = request.headers.get("host") || "www.aleynaaltunsu.com";
    const proto = host.includes("localhost") ? "http" : "https";
    const approveLink = `${proto}://${host}/api/commission-mod?action=approve&id=${requestId}&token=${token}`;
    const rejectLink = `${proto}://${host}/api/commission-mod?action=reject&id=${requestId}&token=${token}`;

    await sendTelegramAlert({
      title: "🎨 Yeni Özel Tuval Talebi Geldi!",
      city,
      country,
      clientIp,
      formattedDate,
      contact,
      note,
      imageUrl,
      approveLink,
      rejectLink,
    });

    return Response.json({
      success: true,
      requestId,
      token,
      imageUrl,
      status: "mod_pending",
      submissionDate: new Date().toISOString().slice(0, 10),
      ipInfo: {
        ip: clientIp,
        country,
        city,
        formattedDate,
      },
    });
  } catch (error) {
    console.error("API /api/commission hatası:", error);
    return Response.json(
      { error: "İşlem sırasında bir hata oluştu: " + error.message },
      { status: 500 }
    );
  }
}
