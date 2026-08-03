// ------------------------------------------------------------------
// Bu dosya sitenin TÜM metin ve içerik verisini barındırır.
// Gerçek bilgileri, görselleri ve linkleri buraya girerek siteyi
// kendi verinle güncelleyebilirsin. Kod tarafına dokunmana gerek yok.
// ------------------------------------------------------------------

export const profile = {
  name: "Aleyna Altunsu",
  roles: ["Yapay Zeka Mühendisi", "Ressam", "Yazar"],
  tagline: "Fırçayla başlayan çizgi, kodda devam ediyor.",
  bio: `Tuvalle düşünen, kelimelerle şekillendiren, algoritmalarla inşa eden bir mühendis ve sanatçıyım. Sanatın sezgisel ve estetik derinliğiyle yapay zekâ mühendisliğinin matematiksel titizliğini aynı sanatsal üretim sürecinin iki tamamlayıcı yüzü olarak görüyorum — biri duyguyu ve kavramı yakalar, diğeri onu yaşayan sistemlere dönüştürür.`,
  extendedBio: [
    {
      title: "Mühendislik & Yapay Zekâ",
      content: `Derin öğrenme mimarileri (Vision Transformers, LLM Fine-Tuning, Difüzyon Modelleri) ve üretim seviyesi (production-ready) AI sistemleri üzerine odaklanıyorum. PyTorch, FastAPI ve MLOps araçlarıyla karmaşık veri problemlerini ölçeklenebilir, yüksek performanslı mimarilere dönüştürüyorum.`,
    },
    {
      title: "Sanat & Atölye Pratiği",
      content: `Tuval üzerinde akrilik, yağlı boya ve suluboya teknikleriyle insan zihni, katmanlı düşünce süreçleri ve dijital ağların hissettirdiği dokuları görselleştiriyorum. Fırça darbelerimdeki kompozisyon arayışı, kod yazarken kurduğum mimari temizlikle doğrudan besleniyor.`,
    },
    {
      title: "Yazı & Bilgi Paylaşımı",
      content: `Medium ve kişisel blogumda yapay zekâ teknolojilerinin teknik anatomisini (ViT, Swin, RAG, LLM servisleri) ve atölye günlüklerimi kaleme alıyorum. Karmaşık mühendislik kavramlarını ve sanatsal süreçleri berrak bir dille aktarmanın gelişimin en güçlü parçası olduğuna inanıyorum.`,
    },
  ],
  philosophy: "Tuvaldeki kompozisyon ile ekrandaki kod mimarisi arasında kopmaz bir akrabalık var. Sanat sorular sorar ve ifade arar, mühendislik ise o sorulara sistemlerle cevap verir.",
  location: "İstanbul, Türkiye",
  email: "hello@aleynaaltunsu.com",
  cv: {
    tr: "/docs/Aleyna_Altunsu_CV_TR.pdf",
    en: "/docs/Aleyna_Altunsu_CV_EN.pdf",
  },
  social: {
    medium: "https://medium.com/@aleynaaltunsu",
    github: "https://github.com/aleynaaltunsu",
    linkedin: "https://www.linkedin.com/in/aleyna-altunsu/",
    instagram: "https://instagram.com/aleynaaltunsu.art",
  },
};

