import { motion } from "framer-motion";
import { useCountdown } from "../hooks/useCountdown";
import { weddingConfig } from "../utils/weddingConfig";

const units: { key: "dias" | "horas" | "minutos" | "segundos"; label: string }[] = [
  { key: "dias", label: "Días" },
  { key: "horas", label: "Horas" },
  { key: "minutos", label: "Minutos" },
  { key: "segundos", label: "Segundos" },
];

export default function Countdown() {
  const countdown = useCountdown(weddingConfig.fechaBoda);

  return (
    <section className="bg-ivory px-6 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="section-label mb-3">Cada vez falta menos</p>
        <div className="ornament-divider mb-10">
          <span className="text-lg">♡</span>
        </div>

        {countdown.finalizado ? (
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="font-display text-4xl italic text-wine sm:text-5xl"
          >
            ¡Hoy celebramos nuestro amor!
          </motion.p>
        ) : (
          <div className="grid grid-cols-4 gap-3 sm:gap-6">
            {units.map((u) => (
              <div
                key={u.key}
                className="rounded-2xl border border-gold/20 bg-white/60 py-6 sm:py-8"
              >
                <p className="font-display text-4xl text-wine sm:text-5xl">
                  {String(countdown[u.key]).padStart(2, "0")}
                </p>
                <p className="mt-2 text-xs uppercase tracking-widest text-charcoal/60">
                  {u.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
