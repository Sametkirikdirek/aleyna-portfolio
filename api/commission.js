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

// Basit token üretici (Sihirli WhatsApp onay linkleri için)
function generateSecureToken(id) {
  let hash = 0;
  const str = `${id}#AleynaArtCommission2026`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

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

// WhatsApp Bildirim Gönderici (Firestore Dinamik Ayarları + CallMeBot API)
async function sendWhatsAppAlert({ title, details, imageUrl, approveLink, rejectLink }) {
  let phone = process.env.WHATSAPP_PHONE || process.env.VITE_WHATSAPP_PHONE;
  let apiKey = process.env.WHATSAPP_API_KEY || process.env.VITE_WHATSAPP_API_KEY;

  // 1. Önce Firestore'daki dinamik admin ayarından oku
  try {
    const settingsRes = await fetch(
      "https://firestore.googleapis.com/v1/projects/aleyna-portfolio/databases/(default)/documents/settings/whatsapp"
    );
    if (settingsRes.ok) {
      const data = await settingsRes.json();
      const dbPhone = data.fields?.phone?.stringValue;
      const dbKey = data.fields?.apiKey?.stringValue;
      const dbEnabled = data.fields?.enabled?.booleanValue;

      if (dbEnabled === false) {
        // Kullanıcı admin panelinden bildirimleri kapattıysa gönderme
        return;
      }
      if (dbPhone) phone = dbPhone;
      if (dbKey) apiKey = dbKey;
    }
  } catch (e) {
    // Firestore okuma hatası olursa env değişkenleriyle devam et
  }

  // Varsayılan telefon fallback
  phone = phone || "05050983970";
  const targetPhone = formatCallMeBotPhone(phone);

  if (targetPhone && apiKey) {
    let message = `🎨 *${title}*\n\n${details}`;
    if (imageUrl) message += `\n📸 *Görsel:* ${imageUrl}`;
    if (approveLink && rejectLink) {
      message += `\n\n👇 *Karar Ver (Tek Dokunuş):*\n🟢 *Onayla:* ${approveLink}\n🔴 *Reddet:* ${rejectLink}`;
    }

    try {
      const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(
        targetPhone
      )}&text=${encodeURIComponent(message)}&apikey=${encodeURIComponent(apiKey.trim())}`;
      await fetch(url);
    } catch (err) {
      console.warn("WhatsApp API bildirim hatası:", err.message);
    }
  }
}

export default async function handler(request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Yalnızca POST istekleri kabul edilir" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const note = formData.get("note") || "";
    const contact = formData.get("contact") || "";
    const deviceHash = formData.get("deviceHash") || "unknown";
    const consent = formData.get("consent") === "true";

    // 1. Ziyaretçinin Adli Ağ & Konum Bilgilerini Yakala
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
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
    // Cloudinary moderasyon sonuçları veya tehlikeli anahtar kelimeler
    const noteLower = note.toLowerCase();
    const isSuspicious =
      cloudResult.moderation?.some((m) => m.status === "rejected") ||
      /(porn|nude|nsfw|sex|bahis|kumar|hack|saldırı)/i.test(noteLower);

    // Eğer şüpheli veya kural ihlali varsa: ADLİ BİLİŞİM RAPORU OLUŞTUR VE BİLDİR
    if (isSuspicious) {
      const incidentData = {
        requestId,
        type: "SECURITY_VIOLATION",
        ip: clientIp,
        country,
        city,
        userAgent,
        timestamp,
        formattedDate,
        imageUrl,
        submittedNote: note,
        submittedContact: contact,
        deviceHash,
        flagReason: "AI Moderasyon Kuralı İhlali (Müstehcenlik veya Zararlı İçerik)",
      };

      // WhatsApp'a acil güvenlik uyarısı gönder
      await sendWhatsAppAlert({
        title: "🚨 GÜVENLİK İHLALİ & ŞÜPHELİ İÇERİK ENGELLENDİ!",
        details: `📍 *Konum:* ${city}, ${country}\n🌐 *IP Adresi:* ${clientIp}\n⏰ *Zaman:* ${formattedDate}\n👤 *İletişim:* ${contact || "Belirtilmedi"}\n📝 *Not:* ${note || "Yok"}\n⚠️ *Neden:* AI filtresi içeriği zararlı olarak işaretledi.\n\n📋 *Adli şikayet için tüm kanıt ve loglar arşive kaydedildi.*`,
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

    // 5. Temiz Başvuru: Onay Linklerini Oluştur ve WhatsApp Bildirimi Gönder
    const host = request.headers.get("host") || "www.aleynaaltunsu.com";
    const proto = host.includes("localhost") ? "http" : "https";
    const approveLink = `${proto}://${host}/api/commission-mod?action=approve&id=${requestId}&token=${token}`;
    const rejectLink = `${proto}://${host}/api/commission-mod?action=reject&id=${requestId}&token=${token}`;

    await sendWhatsAppAlert({
      title: "✨ Yeni Özel Tuval Talebi Geldi!",
      details: `📍 *Konum:* ${city}, ${country} (IP: ${clientIp})\n⏰ *Tarih:* ${formattedDate}\n👤 *İletişim:* ${contact || "Girilmedi"}\n📝 *Not:* ${note || "Not eklenmedi."}`,
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
