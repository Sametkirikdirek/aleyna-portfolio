// ------------------------------------------------------------------
// Bu dosya sitenin TÜM metin ve içerik verisini barındırır.
// Gerçek bilgileri, görselleri ve linkleri buraya girerek siteyi
// kendi verinle güncelleyebilirsin. Kod tarafına dokunmana gerek yok.
// ------------------------------------------------------------------

export const profile = {
  name: "Aleyna Altunsu",
  roles: ["Ressam", "Yazar", "Yapay Zeka Mühendisi"],
  tagline: "Fırçayla başlayan çizgi, kodda devam ediyor.",
  bio: `Tuvalle düşünen, kelimelerle şekillendiren, algoritmalarla inşa eden bir
  yaratıcıyım. Sanatın sezgisiyle mühendisliğin titizliğini aynı çizginin
  iki ucu olarak görüyorum — biri hissi yakalar, diğeri onu bir sisteme
  dönüştürür.`,
  location: "İstanbul, Türkiye",
  email: "hello@aleynaaltunsu.com",
  social: {
    medium: "https://medium.com/@aleynaaltunsu",
    github: "https://github.com/aleynaaltunsu",
    linkedin: "https://linkedin.com/in/aleynaaltunsu",
    instagram: "https://instagram.com/aleynaaltunsu.art",
  },
};

// Galeri: her eser için bir "seed" veriyoruz; bu seed'e göre soyut,
// üretimsel (generative) bir kapak deseni oluşturuluyor. Gerçek tablo
// fotoğraflarını eklemek için `image: "/gallery/eser1.jpg"` gibi bir
// alan eklemen yeterli — GalleryCard bileşeni varsa görseli, yoksa
// üretimsel deseni gösterecek şekilde ayarlanabilir.
export const paintings = [
  {
    id: "p1",
    title: "Sinir Ağı Rüyası",
    year: "2024",
    medium: "Tuval üzerine akrilik",
    size: "80 × 100 cm",
    seed: 12,
    palette: ["#B5482E", "#6BA3A6", "#F1ECE1"],
    note: "Katmanlı düşünce süreçlerinin fırça darbeleriyle görselleştirilmesi.",
  },
  {
    id: "p2",
    title: "Gece Vardiyası",
    year: "2023",
    medium: "Tuval üzerine yağlı boya",
    size: "60 × 90 cm",
    seed: 47,
    palette: ["#14151A", "#B5482E", "#5B4636"],
    note: "Kod yazarken geçen gecelerden ilham alınmış, sıcak-soğuk kontrastı.",
  },
  {
    id: "p3",
    title: "Kıyı Notları",
    year: "2023",
    medium: "Kağıt üzerine suluboya",
    size: "35 × 50 cm",
    seed: 8,
    palette: ["#6BA3A6", "#F1ECE1", "#8FC0C2"],
    note: "İstanbul Boğazı'nın erken sabah ışığı.",
  },
  {
    id: "p4",
    title: "Değişken İsimleri",
    year: "2022",
    medium: "Tuval üzerine karışık teknik",
    size: "70 × 70 cm",
    seed: 91,
    palette: ["#B5482E", "#D9704F", "#14151A"],
    note: "Yazılım ve dil arasındaki gerilim üzerine bir çalışma.",
  },
  {
    id: "p5",
    title: "Sessiz Model",
    year: "2022",
    medium: "Tuval üzerine akrilik",
    size: "50 × 65 cm",
    seed: 33,
    palette: ["#5B4636", "#F1ECE1", "#B5482E"],
    note: "Eğitilmemiş bir modelin potansiyeli üzerine metafor.",
  },
  {
    id: "p6",
    title: "Ufuk Çizgisi, v2",
    year: "2021",
    medium: "Tuval üzerine yağlı boya",
    size: "100 × 140 cm",
    seed: 65,
    palette: ["#6BA3A6", "#14151A", "#F1ECE1"],
    note: "İlk büyük ölçekli çalışmalarından biri.",
  },
];

