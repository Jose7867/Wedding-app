import { motion } from "framer-motion";

interface Props {
  eyebrow: string;
  title: string;
  light?: boolean;
}

export default function SectionHeading({ eyebrow, title, light }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="mb-10 text-center"
    >
      <p className={`section-label mb-3 ${light ? "text-gold-light" : ""}`}>{eyebrow}</p>
      <h2
        className={`font-display text-4xl sm:text-5xl italic ${
          light ? "text-ivory" : "text-wine"
        }`}
      >
        {title}
      </h2>
      <div className="ornament-divider mt-5">
        <span className="text-lg">❧</span>
      </div>
    </motion.div>
  );
}
