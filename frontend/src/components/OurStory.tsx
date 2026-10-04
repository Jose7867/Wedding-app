import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";
import { weddingConfig } from "../utils/weddingConfig";

export default function OurStory() {
  return (
    <section id="historia" className="bg-ivory px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <SectionHeading eyebrow="Un poco sobre nosotros" title="Nuestra historia" />

        <div className="relative mt-16 space-y-16 before:absolute before:left-4 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-gold/30 sm:before:left-1/2">
          {weddingConfig.historia.map((momento, i) => (
            <motion.div
              key={momento.titulo}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className={`relative flex flex-col gap-3 pl-12 sm:w-1/2 sm:pl-0 sm:pr-12 ${
                i % 2 === 1 ? "sm:ml-auto sm:pl-12 sm:pr-0 sm:text-left" : "sm:text-right"
              }`}
            >
              <span className="absolute left-2.5 top-1.5 h-2.5 w-2.5 rounded-full bg-gold sm:left-auto sm:right-[-5px] sm:top-1.5 sm:translate-x-1/2" />
              <p className="section-label">{`0${i + 1}`}</p>
              <h3 className="font-display text-2xl italic text-wine">{momento.titulo}</h3>
              <p className="font-body text-sm leading-relaxed text-charcoal/80">
                {momento.texto}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
