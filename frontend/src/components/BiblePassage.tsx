import { motion } from "framer-motion";
import { weddingConfig } from "../utils/weddingConfig";

export default function BiblePassage() {
  return (
    <section id="pasaje" className="relative overflow-hidden bg-wine px-6 py-28">
      <div className="pointer-events-none absolute inset-0 bg-grain" />
      <div className="pointer-events-none absolute -left-10 -top-10 font-display text-[14rem] italic leading-none text-ivory/5">
        “
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
        className="relative mx-auto max-w-2xl text-center"
      >
        <p className="section-label mb-3 text-gold-light">El amor que nos une</p>
        <p className="font-display text-3xl italic leading-relaxed text-ivory sm:text-4xl">
          “{weddingConfig.pasajeBiblico.texto}”
        </p>
        <div className="ornament-divider mx-auto mt-8 max-w-xs text-gold-light">
          <span className="text-lg">✦</span>
        </div>
        <p className="mt-4 font-body text-sm uppercase tracking-[0.3em] text-gold-light">
          {weddingConfig.pasajeBiblico.referencia}
        </p>
      </motion.div>
    </section>
  );
}
