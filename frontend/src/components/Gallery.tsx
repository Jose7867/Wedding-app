import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { weddingConfig } from "../utils/weddingConfig";

export default function Gallery() {
  const photos = weddingConfig.galeria;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = () => setActiveIndex(null);
  const prev = () =>
    setActiveIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length));
  const next = () => setActiveIndex((i) => (i === null ? null : (i + 1) % photos.length));

  return (
    <section id="galeria" className="bg-ivory px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeading eyebrow="Un vistazo a nuestro camino" title="Nuestros momentos" />

        <div className="columns-2 gap-4 sm:columns-3 [&>*]:mb-4">
          {photos.map((photo, i) => (
            <motion.button
              key={photo.src}
              type="button"
              onClick={() => setActiveIndex(i)}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              className="group relative block w-full overflow-hidden rounded-xl"
            >
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                className="w-full transform object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-wine/0 transition-colors duration-300 group-hover:bg-wine/20" />
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-charcoal/90 px-4"
            onClick={close}
          >
            <button
              aria-label="Cerrar"
              onClick={close}
              className="absolute right-6 top-6 text-ivory/80 hover:text-ivory"
            >
              <X size={28} />
            </button>

            <button
              aria-label="Anterior"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-4 text-ivory/80 hover:text-ivory sm:left-8"
            >
              <ChevronLeft size={36} />
            </button>

            <motion.img
              key={photos[activeIndex].src}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={photos[activeIndex].src}
              alt={photos[activeIndex].alt}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[80vh] max-w-full rounded-lg object-contain"
            />

            <button
              aria-label="Siguiente"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-4 text-ivory/80 hover:text-ivory sm:right-8"
            >
              <ChevronRight size={36} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
