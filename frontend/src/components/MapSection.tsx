import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { weddingConfig } from "../utils/weddingConfig";

const { nombreLugar, direccion, lat, lng } = weddingConfig.evento;
const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
const embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;

export default function MapSection() {
  return (
    <section className="bg-sage/10 px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7 }}
        className="mx-auto max-w-4xl text-center"
      >
        <p className="section-label mb-2">{nombreLugar}</p>
        <p className="font-body text-sm text-charcoal/70">{direccion}</p>

        <div className="mt-8 overflow-hidden rounded-2xl border border-gold/20 shadow-sm">
          <iframe
            title={`Ubicación de ${nombreLugar} en el mapa`}
            src={embedUrl}
            width="100%"
            height="420"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <p className="mt-8 font-display text-2xl italic text-wine">
          Te esperamos para compartir juntos este día tan especial.
        </p>

        <a href={directionsUrl} target="_blank" rel="noreferrer" className="btn-primary mt-6">
          Abrir en Google Maps <ExternalLink size={16} />
        </a>
      </motion.div>
    </section>
  );
}
