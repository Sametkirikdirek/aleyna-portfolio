// Basit, deterministik (seed'e bağlı) sözde-rastgele üretici.
// Aynı seed her zaman aynı deseni üretir — bu sayede her "eser" tutarlı kalır.
export function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Bir seed ve paletten, tuval yerine geçecek soyut bir SVG deseni
// için şekil listesi üretir (gerçek tablo fotoğrafı eklenene kadar
// galeri kartlarında "yer tutucu eser" olarak kullanılır).
export function generateStrokes(seed, palette, count = 6) {
  const rand = mulberry32(seed);
  const strokes = [];
  for (let i = 0; i < count; i++) {
    const x1 = rand() * 100;
    const y1 = rand() * 100;
    const x2 = x1 + (rand() - 0.5) * 70;
    const y2 = y1 + (rand() - 0.5) * 70;
    strokes.push({
      x1,
      y1,
      x2,
      y2,
      width: 4 + rand() * 22,
      color: palette[Math.floor(rand() * palette.length)],
      opacity: 0.55 + rand() * 0.4,
      curve: (rand() - 0.5) * 60,
    });
  }
  return strokes;
}
