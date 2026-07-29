const MEDIUM_FEED = "https://medium.com/feed/@aleynaaltunsu";

const MONTHS_TR = [
  "Ock",
  "Sub",
  "Mar",
  "Nis",
  "May",
  "Haz",
  "Tem",
  "Agu",
  "Eyl",
  "Eki",
  "Kas",
  "Ara",
];

function decodeHtml(text) {
  return text
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtml(html) {
  return decodeHtml(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function formatDate(pubDate) {
  if (!pubDate) return "";
  const date = new Date(pubDate);
  return `${MONTHS_TR[date.getMonth()]} ${date.getFullYear()}`;
}

function estimateReadTime(text) {
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} dk`;
}

function pickTag(categories) {
  const joined = categories.join(" ").toLowerCase();
  if (joined.includes("nlp") || joined.includes("doğal-dil")) return "NLP";
  if (
    joined.includes("face") ||
    joined.includes("yüz") ||
    joined.includes("bilgisayarlı-görü") ||
    joined.includes("yolo")
  ) {
    return "Bilgisayarlı Görü";
  }
  return "Yapay Zeka";
}

function normalizeTitle(title) {
  return title
    .replace(/\s*\n\s*/g, ": ")
    .replace(/:\s*\(\s*/g, ": ")
    .replace(/\)\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanLink(link) {
  return link.split("?")[0];
}

function slugFromUrl(url) {
  const parts = url.split("/");
  return parts[parts.length - 1] || `post-${Date.now()}`;
}

export async function fetchMediumPosts() {
  const response = await fetch(MEDIUM_FEED, {
    headers: { "User-Agent": "aleyna-portfolio/1.0" },
  });

  if (!response.ok) {
    throw new Error(`Medium feed error: ${response.status}`);
  }

  const xml = await response.text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => match[1]);

  return items.map((item) => {
    const title = normalizeTitle(
      (item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || [])[1] || ""
    );
    const link = cleanLink((item.match(/<link>(.*?)<\/link>/) || [])[1] || "");
    const pubDate = (item.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1];
    const categories = [
      ...item.matchAll(/<category><!\[CDATA\[(.*?)\]\]><\/category>/g),
    ].map((match) => match[1]);
    const content =
      (item.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/) ||
        [])[1] || "";
    const plainText = stripHtml(content);
    const excerpt =
      plainText.length > 220 ? `${plainText.slice(0, 220).trim()}…` : plainText;

    return {
      id: slugFromUrl(link),
      title,
      excerpt,
      date: formatDate(pubDate),
      readTime: estimateReadTime(plainText),
      tag: pickTag(categories),
      url: link,
    };
  });
}
