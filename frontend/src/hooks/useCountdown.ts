import { useEffect, useState } from "react";

export interface CountdownParts {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
  finalizado: boolean;
}

function computeParts(target: Date): CountdownParts {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) {
    return { dias: 0, horas: 0, minutos: 0, segundos: 0, finalizado: true };
  }
  const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutos = Math.floor((diff / (1000 * 60)) % 60);
  const segundos = Math.floor((diff / 1000) % 60);
  return { dias, horas, minutos, segundos, finalizado: false };
}

/** Cuenta regresiva en vivo hacia una fecha objetivo (string ISO). */
export function useCountdown(targetIso: string): CountdownParts {
  const [parts, setParts] = useState<CountdownParts>(() => computeParts(new Date(targetIso)));

  useEffect(() => {
    const target = new Date(targetIso);
    const interval = setInterval(() => setParts(computeParts(target)), 1000);
    return () => clearInterval(interval);
  }, [targetIso]);

  return parts;
}