// İş ve Profesyonel Deneyim Geçmişi (LinkedIn / CV)
export const experiences = [
  {
    id: "exp-1",
    role: "Yapay Zeka Mühendisi",
    company: "Heysem AI",
    location: "Eskişehir",
    period: "2026 — Halen",
    type: "Tam Zamanlı",
    description:
      "ERP finansal süreçleri için Türkçe doğal dil sorgularını SAP B1 OData servislerine dönüştüren multi-agent AI asistanı geliştirdim (CrewAI, LiteLLM, FastAPI, WebSocket). Intent-aware prompt dilimleme ile token kullanımını ~%70 azalttım. CLIP + SegFormer mimarisiyle 2 aşamalı endüstriyel kusur tespiti ve sentetik veri üretimi pipeline'ı kurdum.",
    highlights: [
      "SAP B1 OData Multi-Agent Finansal Asistan",
      "Intent-Aware Prompt Slicing (~%70 Token Tasarrufu)",
      "CLIP + SegFormer Endüstriyel Kusur Tespiti",
      "Deformable Attention & Q-Former Multimodal Ar-Ge",
    ],
    technologies: ["Python", "FastAPI", "CrewAI", "LiteLLM", "PyTorch", "CLIP", "SegFormer", "Docker", "Prometheus"],
  },
  {
    id: "exp-2",
    role: "Yapay Zeka & Veri Bilimi Stajyeri",
    company: "Huawei Ar-Ge Merkezi",
    location: "İstanbul",
    period: "2025",
    type: "Staj",
    description:
      "Dify benzeri AI workflow platformlarının mimari analizine katkıda bulundum. DSPy ile yapılandırılmış prompt programlama modülleri kurarak pipeline'ları otomatik optimize edilebilir hale getirdim. 3+ dilde LLM değerlendirme testleri ve Table-RAG entegrasyon araştırmaları yürüttüm.",
    highlights: [
      "Production-Ready LLM Altyapı Analizi",
      "DSPy ile Yapılandırılmış Prompt Programlama",
      "Çok Dilli (3+ Dil) LLM Değerlendirme Testleri",
      "Table-RAG Yapılandırılmış Veri Araştırması",
    ],
    technologies: ["Python", "DSPy", "LLM Evaluation", "Table-RAG", "Prompt Engineering"],
  },
  {
    id: "exp-3",
    role: "Yapay Zeka Mühendisi Stajyeri — NLP",
    company: "Enqura",
    location: "İstanbul",
    period: "2024",
    type: "Staj",
    description:
      "TF-IDF, BoW, Word2Vec ve FastText vektör temsillerini karşılaştırmalı analize tabi tuttum. LSTM tabanlı duygu analizi modeli ve PyMuPDF + FAISS + LangChain ile PDF belge soru-cevap sistemi kurdum. Kelime gömmelerini 3D uzayda görselleştiren kelime tahmin oyunu geliştirdim.",
    highlights: [
      "NLP Vektör Temsilleri Benchmark (Word2Vec, FastText)",
      "LSTM Duygu Analizi & Ön İşleme Pipeline",
      "PyMuPDF + FAISS + LangChain PDF QA Sistemi",
      "3D Kelime Gömme Görselleştirme Oyunu",
    ],
    technologies: ["Python", "PyTorch", "LSTM", "LangChain", "FAISS", "Word2Vec", "FastText", "PyMuPDF"],
  },
  {
    id: "exp-4",
    role: "Yapay Zeka Stajyeri — Proje Yönetimi",
    company: "SolPro LTD. ŞTİ.",
    location: "Eskişehir",
    period: "2024",
    type: "Staj",
    description:
      "Polimer üretim optimizasyonu ve kalite kontrol için ML tabanlı prediktif bakım sistemlerinin geliştirilmesinde rol aldım. Gemini API kullanarak pazar analizi otomasyonu sağlayan chatbot geliştirdim.",
    highlights: [
      "Polimer Üretimi ML Prediktif Bakım Sistemleri",
      "Gemini API Otomatik Pazar Analizi & Email Chatbotu",
    ],
    technologies: ["Python", "scikit-learn", "Gemini API", "Generative AI", "Data Visualization"],
  },
  {
    id: "exp-5",
    role: "Yapay Zeka Stajyeri — Bilgisayarlı Görü",
    company: "Heysem AI",
    location: "Eskişehir",
    period: "2024",
    type: "Staj",
    description:
      "YOLOv8 & YOLOv10 kullanan nesne tespiti ve yüz tanıma modellerini optimize ettim; eğitim epoch sayısını yarıya indirirken doğruluk metriklerini korudum. Güvenlik kameraları için gerçek zamanlı yüz tanıma tabanlı otomatik yoklama sistemi kurdum.",
    highlights: [
      "YOLOv8 & YOLOv10 Model Optimizasyonu",
      "Gerçek Zamanlı Yüz Tanıma & Otomatik Yoklama Sistemi",
      "Edge Device Voiceover Entegrasyonu",
    ],
    technologies: ["Python", "YOLOv8", "YOLOv10", "OpenCV", "Edge AI", "PyTorch"],
  },
];

