import { useState, useEffect } from "react";
import { HeroSection } from "@/components/ui/hero-section-2";
import { useProfile, useCv, useContact } from "../hooks/useContent";

export default function ContactPage() {
  const { data: profile } = useProfile();
  const { data: cv } = useCv();
  const { data: contact } = useContact();

  const artworks = contact?.artworks || [];

  const socialLinks = [
    { label: "Medium", href: profile?.social?.medium || "#" },
    { label: "GitHub", href: profile?.social?.github || "#" },
    { label: "LinkedIn", href: profile?.social?.linkedin || "#" },
    { label: "Instagram", href: profile?.social?.instagram || "#" },
  ];

  const cvLinks = {
    tr: cv?.tr || profile?.cv?.tr || "/docs/Aleyna_Altunsu_CV_TR.pdf",
    en: cv?.en || profile?.cv?.en || "/docs/Aleyna_Altunsu_CV_EN.pdf",
  };

  const [artwork, setArtwork] = useState(null);

  // Her sayfa açılışında veya artworks güncellendiğinde rastgele bir resim seçilsin
  useEffect(() => {
    if (artworks.length > 0) {
      const randomIndex = Math.floor(Math.random() * artworks.length);
      setArtwork(artworks[randomIndex]);
    }
  }, [artworks]);

  const handleRefreshArtwork = () => {
    if (artworks.length <= 1) return;
    const available = artworks.filter((a) => a.id !== artwork?.id);
    const randomIndex = Math.floor(Math.random() * available.length);
    setArtwork(available[randomIndex]);
  };

  const pageTitle = contact?.title || "Birlikte bir şey";
  const pageTitleHighlight = contact?.titleHighlight || "inşa edelim.";
  const pageSubtitle =
    contact?.subtitle ||
    "İster bir tablo siparişi, ister bir yapay zeka projesi, ister sadece merhaba demek için — kapım açık. Tuval kadar net, kod kadar titiz bir iş birliği için yaz.";
  const ctaText = contact?.ctaText || "E-POSTA GÖNDER";

  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        logo={{
          url: "",
          alt: profile?.name || "Aleyna Altunsu",
          text: profile?.name || "Aleyna Altunsu",
        }}
        slogan={(profile?.roles || ["Yapay Zeka Mühendisi", "Ressam", "Yazar"]).join(" · ").toUpperCase()}
        title={
          <>
            {pageTitle} <br />
            <span className="text-primary">{pageTitleHighlight}</span>
          </>
        }
        subtitle={pageSubtitle}
        callToAction={{
          text: ctaText,
          href: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(profile?.email || "hello@aleynaaltunsu.com")}`,
        }}
        backgroundImage={artwork?.image || ""}
        artwork={artwork || {}}
        onRefreshArtwork={handleRefreshArtwork}
        contactInfo={{
          website: "aleynaaltunsu.com",
          email: profile?.email || "hello@aleynaaltunsu.com",
          address: profile?.location || "İstanbul, Türkiye",
        }}
      />

      <section className="border-t border-border bg-ink px-6 py-10 md:px-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 font-mono text-xs text-paper/50">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-circuit-soft"
              >
                {s.label}
              </a>
            ))}
          </div>
          <p className="font-mono text-[11px] text-paper/30">
            © {new Date().getFullYear()} {profile.name}. Tüm hakları saklıdır.
          </p>
        </div>
      </section>
    </div>
  );
}
