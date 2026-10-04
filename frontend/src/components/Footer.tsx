import { weddingConfig } from "../utils/weddingConfig";

export default function Footer() {
  return (
    <footer className="bg-charcoal px-6 py-12 text-center text-ivory/70">
      <p className="font-script text-3xl text-gold-light">E &amp; J</p>
      <p className="mt-3 font-body text-xs uppercase tracking-[0.3em]">
        {weddingConfig.novios.nombres}
      </p>
      <p className="mt-4 font-body text-xs text-ivory/40">
        Hecho con amor para celebrar nuestra boda · {new Date().getFullYear()}
      </p>
    </footer>
  );
}
