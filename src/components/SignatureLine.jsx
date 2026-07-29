import { motion } from "framer-motion";

// Sayfanın imza öğesi: soldan sağa, organik bir fırça darbesi olarak
// başlayıp sağ tarafta keskin, dik açılı bir "devre" hattına dönüşen
// tek bir çizgi. Sanat <-> mühendislik geçişini simgeliyor.
export default function SignatureLine({ variant = "light", className = "" }) {
  const stroke = variant === "light" ? "var(--color-paper)" : "var(--color-ink)";

  return (
    <svg
      viewBox="0 0 1000 80"
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <motion.path
        d="M 0 40
           C 60 10, 120 70, 190 45
           C 260 20, 310 60, 380 42
           L 460 42
           L 460 15
           L 540 15
           L 540 65
           L 620 65
           L 620 30
           L 700 30
           L 700 50
           L 800 50
           L 800 20
           L 1000 20"
        fill="none"
        stroke={stroke}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1.6, ease: "easeInOut" }}
      />
    </svg>
  );
}
