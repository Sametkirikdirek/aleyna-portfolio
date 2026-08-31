import React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Mail, RefreshCw } from "lucide-react";
import { GithubIcon, LinkedinIcon, InstagramIcon, MediumIcon } from "./SocialIcons";

export interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  logo?: {
    url: string;
    alt: string;
    text?: string;
  };
  slogan?: string;
  title: React.ReactNode;
  subtitle: string;
  callToAction: {
    text: string;
    href: string;
  };
  backgroundImage: string;
  artwork?: {
    id?: string;
    title: string;
    year: string;
    medium: string;
    image: string;
  };
  onRefreshArtwork?: () => void;
  contactInfo?: {
    email?: string;
    address?: string;
  };
  socialLinks?: Array<{
    label: string;
    href: string;
  }>;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
  (
    {
      className,
      logo,
      slogan,
      title,
      subtitle,
      callToAction,
      backgroundImage,
      artwork,
      onRefreshArtwork,
      contactInfo,
      socialLinks,
      ...props
    },
    ref
  ) => {
    return (
      <motion.section
        ref={ref}
        className={cn(
          "relative flex w-full flex-col overflow-hidden bg-background text-foreground md:flex-row min-h-[85vh]",
          className
        )}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        {...props}
      >
        <div className="flex w-full flex-col justify-between p-8 pt-28 md:w-1/2 md:p-12 md:pt-32 lg:w-3/5 lg:p-16 lg:pt-36">
          <div>
            <motion.header className="mb-8 sm:mb-12" variants={itemVariants}>
              {logo && (
                <div className="flex items-center gap-3">
                  {logo.url ? (
                    <img
                      src={logo.url}
                      alt={logo.alt}
                      className="mr-1 h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                  )}
                  <div>
                    {logo.text && (
                      <p className="font-display text-base sm:text-lg font-bold text-foreground">{logo.text}</p>
                    )}
                  </div>
                </div>
              )}
            </motion.header>

            <motion.main variants={itemVariants}>
              {slogan && (
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">
                  {slogan}
                </p>
              )}
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
                {title}
              </h1>
              <motion.div className="my-5 sm:my-6 h-1 w-16 sm:w-20 bg-primary" variants={itemVariants} />
              <motion.p
                className="mb-6 sm:mb-8 max-w-md font-sans text-sm sm:text-base leading-relaxed text-muted-foreground"
                variants={itemVariants}
              >
                {subtitle}
              </motion.p>
              <motion.a
                href={callToAction.href}
                target={callToAction.href?.startsWith("http") ? "_blank" : undefined}
                rel={callToAction.href?.startsWith("http") ? "noopener noreferrer" : undefined}
                className="inline-block font-sans text-base sm:text-lg font-bold tracking-widest text-primary transition-colors hover:text-primary/80"
                variants={itemVariants}
              >
                {callToAction.text}
              </motion.a>
            </motion.main>
          </div>

          <motion.footer className="mt-8 sm:mt-10 w-full pt-6 border-t border-border/40" variants={itemVariants}>
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {/* E-posta Butonu (Amblemli) */}
              {contactInfo?.email && (
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contactInfo.email)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-border/60 bg-background/50 hover:border-primary/60 hover:bg-primary/10 hover:text-foreground text-foreground/80 font-mono text-xs transition-all duration-200 shadow-xs hover:shadow-sm active:scale-95"
                  title="E-posta Gönder"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0 text-primary group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium truncate">{contactInfo.email}</span>
                </a>
              )}

              {/* Sosyal Medya Linkleri: Yan yana Amblemlerle */}
              {socialLinks &&
                socialLinks.map((s) => {
                  const getIcon = (label: string) => {
                    const l = label.toLowerCase();
                    if (l.includes("github")) return <GithubIcon className="w-3.5 h-3.5" />;
                    if (l.includes("linkedin")) return <LinkedinIcon className="w-3.5 h-3.5" />;
                    if (l.includes("instagram")) return <InstagramIcon className="w-3.5 h-3.5" />;
                    if (l.includes("medium")) return <MediumIcon className="w-3.5 h-3.5" />;
                    return null;
                  };
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-border/60 bg-background/50 hover:border-primary/60 hover:bg-primary/10 hover:text-foreground text-foreground/80 font-mono text-xs transition-all duration-200 shadow-xs hover:shadow-sm active:scale-95"
                    >
                      <span className="text-primary group-hover:scale-110 transition-transform duration-200">
                        {getIcon(s.label)}
                      </span>
                      <span className="font-medium">{s.label}</span>
                    </a>
                  );
                })}
            </div>
          </motion.footer>
        </div>

        <motion.div
          className="relative min-h-[280px] sm:min-h-[380px] w-full md:min-h-full md:w-1/2 lg:w-2/5 overflow-hidden group cursor-pointer bg-ink"
          initial={{ clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)" }}
          animate={{ clipPath: "polygon(0% 0, 100% 0, 100% 100%, 0% 100%)" }}
          transition={{ duration: 1.2, ease: "circOut" }}
          role="img"
          aria-label="İletişim görseli"
          onClick={onRefreshArtwork}
        >
          {/* Arka Plan Görseli Animasyonlu Sinematik Geçişi */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={backgroundImage}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${backgroundImage})` }}
            />
          </AnimatePresence>

          {/* Sol Alt Köşe Estetik Animasyonlu Eser Kartı */}
          <AnimatePresence mode="wait">
            {artwork && (
              <motion.div
                key={artwork.title}
                initial={{ opacity: 0, y: 30, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                className="absolute bottom-6 left-6 z-20 max-w-[280px] rounded-xl border border-white/20 bg-black/65 p-4 backdrop-blur-md shadow-2xl text-white pointer-events-auto"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold">
                    {artwork.year} · SEÇKİ
                  </span>
                  {onRefreshArtwork && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRefreshArtwork();
                      }}
                      className="p-1.5 text-white/60 hover:text-white transition-all rounded-full hover:bg-white/10 active:scale-90"
                      title="Görseli Değiştir"
                    >
                      <RefreshCw className="w-3.5 h-3.5 transition-transform duration-500 hover:rotate-180" />
                    </button>
                  )}
                </div>
                <h4 className="font-display text-base font-bold text-white leading-snug">
                  {artwork.title}
                </h4>
                <p className="font-mono text-[11px] text-white/70 mt-1">
                  {artwork.medium}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.section>
    );
  }
);

HeroSection.displayName = "HeroSection";

export { HeroSection };
