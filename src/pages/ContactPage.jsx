import { useState, useEffect } from "react";
import { HeroSection } from "@/components/ui/hero-section-2";
import { profile, contactArtworks } from "../data/content";

const socialLinks = [
  { label: "Medium", href: profile.social.medium },
  { label: "GitHub", href: profile.social.github },
  { label: "LinkedIn", href: profile.social.linkedin },
  { label: "Instagram", href: profile.social.instagram },
];

export default function ContactPage() {
  const [artwork, setArtwork] = useState(() => {
    const randomIndex = Math.floor(Math.random() * contactArtworks.length);
    return contactArtworks[randomIndex];
  });

  // Her sayfa açılışında veya yenilendiğinde rastgele bir resim seçilsin
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * contactArtworks.length);
    setArtwork(contactArtworks[randomIndex]);
  }, []);

  const handleRefreshArtwork = () => {
    const available = contactArtworks.filter((a) => a.id !== artwork?.id);
    const randomIndex = Math.floor(Math.random() * available.length);
    setArtwork(available[randomIndex]);
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        logo={{
          url: "",
          alt: profile.name,
          text: profile.name,
        }}
        slogan={profile.roles.join(" · ").toUpperCase()}
        title={
          <>
            Birlikte bir şey <br />
            <span className="text-primary">inşa edelim.</span>
          </>
        }
        subtitle="İster bir tablo siparişi, ister bir yapay zeka projesi, ister sadece merhaba demek için — kapım açık. Tuval kadar net, kod kadar titiz bir iş birliği için yaz."
        callToAction={{
          text: "E-POSTA GÖNDER",
          href: `mailto:${profile.email}`,
        }}
        backgroundImage={artwork.image}
        artwork={artwork}
        onRefreshArtwork={handleRefreshArtwork}
        contactInfo={{
          website: "aleynaaltunsu.com",
          email: profile.email,
          address: profile.location,
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
