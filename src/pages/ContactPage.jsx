import { useState, useEffect } from "react";
import { HeroSection } from "@/components/ui/hero-section-2";
import { useProfile, useContact } from "../hooks/useContent";

export default function ContactPage() {
  const { data: profile } = useProfile();
  const { data: contact } = useContact();

  const artworks = contact?.artworks || [];

  const socialLinks = [
    { label: "Medium", href: profile?.social?.medium || "#" },
    { label: "GitHub", href: profile?.social?.github || "#" },
    { label: "LinkedIn", href: profile?.social?.linkedin || "#" },
    { label: "Instagram", href: profile?.social?.instagram || "#" },
  ];

  const [artwork, setArtwork] = useState(null);

  // Her sayfa açılışında veya artworks güncellendiğinde rastgele bir resim seçilsin
  useEffect(() => {
    if (contact?.artworks && contact.artworks.length > 0) {
      const randomIndex = Math.floor(Math.random() * contact.artworks.length);
      setArtwork(contact.artworks[randomIndex]);
    }
  }, [contact?.artworks]);

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
          email: profile?.email || "hello@aleynaaltunsu.com",
          address: profile?.location || "İstanbul, Türkiye",
        }}
        socialLinks={socialLinks}
      />

      <section className="border-t border-border/40 bg-ink px-6 py-6 md:px-10">
        <div className="mx-auto flex max-w-5xl flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="font-mono text-xs text-paper/50">
            {profile?.name || "Aleyna Altunsu"} · {profile?.location || "İstanbul, Türkiye"}
          </p>
          <p className="font-mono text-[11px] text-paper/35">
            © {new Date().getFullYear()} {profile?.name || "Aleyna Altunsu"}. Tüm hakları saklıdır.
          </p>
        </div>
      </section>
    </div>
  );
}
