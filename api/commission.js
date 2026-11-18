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

// Telegram Bildirim Gönderici (Firestore Dinamik Ayarları + Telegram Bot API)
async function sendTelegramAlert({ title, details, imageUrl, approveLink, rejectLink }) {
  let botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.VITE_TELEGRAM_BOT_TOKEN;
  let chatId = process.env.TELEGRAM_CHAT_ID || process.env.VITE_TELEGRAM_CHAT_ID;

  // 1. Önce Firestore'daki dinamik admin ayarından oku (settings/telegram)
  try {
    const settingsRes = await fetch(
      "https://firestore.googleapis.com/v1/projects/aleyna-portfolio/databases/(default)/documents/settings/telegram"
    );
    if (settingsRes.ok) {
      const data = await settingsRes.json();
      const dbToken = data.fields?.botToken?.stringValue;
      const dbChatId = data.fields?.chatId?.stringValue;
      const dbEnabled = data.fields?.enabled?.booleanValue;

      if (dbEnabled === false) {
        // Kullanıcı admin panelinden bildirimleri kapattıysa gönderme
        return;
      }
      if (dbToken) botToken = dbToken;
      if (dbChatId) chatId = dbChatId;
    }
  } catch (e) {
    // Firestore okuma hatası olursa env değişkenleriyle devam et
  }

  if (!botToken || !chatId) {
    return;
  }

  let messageText = `*${title}*\n\n${details}`;
  if (approveLink && rejectLink) {
    messageText += `\n\n👇 *Karar Ver (Tek Dokunuş):*\n🟢 [Aleyna'nın Masasına Onayla](${approveLink})\n🔴 [Talebi Reddet](${rejectLink})`;
  }

  try {
    // Eğer görsel varsa doğrudan sendPhoto ile Telegram'a fotoğraf olarak gönder
    if (imageUrl) {
      const photoPayload = {
        chat_id: chatId.trim(),
        photo: imageUrl,
        caption: messageText.slice(0, 1024),
        parse_mode: "Markdown",
      };
      const photoRes = await fetch(`https://api.telegram.org/bot${botToken.trim()}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(photoPayload),
      });
      if (photoRes.ok) return;
    }

    // Fallback: sendPhoto olmazsa sendMessage ile gönder
    await fetch(`https://api.telegram.org/bot${botToken.trim()}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId.trim(),
        text: messageText,
        parse_mode: "Markdown",
        disable_web_page_preview: false,
      }),
    });
  } catch (err) {
    console.warn("Telegram API bildirim hatası:", err.message);
  }
}

// Bellek içi IP hız sınırlayıcı (Rate Limiter: Bot & DoS saldırı engeli)
const rateLimitMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000; // 5 dakika
  const maxRequests = 5; // 5 dakikada en fazla 5 yükleme

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
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
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

    // 4. Şüpheli İçerik / AI Taraması Kontrolü (Simülasyon & Moderasyon kuralları)
    const noteLower = note.toLowerCase();
    const isSuspicious =
      cloudResult.moderation?.some((m) => m.status === "rejected") ||
      /(porn|nude|nsfw|sex|bahis|kumar|hack|saldırı)/i.test(noteLower);

    // Eğer şüpheli veya kural ihlali varsa: ADLİ BİLİŞİM RAPORU OLUŞTUR VE BİLDİR
    if (isSuspicious) {
      // Telegram'a acil güvenlik uyarısı gönder
      await sendTelegramAlert({
        title: "🚨 GÜVENLİK İHLALİ & ŞÜPHELİ İÇERİK ENGELLENDİ!",
        details: `📍 *Konum:* ${city}, ${country}\n🌐 *IP Adresi:* \`${clientIp}\`\n⏰ *Zaman:* ${formattedDate}\n👤 *İletişim:* ${contact || "Belirtilmedi"}\n📝 *Not:* ${note || "Yok"}\n⚠️ *Neden:* AI filtresi içeriği zararlı olarak işaretledi.\n\n📋 *Adli şikayet için tüm kanıt ve loglar moderatör paneline kaydedildi.*`,
        imageUrl,
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
      details: `📍 *Konum:* ${city}, ${country} (\`${clientIp}\`)\n⏰ *Tarih:* ${formattedDate}\n👤 *İletişim:* ${contact || "Girilmedi"}\n📝 *Not:* "${note || "Not eklenmedi."}"`,
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