// Medium yazıları: gerçek yazılarını eklemek için title/excerpt/url/date
// alanlarını kendi Medium hesabındaki yazılarla değiştir. İstersen ileride
// Medium RSS beslemesinden (medium.com/feed/@kullaniciadi) otomatik
// çekilecek şekilde de genişletilebilir.
export const writings = [
  {
    id: "w1",
    title: "Bir Ressamın Gözünden Transformer Mimarisi",
    excerpt:
      "Dikkat mekanizmasını anlamak için tuvale bakmayı bıraktığım an, kompozisyonun aslında bir ağırlıklandırma problemi olduğunu fark ettim.",
    date: "Haz 2026",
    readTime: "7 dk",
    tag: "Yapay Zeka",
    url: "https://medium.com/@aleynaaltunsu/transformer-mimarisi",
  },
  {
    id: "w2",
    title: "Rengin Matematiği: Palet Seçerken Ne Hesaplıyoruz?",
    excerpt:
      "Tamamlayıcı renkler sadece göze hoş gelmiyor; aralarında ölçülebilir bir gerilim var. Bu yazıda o gerilimi sayılarla anlatıyorum.",
    date: "Mar 2026",
    readTime: "5 dk",
    tag: "Sanat",
    url: "https://medium.com/@aleynaaltunsu/rengin-matematigi",
  },
  {
    id: "w3",
    title: "Prodüksiyonda Bir Öneri Sistemi: Aldığım 6 Ders",
    excerpt:
      "Modelin doğruluğu yeterli değil. Kullanıcı gerçekten bunu mu istiyor, yoksa sadece en kolay tıklanabilir şeyi mi görüyor?",
    date: "Ock 2026",
    readTime: "9 dk",
    tag: "Yapay Zeka",
    url: "https://medium.com/@aleynaaltunsu/oneri-sistemi-dersleri",
  },
  {
    id: "w4",
    title: "Atölye Günlüğü: Bitmemiş Tablolar Üzerine",
    excerpt:
      "Bazı tabloları neden bitirmiyoruz? Belki de bitmemiş olmaları, üzerinde hâlâ düşünüyor olduğumuzun kanıtı.",
    date: "Kas 2025",
    readTime: "4 dk",
    tag: "Sanat",
    url: "https://medium.com/@aleynaaltunsu/bitmemis-tablolar",
  },
];

// Yapay zeka mühendisliği çalışmaları
export const aiProjects = [
  {
    id: "ai1",
    title: "Görsel Stil Transferi için Difüzyon Boru Hattı",
    summary:
      "Sanatçının kendi fırça darbesi verisiyle ince ayar yapılmış bir difüzyon modeli; üretilen görselleri gerçek tuval dokusuyla harmanlayan bir son-işleme katmanı içerir.",
    stack: ["PyTorch", "Diffusers", "CLIP", "ONNX Runtime"],
    year: "2025",
    role: "Model geliştirme & değerlendirme",
    link: "https://github.com/aleynaaltunsu/brushstroke-diffusion",
  },
  {
    id: "ai2",
    title: "Yazı Tonu Analizi ve Öneri Motoru",
    summary:
      "Medium yazılarının tonunu ve okunabilirliğini analiz eden, yazarlara taslak aşamasında geri bildirim veren bir NLP servisi.",
    stack: ["Python", "FastAPI", "spaCy", "Redis"],
    year: "2024",
    role: "Uçtan uca sistem tasarımı",
    link: "https://github.com/aleynaaltunsu/tone-analyzer",
  },
  {
    id: "ai3",
    title: "Gerçek Zamanlı Duygu Haritalama Aracı",
    summary:
      "Canlı ses akışından duygu durumu çıkaran ve bunu üretimsel bir görsel deseniyle eşleştiren düşük gecikmeli bir sistem.",
    stack: ["TensorFlow.js", "WebAudio API", "React"],
    year: "2023",
    role: "Araştırma & prototipleme",
    link: "https://github.com/aleynaaltunsu/emotion-mapper",
  },
];

export const skills = [
  { group: "Yapay Zeka & ML", items: ["PyTorch", "TensorFlow", "LLM Fine-tuning", "Bilgisayarlı Görü", "MLOps"] },
  { group: "Mühendislik", items: ["Python", "React", "FastAPI", "Docker", "AWS"] },
  { group: "Sanat", items: ["Akrilik & Yağlı Boya", "Suluboya", "Dijital İllüstrasyon", "Kompozisyon"] },
];
