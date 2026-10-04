import { prisma } from "./prisma";

/**
 * Genera un código único de invitación con el formato BODA-XXX.
 * Verifica contra la base de datos para evitar colisiones.
 */
export async function generateUniqueCode(prefix = "BODA"): Promise<string> {
  let attempt = 0;
  while (attempt < 20) {
    const count = await prisma.invitation.count();
    const nextNumber = count + 1 + attempt;
    const candidate = `${prefix}-${String(nextNumber).padStart(3, "0")}`;

    const existing = await prisma.invitation.findUnique({
      where: { codigo: candidate },
    });

    if (!existing) return candidate;
    attempt += 1;
  }
  // Fallback improbable: sufijo aleatorio
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

/**
 * Genera un código de verificación aleatorio único de 6 caracteres alfanuméricos.
 * Verifica contra la base de datos para evitar colisiones.
 */
export async function generateVerificationCode(): Promise<string> {
  let attempt = 0;
  while (attempt < 20) {
    const candidate = Math.random().toString(36).substring(2, 8).toUpperCase();

    const existing = await prisma.invitation.findUnique({
      where: { codigoVerificacion: candidate },
    });

    if (!existing) return candidate;
    attempt += 1;
  }
  // Fallback improbable
  return `V-${Date.now().toString(36).toUpperCase()}`;
}
