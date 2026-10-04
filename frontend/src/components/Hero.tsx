import { motion } from "framer-motion";
import { weddingConfig } from "../utils/weddingConfig";

const fecha = new Date(weddingConfig.fechaBoda);
const fechaFormateada = fecha.toLocaleDateString("es-PE", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function Hero() {
  return (
    <section id="inicio" className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={weddingConfig.fotoPrincipal}
          alt="José y Emma — fotografía de ejemplo, reemplazar por la foto real"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/50 via-charcoal/35 to-ivory" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 mx-auto max-w-3xl px-6 text-center text-ivory"
      >
        <p className="section-label mb-5 text-gold-light">Nos casamos</p>
        <h1 className="font-display text-6xl italic tracking-wide sm:text-8xl">
          {weddingConfig.novios.nombres}
        </h1>
        <p className="mx-auto mt-6 max-w-xl font-display text-xl italic text-ivory/90 sm:text-2xl">
          {weddingConfig.novios.fraseHero}
        </p>
        <p className="mt-6 font-body text-sm uppercase tracking-[0.3em] text-gold-light">
          {fechaFormateada}
        </p>

        <div className="mt-10">
          <a href="#historia" className="btn-primary">
            Conoce nuestra historia
          </a>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-ivory/80"
      >
        <div className="h-9 w-5 rounded-full border border-ivory/60 p-1">
          <div className="mx-auto h-2 w-1 animate-bounce rounded-full bg-ivory" />
        </div>
      </motion.div>
    </section>
  );
}
