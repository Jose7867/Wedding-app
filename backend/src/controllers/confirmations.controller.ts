import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { generateVerificationCode } from "../utils/codeGenerator";
import { AuthenticatedRequest } from "../middleware/auth";

// ──────────────────────────────────────────────
// Schemas de validación
// ──────────────────────────────────────────────
const createSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  acompanantes: z.array(z.string().min(1)).default([]),
});

// ──────────────────────────────────────────────

/**
 * POST /api/confirmations
 * PÚBLICO — El invitado envía su solicitud de confirmación con su nombre y acompañantes.
 */
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { nombre, acompanantes } = createSchema.parse(req.body);

    const request = await prisma.confirmationRequest.create({
      data: {
        nombre,
        companions: {
          create: acompanantes.map((n) => ({ nombre: n })),
        },
      },
      include: { companions: true },
    });

    res.status(201).json({
      id: request.id,
      nombre: request.nombre,
      estado: request.estado,
      acompanantes: request.companions.map((c) => c.nombre),
      message: "Solicitud recibida. En breve recibirás tu código de identificación.",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/confirmations
 * ADMIN — Lista todas las solicitudes de confirmación, con filtro opcional por estado.
 */
export async function list(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { estado } = req.query as { estado?: string };

    const requests = await prisma.confirmationRequest.findMany({
      where: estado ? { estado } : undefined,
      include: { companions: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(
      requests.map((r) => ({
        id: r.id,
        nombre: r.nombre,
        estado: r.estado,
        codigoVerificacion: r.codigoVerificacion,
        acompanantes: r.companions.map((c) => c.nombre),
        createdAt: r.createdAt,
      }))
    );
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/confirmations/count-pending
 * ADMIN — Retorna el número de solicitudes pendientes (para el badge del menú).
 */
export async function countPending(
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const count = await prisma.confirmationRequest.count({
      where: { estado: "pendiente" },
    });
    res.json({ pendientes: count });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/confirmations/:id/accept
 * ADMIN — Acepta una solicitud y genera el código de verificación único.
 */
export async function accept(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    const existing = await prisma.confirmationRequest.findUnique({
      where: { id },
      include: { companions: true },
    });

    if (!existing) {
      return res.status(404).json({ error: "Solicitud no encontrada." });
    }

    if (existing.estado !== "pendiente") {
      return res.status(400).json({
        error: `La solicitud ya fue ${existing.estado}. No se puede volver a procesar.`,
      });
    }

    // Generar código de verificación único de 6 chars
    const codigoVerificacion = await generateVerificationCode();

    const updated = await prisma.confirmationRequest.update({
      where: { id },
      data: { estado: "aceptada", codigoVerificacion },
      include: { companions: true },
    });

    res.json({
      id: updated.id,
      nombre: updated.nombre,
      estado: updated.estado,
      codigoVerificacion: updated.codigoVerificacion,
      acompanantes: updated.companions.map((c) => c.nombre),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/confirmations/:id/reject
 * ADMIN — Rechaza una solicitud de confirmación.
 */
export async function reject(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    const existing = await prisma.confirmationRequest.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ error: "Solicitud no encontrada." });
    }

    if (existing.estado !== "pendiente") {
      return res.status(400).json({
        error: `La solicitud ya fue ${existing.estado}. No se puede modificar.`,
      });
    }

    const updated = await prisma.confirmationRequest.update({
      where: { id },
      data: { estado: "rechazada" },
    });

    res.json({ id: updated.id, nombre: updated.nombre, estado: updated.estado });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/confirmations/search?nombre=...
 * PÚBLICO — El invitado busca su solicitud por nombre para ver el estado y sus códigos.
 */
export async function searchByName(req: Request, res: Response, next: NextFunction) {
  try {
    const nombre = (req.query.nombre as string | undefined)?.trim();

    if (!nombre || nombre.length < 2) {
      return res.status(400).json({ error: "Ingresa al menos 2 caracteres para buscar." });
    }

    const results = await prisma.confirmationRequest.findMany({
      where: {
        nombre: { contains: nombre } as any,
      },
      include: { companions: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    res.json(
      results.map((r) => ({
        id: r.id,
        nombre: r.nombre,
        estado: r.estado,
        codigoVerificacion: r.estado === "aceptada" ? r.codigoVerificacion : null,
        acompanantes: r.companions.map((c) => c.nombre),
        createdAt: r.createdAt,
      }))
    );
  } catch (err) {
    next(err);
  }
}