export const paintings = [
  {
    id: "eser-1",
    title: "Derin Öğrenme Katmanları",
    year: "2024",
    medium: "Tuval üzerine akrilik ve dijital müdahale",
    seed: 142,
    image: "/gallery/art-1.png",
    note: "Yapay sinir ağlarındaki veri akışının katmanlı renk geçişleriyle tuvale aktarılması.",
  },
  {
    id: "eser-2",
    title: "Algoritmik Rüyalar No. 3",
    year: "2024",
    medium: "Karma teknik",
    seed: 88,
    image: "/gallery/art-2.png",
    note: "Üretimsel modellerin latent uzayındaki biçim arayışının fırça darbeleriyle somutlaşması.",
  },
  {
    id: "eser-3",
    title: "Fırça ve Kod Arasındaki Çizgi",
    year: "2023",
    medium: "Yağlı boya ve akrilik",
    seed: 205,
    image: "/gallery/art-3.png",
    note: "Mühendislik titizliği ile sanatsal serbestliğin tuval yüzeyindeki dengesi.",
  },
  {
    id: "eser-4",
    title: "Piksel ve Pigment",
    year: "2023",
    medium: "Dijital çizim & baskı üzeri akrilik",
    seed: 310,
    image: "/gallery/art-4.png",
    note: "Dijital ekranlardaki piksel yapısının tuvaldeki boya katmanlarıyla diyaloğu.",
  },
  {
    id: "eser-5",
    title: "Latent Harita",
    year: "2023",
    medium: "Tuval üzerine akrilik",
    seed: 512,
    image: "/gallery/art-5.png",
    note: "Çok boyutlu veri uzaylarının iki boyutlu yüzeyde renk kümeleri olarak izdüşümü.",
  },
  {
    id: "eser-6",
    title: "Sessiz Algoritma",
    year: "2022",
    medium: "Suluboya ve mürekkep",
    seed: 740,
    image: "/gallery/art-6.png",
    note: "Kod döngülerinin getirdiği zihinsel odaklanmanın kağıt üzerindeki şeffaf izleri.",
  },
];

