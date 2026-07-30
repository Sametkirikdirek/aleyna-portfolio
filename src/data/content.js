// ------------------------------------------------------------------
// Bu dosya sitenin TÜM metin ve içerik verisini barındırır.
// Gerçek bilgileri, görselleri ve linkleri buraya girerek siteyi
// kendi verinle güncelleyebilirsin. Kod tarafına dokunmana gerek yok.
// ------------------------------------------------------------------

export const profile = {
  name: "Aleyna Altunsu",
  roles: ["Yapay Zeka Mühendisi", "Ressam", "Yazar"],
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
    linkedin: "https://www.linkedin.com/in/aleyna-altunsu/",
    instagram: "https://instagram.com/aleynaaltunsu.art",
  },
};

// Galeri: her eser için bir "seed" veriyoruz; bu seed'e göre soyut,
// üretimsel (generative) bir kapak deseni oluşturuluyor. Gerçek tablo
// fotoğraflarını eklemek için `image: "/gallery/eser1.jpg"` gibi bir
// alan eklemen yeterli — GalleryCard bileşeni varsa görseli, yoksa
// üretimsel deseni gösterecek şekilde ayarlanabilir.
export const galleryImagesPool = [
  "/gallery/art-1.png",
  "/gallery/art-2.png",
  "/gallery/art-3.png",
  "/gallery/art-4.png",
  "/gallery/art-5.png",
  "/gallery/art-6.png",
];

export const paintings = [
  {
    id: "p1",
    title: "Sinir Ağı Rüyası",
    year: "2024",
    medium: "Tuval üzerine akrilik & AI stili",
    size: "80 × 100 cm",
    image: "/gallery/art-1.png",
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
    image: "/gallery/art-2.png",
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
    image: "/gallery/art-3.png",
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
    image: "/gallery/art-4.png",
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
    image: "/gallery/art-5.png",
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
    image: "/gallery/art-6.png",
    seed: 65,
    palette: ["#6BA3A6", "#14151A", "#F1ECE1"],
    note: "İlk büyük ölçekli çalışmalarından biri.",
  },
];

