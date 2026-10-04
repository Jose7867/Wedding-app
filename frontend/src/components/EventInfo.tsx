import { motion } from "framer-motion";
import { MapPin, Clock, ExternalLink } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { weddingConfig } from "../utils/weddingConfig";

const { nombreLugar, direccion, lat, lng, horaCeremonia } = weddingConfig.evento;
const fecha = new Date(weddingConfig.fechaBoda);
const fechaLarga = fecha.toLocaleDateString("es-PE", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
// Embed sin necesidad de API key (modo "output=embed" de Google Maps).
const embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;

export default function EventInfo() {
  return (
    <section id="evento" className="bg-ivory px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeading eyebrow="Celebremos juntos" title="El gran día" />

        <div className="grid gap-10 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7 }}
            className="flex flex-col justify-center gap-6 rounded-2xl border border-gold/20 bg-white/60 p-8 sm:p-10"
          >
            <div>
              <p className="section-label mb-2">Fecha</p>
              <p className="font-display text-2xl italic capitalize text-wine">{fechaLarga}</p>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="mt-1 shrink-0 text-gold" size={20} />
              <div>
                <p className="section-label mb-1">Hora</p>
                <p className="font-body text-charcoal">{horaCeremonia}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="mt-1 shrink-0 text-gold" size={20} />
              <div>
                <p className="section-label mb-1">Lugar</p>
                <p className="font-display text-xl italic text-wine">{nombreLugar}</p>
                <p className="font-body text-sm text-charcoal/80">{direccion}</p>
              </div>
            </div>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-outline mt-2 w-fit"
            >
              Cómo llegar <ExternalLink size={16} />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7 }}
            className="overflow-hidden rounded-2xl border border-gold/20 shadow-sm"
          >
            <iframe
              title={`Mapa de ${nombreLugar}`}
              src={embedUrl}
              width="100%"
              height="100%"
              style={{ minHeight: 340, border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
