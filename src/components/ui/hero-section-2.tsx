import React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Globe, Mail, MapPin, Sparkles, RefreshCw } from "lucide-react";

type InfoType = "website" | "email" | "address";

const InfoIcon = ({ type }: { type: InfoType }) => {
  const className = "h-5 w-5 shrink-0 text-primary";
  const icons = {
    website: <Globe className={className} />,
    email: <Mail className={className} />,
    address: <MapPin className={className} />,
  };
  return <div className="mr-2 flex shrink-0">{icons[type]}</div>;
};

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
  contactInfo: {
    website: string;
    email: string;
    address: string;
  };
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
            <motion.header className="mb-12" variants={itemVariants}>
              {logo && (
                <div className="flex items-center">
                  {logo.url ? (
                    <img
                      src={logo.url}
                      alt={logo.alt}
                      className="mr-3 h-8 w-8 rounded-full object-cover"
                    />
                  ) : null}
                  <div>
                    {logo.text && (
                      <p className="font-display text-lg font-bold text-foreground">{logo.text}</p>
                    )}
                    {slogan && (
                      <p className="font-mono text-xs tracking-wider text-muted-foreground">{slogan}</p>
                    )}
                  </div>
                </div>
              )}
            </motion.header>

            <motion.main variants={containerVariants}>
              <motion.h1
                className="font-display text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl"
                variants={itemVariants}
              >
                {title}
              </motion.h1>
              <motion.div className="my-6 h-1 w-20 bg-primary" variants={itemVariants} />
              <motion.p
                className="mb-8 max-w-md font-sans text-base leading-relaxed text-muted-foreground"
                variants={itemVariants}
              >
                {subtitle}
              </motion.p>
              <motion.a
                href={callToAction.href}
                className="inline-block font-sans text-lg font-bold tracking-widest text-primary transition-colors hover:text-primary/80"
                variants={itemVariants}
              >
                {callToAction.text}
              </motion.a>
            </motion.main>
          </div>

          <motion.footer className="mt-12 w-full" variants={itemVariants}>
            <div className="grid grid-cols-1 gap-6 font-mono text-xs text-muted-foreground sm:grid-cols-3">
              <div className="flex items-center">
                <InfoIcon type="website" />
                <span>{contactInfo.website}</span>
              </div>
              <div className="flex items-center">
                <InfoIcon type="email" />
                <a href={`mailto:${contactInfo.email}`} className="hover:text-primary transition-colors">
                  {contactInfo.email}
                </a>
              </div>
              <div className="flex items-center">
                <InfoIcon type="address" />
                <span>{contactInfo.address}</span>
              </div>
            </div>
          </motion.footer>
        </div>

        <motion.div
          className="relative min-h-[380px] w-full bg-cover bg-center md:min-h-full md:w-1/2 lg:w-2/5 overflow-hidden group cursor-pointer"
          style={{ backgroundImage: `url(${backgroundImage})` }}
          initial={{ clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)" }}
          animate={{ clipPath: "polygon(0% 0, 100% 0, 100% 100%, 0% 100%)" }}
          transition={{ duration: 1.2, ease: "circOut" }}
          role="img"
          aria-label="İletişim görseli"
          onClick={onRefreshArtwork}
        >
          {/* Sol Alt Köşe Estetik Animasyonlu Eser Kartı */}
          <AnimatePresence mode="wait">
            {artwork && (
              <motion.div
                key={artwork.title}
                initial={{ opacity: 0, y: 30, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                className="absolute bottom-6 left-6 z-20 max-w-[280px] rounded-xl border border-white/20 bg-black/65 p-4 backdrop-blur-md shadow-2xl text-white pointer-events-auto"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                    {artwork.year} · SEÇKİ
                  </span>
                  {onRefreshArtwork && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRefreshArtwork();
                      }}
                      className="p-1 text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/10"
                      title="Görseli Değiştir"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
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