export const contactArtworks = [
  {
    year: "2023",
    medium: "Yağlı Boya & Siber Desen",
  },
  {
    id: "ca3",
    title: "Kıyı Notları",
    image: "/gallery/art-3.png",
    year: "2023",
    medium: "Suluboya & Algoritmik Işık",
  },
  {
    id: "ca4",
    title: "Değişken İsimleri",
    image: "/gallery/art-4.png",
    year: "2022",
    medium: "Karışık Teknik & Yazılım",
  },
  {
    id: "ca5",
    title: "Sessiz Model",
    image: "/gallery/art-5.png",
    year: "2022",
    medium: "Akrilik & Fibonacci Spirali",
  },
  {
    id: "ca6",
    title: "Ufuk Çizgisi, v2",
    image: "/gallery/art-6.png",
    year: "2021",
    medium: "Yağlı Boya & Dijital Portre",
  },
  {
    id: "ca7",
    title: "Tuval & Ağ Sentezi",
    image: "/images/contact-bg.png",
    year: "2024",
    medium: "Dijital Yağlı Boya Sentezi",
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

// Yapay zeka mühendisliği çalışmaları — LinkedIn Pinned (Öne Çıkarılanlar) & Production Sistemleri
export const aiProjects = [
  {
    id: "ai-pinned-1",
    title: "SAP B1 OData Multi-Agent Finansal Asistan",
    summary:
      "ERP finansal süreçleri için Türkçe doğal dil sorgularını SAP B1 OData servislerine dönüştüren multi-agent AI asistanı. Intent-aware prompt dilimleme mimarisi ile token kullanımını ~%70 oranında optimize eder.",
    category: "Multi-Agent & LLM",
    pinned: true,
    pinnedTag: "📌 Pinned / Öne Çıkarılan Sistem",
    metric: "~%70 Token Tasarrufu",
    stack: ["FastAPI", "CrewAI", "LiteLLM", "WebSocket", "SAP B1 OData", "Docker"],
    year: "2026",
    role: "Lead AI Architect",
    company: "Heysem AI",
    link: "https://github.com/aleynaaltunsu",
  },
  {
    id: "ai-pinned-2",
    title: "CLIP + SegFormer Endüstriyel Kusur Tespiti",
    summary:
      "Endüstriyel üretim hatlarında yüzey kusurlarını 2 aşamalı yaklaşımla tespit eden, sentetik veri üretimiyle eğitim başarısını artıran bilgisayarlı görü boru hattı.",
    category: "Bilgisayarlı Görü",
    pinned: true,
    pinnedTag: "📌 Pinned / Öne Çıkarılan Ar-Ge",
    metric: "2-Stage Defect Pipeline",
    stack: ["PyTorch", "CLIP", "SegFormer", "OpenCV", "Deformable Attention"],
    year: "2026",
    role: "Computer Vision Engineer",
    company: "Heysem AI",
    link: "https://github.com/aleynaaltunsu",
  },
  {
    id: "ai-pinned-3",
    title: "Vision Transformer Dikkat Savaşları & İncelemesi",
    summary:
      "ViT, Swin Transformer, Deformable Attention, Q-Former ve SegFormer mimarilerinin dikkat mekanizmalarını ve performans matematiğini kıyaslayan kapsamlı teknik makale ve inceleme.",
    category: "Teknik Yayın",
    pinned: true,
    pinnedTag: "📌 Pinned / Öne Çıkarılan Makale",
    metric: "18 dk Teknik İnceleme",
    stack: ["ViT", "Swin Transformer", "Deformable Attention", "Q-Former"],
    year: "2026",
    role: "Araştırmacı & Yazar",
    company: "Medium / Independent",
    link: "https://medium.com/@aleynaaltunsu/vision-transformer-mimarilerinde-dikkat-sava%C5%9Flar%C4%B1-vit-swin-deformable-attention-q-former-ve-c6091a3c9a2f",
  },
  {
    id: "ai-pinned-4",
    title: "DSPy & Table-RAG LLM Altyapı Platformu",
    summary:
      "DSPy ile yapılandırılmış otomatik prompt programlama modülleri ve çok dilli (3+ dil) LLM değerlendirme/benchmark sistemi. Table-RAG ile veri tabanı sorgulama altyapısı.",
    category: "Multi-Agent & LLM",
    pinned: true,
    pinnedTag: "📌 Pinned / Öne Çıkarılan Sistem",
    metric: "3+ Dil LLM Eval",
    stack: ["Python", "DSPy", "Table-RAG", "LLM Evaluation", "Prompt Engineering"],
    year: "2025",
    role: "AI Researcher",
    company: "Huawei Ar-Ge",
    link: "https://github.com/aleynaaltunsu",
  },
  {
    id: "ai-pinned-5",
    title: "NLP 3D Kelime Gömme & FAISS PDF QA Engine",
    summary:
      "Word2Vec ve FastText vektör uzaylarını 3D uzayda görselleştiren kelime tahmin motoru ile PyMuPDF + FAISS + LangChain tabanlı akıllı PDF doküman soru-cevap asistanı.",
    category: "NLP & Vektör",
    pinned: true,
    pinnedTag: "📌 Pinned / Öne Çıkarılan Proje",
    metric: "3D Vector Space",
    stack: ["PyTorch", "LangChain", "FAISS", "Word2Vec", "FastText", "PyMuPDF"],
    year: "2024",
    role: "NLP Research Intern",
    company: "Enqura",
    link: "https://github.com/aleynaaltunsu",
  },
  {
    id: "ai-pinned-6",
    title: "Generative AI Style Transfer & Fine-Tuning Pipeline",
    summary:
      "Sanatçının kendi tuval boya dokularıyla ince ayar yapılmış (fine-tuned) difüzyon modeli; üretilen görselleri gerçek tuval dokusuyla harmanlayan bir son-işleme katmanı.",
    category: "Üretimsel AI & Sanat",
    pinned: true,
    pinnedTag: "📌 Pinned / Öne Çıkarılan Sanat & Kod",
    metric: "Fine-Tuned Diffusion",
    stack: ["PyTorch", "Diffusers", "CLIP", "Fine-Tuning", "ONNX"],
    year: "2025",
    role: "Generative AI Developer",
    company: "Atölye / Personal",
    link: "https://github.com/aleynaaltunsu",
  },
  {
    id: "ai-pinned-7",
    title: "YOLOv8 & YOLOv10 Edge AI Yoklama & Yüz Tanıma",
    summary:
      "Güvenlik kameraları için epoch sayısını yarıya indirirken doğruluk metriklerini koruyan gerçek zamanlı yüz tanıma ve otomatik yoklama kayıt sistemi.",
    category: "Bilgisayarlı Görü",
    pinned: false,
    pinnedTag: "Edge AI Projesi",
    metric: "%50 Epoch Optimizasyonu",
    stack: ["YOLOv8", "YOLOv10", "OpenCV", "Edge AI", "PyTorch"],
    year: "2024",
    role: "Computer Vision Intern",
    company: "Heysem AI",
    link: "https://github.com/aleynaaltunsu",
  },
];


export const skills = [
  { group: "Yapay Zeka & ML", items: ["PyTorch", "TensorFlow", "LLM Fine-tuning", "Bilgisayarlı Görü", "MLOps"] },
  { group: "Mühendislik", items: ["Python", "React", "FastAPI", "Docker", "AWS"] },
  { group: "Sanat", items: ["Akrilik & Yağlı Boya", "Suluboya", "Dijital İllüstrasyon", "Kompozisyon"] },
];
