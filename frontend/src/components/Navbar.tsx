import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { weddingConfig } from "../utils/weddingConfig";

const links = [
  { href: "#historia", label: "Nuestra historia" },
  { href: "#pasaje", label: "El amor que nos une" },
  { href: "#evento", label: "El gran día" },
  { href: "#galeria", label: "Nuestros momentos" },
  { href: "#confirmar", label: "Verifica tu invitación" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled || open ? "bg-ivory/95 shadow-sm backdrop-blur" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#inicio" className="font-script text-2xl text-wine">
          E &amp; J
        </a>

        <ul className="hidden gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="font-body text-sm tracking-wide text-charcoal transition-colors hover:text-wine"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((v) => !v)}
          className="text-wine md:hidden"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {open && (
        <ul className="flex flex-col gap-1 bg-ivory px-6 pb-6 md:hidden">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                className="block py-3 font-body text-sm tracking-wide text-charcoal border-b border-gold/20"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