// Medium yazıları — otomatik RSS ile çekilir; ağ hatasında yedek liste.
export const mediumWritingsFallback = [
  {
    id: "w1",
    title:
      "Vision Transformer Mimarilerinde Dikkat Savaşları: ViT, Swin, Deformable Attention, Q-Former ve…",
    excerpt:
      "Hepsi “attention” kullanıyor. Ama hiçbiri aynı sorunu çözmüyor. ViT, Swin, Deformable Attention ve SegFormer mimarilerini tek çatı altında karşılaştıran kapsamlı bir rehber.",
    date: "Nis 2026",
    readTime: "18 dk",
    tag: "Yapay Zeka",
    url: "https://medium.com/@aleynaaltunsu/vision-transformer-mimarilerinde-dikkat-sava%C5%9Flar%C4%B1-vit-swin-deformable-attention-q-former-ve-c6091a3c9a2f",
  },
  {
    id: "w2",
    title:
      "Model Değil, Sistem İnşa Ediyoruz: FastAPI, LLM ve Production Gerçekleriyle Yapay Zekâ Servisleri",
    excerpt:
      "Yapay zekâ projelerinin büyük bir kısmı etkileyici notebook'larla başlar; ancak önemli bir kısmı gerçek dünya senaryolarında production'a taşınamadan kalır.",
    date: "Mar 2026",
    readTime: "12 dk",
    tag: "Yapay Zeka",
    url: "https://medium.com/@aleynaaltunsu/model-de%C4%9Fil-sistem-i%CC%87n%C5%9Fa-ediyoruz-fastapi-llm-ve-production-ger%C3%A7ekleriyle-yapay-zek%C3%A2-servisleri-30b5896b202b",
  },
  {
    id: "w3",
    title:
      "NeurIPS 2025'in Anatomisi: Yapay Zekada Yeni Bir Çağın Dört Sütunu ve Mimari Devrim",
    excerpt:
      "Model mimarisi, gradyan akışı ve genelleme teorileriyle yaşayan profesyoneller için NeurIPS 2025'in öne çıkan trendlerine derinlemesine bir bakış.",
    date: "Ock 2026",
    readTime: "14 dk",
    tag: "Yapay Zeka",
    url: "https://medium.com/@aleynaaltunsu/neurips-2025in-anatomisi-yapay-zekada-yeni-bir-%C3%A7a%C4%9F%C4%B1n-d%C3%B6rt-s%C3%BCtunu-ve-mimari-devrim-fbcebb55be87",
  },
  {
    id: "w4",
    title: "Kurumsal Yapay Zekâ Sistemlerinde Yeni Çağ",
    excerpt:
      "RAG, GPU optimizasyonu ve agentic mimari ile ölçeklenebilir LLM platformları tasarlamak üzerine kurumsal yapay zekâ perspektifi.",
    date: "Ara 2025",
    readTime: "11 dk",
    tag: "Yapay Zeka",
    url: "https://medium.com/@aleynaaltunsu/kurumsal-yapay-zek%C3%A2-sistemlerinde-yeni-%C3%A7a%C4%9F-e58881c52058",
  },
  {
    id: "w5",
    title: "Derin Öğrenmede Ön Eğitim (Pretraining) ve İnce Ayar (Fine-Tuning)",
    excerpt:
      "LLM'lerde pretraining ve fine-tuning süreçlerini, yöntemlerini ve pratik uygulamalarını adım adım açıklayan teknik bir kılavuz.",
    date: "Kas 2024",
    readTime: "10 dk",
    tag: "Yapay Zeka",
    url: "https://medium.com/kurumsal-gelisim/derin-%C3%B6%C4%9Frenmede-%C3%B6n-e%C4%9Fitim-pretraining-ve-i%CC%87nne-ayar-fine-tuning-6417e2914075",
  },
  {
    id: "w6",
    title: "NLP'de Vektör, Embedding ve Encoder: Kıyaslamalı Bir Kılavuz",
    excerpt:
      "BoW, TF-IDF, Word2Vec, GloVe ve FastText gibi temsil yöntemlerini karşılaştıran, NLP'ye giriş için kapsamlı bir rehber.",
    date: "Eki 2024",
    readTime: "9 dk",
    tag: "NLP",
    url: "https://medium.com/kurumsal-gelisim/nlpde-vekt%C3%B6r-embedding-ve-encoder-k%C4%B1yaslamal%C4%B1-bir-k%C4%B1lavuz-ec09b30d6619",
  },
  {
    id: "w7",
    title: "Doğal Dil İşleme (NLP) Tarihçesi ve Kıyaslaması",
    excerpt:
      "İnsan dilini bilgisayarlar tarafından anlamlandırma teknolojisinin tarihsel gelişimi ve temel yaklaşımların karşılaştırması.",
    date: "Eyl 2024",
    readTime: "8 dk",
    tag: "NLP",
    url: "https://medium.com/kurumsal-gelisim/do%C4%9Fal-dil-i%CC%87%C5%9Fleme-nlp-tarih%C3%A7esi-ve-k%C4%B1yaslamas%C4%B1-475f2c971400",
  },
  {
    id: "w8",
    title: "Yüz Tanıma ve Yoklama Alma Sistemleri Projesi Üzerine Rapor",
    excerpt:
      "Yüz tanıma teknolojisinin yoklama sistemlerindeki uygulaması, proje mimarisi ve gerçek dünya senaryoları üzerine teknik rapor.",
    date: "Tem 2024",
    readTime: "7 dk",
    tag: "Bilgisayarlı Görü",
    url: "https://medium.com/@aleynaaltunsu/y%C3%BCz-tan%C4%B1ma-ve-yoklama-alma-sistemleri-projesi-%C3%BCzerine-rapor-9f4f9fa712f0",
  },
];

// Kişisel yazılar — Medium dışında, doğrudan burada yönetilir.
// url alanı boş bırakılırsa yazı sitede listelenir (harici link yok).
export const personalWritings = [
  {
    id: "p1",
    title: "Atölye Günlüğü: Bitmemiş Tablolar Üzerine",
    excerpt:
      "Bazı tabloları neden bitirmiyoruz? Belki de bitmemiş olmaları, üzerinde hâlâ düşünüyor olduğumuzun kanıtı. Tuvalde bırakılan boşluklar bazen en dürüst cümlelerdir.",
    date: "Haz 2026",
    readTime: "4 dk",
    tag: "Atölye",
  },
  {
    id: "p2",
    title: "Rengin Matematiği: Palet Seçerken Ne Hesaplıyoruz?",
    excerpt:
      "Tamamlayıcı renkler sadece göze hoş gelmiyor; aralarında ölçülebilir bir gerilim var. Fırçayı elime almadan önce zihnimde dönen o denklemleri anlatıyorum.",
    date: "Mar 2026",
    readTime: "5 dk",
    tag: "Sanat",
  },
  {
    id: "p3",
    title: "Bir Ressamın Not Defteri: Kompozisyon ve Kod",
    excerpt:
      "Tuvaldeki altın oran ile ekrandaki grid sistemi arasında garip bir akrabalık var. İki disiplinin aynı soruya farklı dillerde cevap verdiğini düşünüyorum.",
    date: "Ock 2026",
    readTime: "6 dk",
    tag: "Düşünce",
  },
  {
    id: "p4",
    title: "Gece Vardiyasından Sabah Işığına",
    excerpt:
      "Kod yazarken geçen gecelerin rengi ile tuvalde yakaladığım sabah ışığı birbirine benziyor mu? Atölye ile masam arasındaki o ince çizgide yürürken tuttuğum notlar.",
    date: "Kas 2025",
    readTime: "3 dk",
    tag: "Atölye",
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
