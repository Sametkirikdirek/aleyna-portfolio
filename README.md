# Aleyna Altunsu — Kişisel Portfolyo

Yapay zeka mühendisi, ressam ve yazar Aleyna Altunsu için hazırlanmış,
React + Vite + Tailwind CSS ile geliştirilmiş, mobil uyumlu ve animasyonlu
tek sayfalık portfolyo sitesi.

## Kurulum

```bash
npm install
npm run dev
```

Tarayıcıda `http://localhost:5173` adresini aç.

## Yayına alma (build)

```bash
npm run build
```

Çıktı `dist/` klasörüne oluşur. Bu klasörü Vercel, Netlify, GitHub Pages
gibi herhangi bir statik hosting servisine yükleyebilirsin.

## İçeriği güncellemek

Sitenin TÜM metinleri (isim, biyografi, tablolar, Medium yazıları, yapay
zeka projeleri, sosyal medya linkleri) tek bir dosyada:

```
src/data/content.js
```

Koda dokunmadan sadece bu dosyadaki değerleri değiştirerek siteyi
güncelleyebilirsin.

### Gerçek tablo fotoğrafı eklemek

Şu an galerideki eserler seed'e dayalı üretimsel (generative) SVG desenlerle
gösteriliyor (`src/components/PaintingCanvas.jsx`). Gerçek fotoğraf eklemek
için:

1. Görseli `public/gallery/` klasörüne koy.
2. `src/data/content.js` içindeki ilgili tabloya `image: "/gallery/eser1.jpg"`
   alanı ekle.
3. `src/components/Gallery.jsx` içinde `PaintingCanvas` yerine `<img>`
   gösterecek şekilde küçük bir koşul ekle (isteğe bağlı).

## Proje yapısı

```
src/
  components/   → Nav, Hero, About, Gallery, Writings, AIWork, Footer
  data/         → content.js (tüm site metinleri)
  utils/        → generative.js (üretimsel galeri desenleri)
  index.css     → Tailwind v4 tema tanımları (renk, font)
```

## Teknolojiler

- React 19 + Vite
- Tailwind CSS v4
- Framer Motion (scroll animasyonları, sayfa geçişleri)
- Lucide React (ikonlar)
